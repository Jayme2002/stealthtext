import Stripe from 'stripe';
import { supabase } from '../src/lib/supabaseServer';

if (!process.env.VITE_STRIPE_SECRET_KEY) {
  throw new Error('Missing VITE_STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { priceId, userId, customerEmail } = body;

    console.log('API: Processing request for:', { userId, customerEmail, priceId });

    // First, check if a subscription record exists
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscriptionError) {
      console.error('API: Error fetching subscription:', subscriptionError);
      throw new Error('Failed to fetch subscription data');
    }

    let customer;
    let stripeCustomerId = existingSubscription?.stripe_customer_id;

    if (stripeCustomerId) {
      console.log('API: Found existing customer:', stripeCustomerId);
      customer = await stripe.customers.retrieve(stripeCustomerId);
    } else {
      // Create new Stripe customer first
      console.log('API: Creating new Stripe customer');
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;

      if (existingSubscription) {
        // Update existing subscription with Stripe customer ID
        console.log('API: Updating existing subscription with customer ID:', stripeCustomerId);
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('API: Failed to update subscription:', updateError);
          throw new Error('Failed to update subscription with customer ID');
        }
      } else {
        // Create new subscription record
        console.log('API: Creating new subscription record');
        const { error: createError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            plan: 'free',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (createError) {
          console.error('API: Failed to create subscription record:', createError);
          throw new Error('Failed to create subscription record');
        }
      }
    }

    // Create Stripe checkout session
    console.log('API: Creating checkout session');
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      allow_promotion_codes: true
    });

    console.log('API: Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('API: Handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}