import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Use non-VITE prefixed env var with fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Format URL if needed
const formattedUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

const supabase = createClient(formattedUrl, supabaseKey, {
  global: {
    headers: {
      'X-Client-Info': 'stealth-writer'
    }
  }
});

// Initialize Stripe - use non-VITE prefixed env var with fallback
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing Stripe Secret Key');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

// Type definitions
interface RequestBody {
  priceId: string;
  userId: string;
  customerEmail: string;
  customerId?: string;
}

export default async function handler(req: Request) {
  // CORS headers to allow client-side requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });
  }

  try {
    const body: RequestBody = await req.json();
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
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      currency: 'usd',
      customer: stripeCustomerId,
      success_url: `${process.env.VITE_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        user_id: userId
      }
    });

    console.log('API: Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200,
        headers
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
        headers
      }
    );
  }
} 