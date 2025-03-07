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

// Initialize Stripe
const rawStripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("VITE_STRIPE_SECRET_KEY") || '';
const stripeSecretKey = cleanString(rawStripeSecretKey);

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
    const rawSupabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL") || '';
    const rawSupabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY") || '';

    // Clean the strings
    const supabaseKey = cleanString(rawSupabaseKey);
    const formattedUrl = cleanUrl(rawSupabaseUrl);

    console.log('[Edge Function] Using Supabase URL:', formattedUrl);

    const supabase = createClient(formattedUrl, supabaseKey);

    // Get the authenticated user by extracting the token from the Authorization header or cookies
    let token;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const cookieHeader = req.headers.get('cookie') || "";
      token = cookieHeader.split('sb:token=')[1]?.split(';')[0];
    }
    
    if (!token) {
      console.error('No token found in either Authorization header or cookie');
      return new Response(
        JSON.stringify({ error: 'Unauthorized'}), 
        { status: 401, headers: getCorsHeaders() }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: getCorsHeaders() }
      );
    }

    // Get the user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription' }), 
        { status: 500, headers: getCorsHeaders() }
      );
    }

    if (!subscription?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }), 
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Create Stripe portal session
    // Hardcode the production URL to ensure proper redirects
    const appUrl = 'https://www.stealthtext.com';
    console.log(`Edge: Using hardcoded production URL for redirects: ${appUrl}`);
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/account`,
    });

    return new Response(
      JSON.stringify({ url: session.url }), 
      { status: 200, headers: getCorsHeaders() }
    );
  } catch (error) {
    console.error('Portal session error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create portal session',
        details: error instanceof Error ? (error as Error).stack : undefined
      }), 
      { status: 500, headers: getCorsHeaders() }
    );
  }
};

// Log a startup message so you know the function has been loaded
console.log("Create Portal Session Edge Function loaded, ready to receive requests.");

serve(handler); 