import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-01-27.acacia",
});

const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const handler = async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }
  
  const body = await req.text();
  
  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secret
    );

    const supabase = createClient(
      Deno.env.get("VITE_SUPABASE_URL")!,
      Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (event.type) {
      case "invoice.paid":
        const invoice = event.data.object;
        const { error: dbError } = await supabase.rpc("handle_stripe_subscription_updated", {
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          plan: invoice.lines.data[0].price.id,
          status: "active",
          current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          cancel_at: null
        });

        if (dbError) {
          console.error("Database update error:", dbError);
          throw new Error(`Failed to update subscription: ${dbError.message}`);
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated": 
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const subscription = event.data.object;
        await supabase.rpc("handle_stripe_subscription_updated", {
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          plan: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
        });
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
};

serve(handler);