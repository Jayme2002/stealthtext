import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@17.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("VITE_STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-01-27.acacia",
  httpClient: Stripe.createFetchHttpClient()
});

const secret = Deno.env.get("VITE_STRIPE_WEBHOOK_SECRET")!;

const handler = async (req: Request) => {
  const signature = req.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }
  
  const body = await req.text();
  
  console.log("Received webhook with signature:", signature);
  console.log("Webhook raw body:", body);

  const cryptoProvider = Stripe.createSubtleCryptoProvider();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secret,
      undefined,
      cryptoProvider
    );
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
          plan: subscription.items.data[0].price.id,
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
      const { data, error } = await supabase.rpc("handle_stripe_subscription_updated", {
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        plan: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
      });
      
      console.log("Subscription update result:", { data, error });
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.created":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      const subscription = event.data.object;
      await supabase.rpc("handle_stripe_subscription_updated", {
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        plan: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
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
  return priceId.includes('premium') ? 'premium' 
       : priceId.includes('pro') ? 'pro'
       : 'free';
}

// Log a startup message so you know the function has been loaded
console.log("Stripe Webhook function loaded, ready to receive requests.");

serve(handler);