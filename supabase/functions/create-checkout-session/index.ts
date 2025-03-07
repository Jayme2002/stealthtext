import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@17.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Clean strings by removing quotes, extra spaces, and decoding any URL-encoded parts
function cleanString(str: string): string {
  // First remove any surrounding quotes and trim spaces
  let cleaned = str.trim().replace(/^["'](.*)["']$/, '$1');
  
  // Handle any URL-encoded quotes or other characters
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // Continue with what we have if decoding fails
  }
  
  // Clean any remaining problematic characters
  cleaned = cleaned.replace(/["'\\]/g, '');
  
  return cleaned;
}

// Extremely thorough URL cleaning
function cleanUrl(url: string): string {
  // First use the general string cleaner
  let cleaned = cleanString(url);
  
  // Fix double https:// issues
  cleaned = cleaned.replace(/https?:\/\/https?:\/\//, 'https://');
  
  // Ensure the URL doesn't end with a trailing slash for auth endpoints
  cleaned = cleaned.replace(/\/$/, '');
  
  // If there's no protocol, add https://
  if (!cleaned.match(/^https?:\/\//)) {
    cleaned = `https://${cleaned}`;
  }
  
  return cleaned;
}

// CORS headers to allow cross-origin requests
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your domain
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };
}

// Type definitions
interface RequestBody {
  priceId: string;
  userId: string;
  customerEmail: string;
  customerId?: string;
}

// Initialize Stripe
const rawStripeSecretKey = Deno.env.get("VITE_STRIPE_SECRET_KEY");
const stripeSecretKey = cleanString(rawStripeSecretKey || '');

if (!stripeSecretKey) {
  console.error('Missing Stripe Secret Key');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia",
  httpClient: Stripe.createFetchHttpClient()
});

const handler = async (req: Request) => {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders()
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: getCorsHeaders()
    });
  }

  try {
    const rawSupabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || '';
    const rawSupabaseKey = Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY") || '';

    // Clean the strings
    const supabaseKey = cleanString(rawSupabaseKey);
    const formattedUrl = cleanUrl(rawSupabaseUrl);

    console.log('[Edge Function] Using Supabase URL:', formattedUrl);

    const supabase = createClient(formattedUrl, supabaseKey);

    const body: RequestBody = await req.json();
    const { priceId, userId, customerEmail } = body;

    console.log('Edge: Processing request for:', { userId, customerEmail, priceId });

    // First, check if a subscription record exists
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Edge: Error fetching subscription:', subscriptionError);
      throw new Error('Failed to fetch subscription data');
    }

    let customer;
    let stripeCustomerId = existingSubscription?.stripe_customer_id;

    if (stripeCustomerId) {
      console.log('Edge: Found existing customer:', stripeCustomerId);
      customer = await stripe.customers.retrieve(stripeCustomerId);
    } else {
      // Create new Stripe customer first
      console.log('Edge: Creating new Stripe customer');
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;

      if (existingSubscription) {
        // Update existing subscription with Stripe customer ID
        console.log('Edge: Updating existing subscription with customer ID:', stripeCustomerId);
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Edge: Failed to update subscription:', updateError);
          throw new Error('Failed to update subscription with customer ID');
        }
      } else {
        // Create new subscription record
        console.log('Edge: Creating new subscription record');
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
          console.error('Edge: Failed to create subscription record:', createError);
          throw new Error('Failed to create subscription record');
        }
      }
    }

    // Create Stripe checkout session
    console.log('Edge: Creating checkout session');
    const rawAppUrl = Deno.env.get("VITE_APP_URL") || 'http://localhost:3000';
    const appUrl = cleanUrl(rawAppUrl);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      currency: 'usd',
      customer: stripeCustomerId,
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        user_id: userId
      }
    });

    console.log('Edge: Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200,
        headers: getCorsHeaders()
      }
    );
  } catch (error) {
    console.error('Edge: Handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? (error as Error).stack : undefined
      }),
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    );
  }
};

// Log a startup message so you know the function has been loaded
console.log("Create Checkout Session Edge Function loaded, ready to receive requests.");

serve(handler); 