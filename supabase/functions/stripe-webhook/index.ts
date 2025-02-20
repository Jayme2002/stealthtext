import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@17.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("VITE_STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-01-27.acacia",
  httpClient: Stripe.createFetchHttpClient()
});

const secret = Deno.env.get("VITE_STRIPE_WEBHOOK_SECRET")!;

async function verifyStripeSignatureAndParseEvent(body, header, secret) {
  const encoder = new TextEncoder();
  const parts = header.split(',').map(s => s.trim());
  let timestamp, v1Signature;
  for (const part of parts) {
    if (part.startsWith('t=')) {
      timestamp = part.slice(2);
    } else if (part.startsWith('v1=')) {
      v1Signature = part.slice(3);
    }
  }
  if (!timestamp || !v1Signature) {
    throw new Error('Invalid Stripe signature header format.');
  }
  const signedPayload = `${timestamp}.${body}`;
  const keyData = encoder.encode(secret);
  const algo = { name: 'HMAC', hash: 'SHA-256' };
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, algo, false, ['sign']);
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signedPayload));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // In production, use a timing-safe comparison here.
  if (expectedSignature !== v1Signature) {
    throw new Error('Signature verification failed');
  }

  return JSON.parse(body);
}

const handler = async (req: Request) => {
  const signature = req.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }
  
  const body = await req.text();
  
  console.log("Received webhook with signature:", signature);
  console.log("Webhook raw body:", body);

  let event;
  try {
    event = await verifyStripeSignatureAndParseEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(err.message, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log("Handling Stripe event:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (!session.metadata?.user_id) {
        console.error("Missing user_id in session metadata");
        break;
      }
      
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const { error } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan: mapPriceToPlan(subscription.items.data[0].price.id),
          status: 'active',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('user_id', session.metadata.user_id);

      if (error) {
        console.error('DB update failed:', {
          error,
          userId: session.metadata.user_id,
          customer: session.customer
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      let effectiveDate = subscription.cancel_at_period_end && subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null;
      
      // Fallback: if cancel_at_period_end is true but cancel_at is missing, use current_period_end
      if (subscription.cancel_at_period_end && !effectiveDate && subscription.current_period_end) {
        effectiveDate = new Date(subscription.current_period_end * 1000).toISOString();
      }
      
      const { error } = await supabase
        .from("subscriptions")
        .update({
          stripe_subscription_id: subscription.id,
          plan: mapPriceToPlan(subscription.items.data[0].price.id),
          status: subscription.status,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at: effectiveDate,
          will_cancel_at_period_end: subscription.cancel_at_period_end,
          cancellation_effective_date: effectiveDate
        })
        .eq("stripe_customer_id", subscription.customer);
      
      if (error) {
        console.error("DB update failed in customer.subscription.updated", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      let computedCancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null;
      // If the subscription is set to cancel at period end but no explicit cancel_at is provided, use current_period_end
      if (!computedCancelAt && subscription.cancel_at_period_end && subscription.current_period_end) {
        computedCancelAt = new Date(subscription.current_period_end * 1000).toISOString();
      }
      if (!computedCancelAt) {
        console.error("No cancellation end time provided for subscription deletion");
        break;
      }
      console.log("DEBUG: Computed cancel_at for deletion:", computedCancelAt);
      
      const { error } = await supabase
        .from("subscriptions")
        .update({
          cancel_at: computedCancelAt,
          status: "cancelled",
          will_cancel_at_period_end: subscription.cancel_at_period_end,
          cancellation_effective_date: computedCancelAt
        })
        .eq("stripe_subscription_id", subscription.id);
      
      if (error) {
        console.error("DB update failed on cancellation:", error);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      const subscription = event.data.object;
      await supabase.rpc("handle_stripe_subscription_updated", {
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        plan: mapPriceToPlan(subscription.items.data[0].price.id),
        status: subscription.status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        will_cancel_at_period_end: subscription.cancel_at_period_end,
        cancellation_effective_date: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
      });
      break;
    }

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);
      // Handle payment intent logic here
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

function mapPriceToPlan(priceId: string) {
  return priceId === "price_1Qq5NqFfiJfL6EMieNtdAzFk" ? "premium" 
       : priceId === "price_1Qq5TAFfiJfL6EMiBcQHGdUx" ? "premium+" 
       : priceId === "price_1QqMstFfiJfL6EMinLoK8xcj" ? "pro"
       : "free";
}

// Log a startup message so you know the function has been loaded
console.log("Stripe Webhook function loaded, ready to receive requests.");

serve(handler);