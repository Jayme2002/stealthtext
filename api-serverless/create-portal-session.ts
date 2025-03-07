import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
    'Access-Control-Allow-Credentials': 'true'
  };
}

// Initialize Stripe - use non-VITE prefixed env var with fallback
const rawStripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY || '';
const stripeSecretKey = cleanString(rawStripeSecretKey);

if (!stripeSecretKey) {
  console.error('Missing Stripe Secret Key');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

// Initialize Supabase client with environment variables
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Use non-VITE prefixed env var with fallback
const rawSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Clean the URL
const formattedUrl = cleanUrl(rawSupabaseUrl);
const supabaseKey = cleanString(rawSupabaseKey);

console.log('[API] Using Supabase URL:', formattedUrl);

const supabase = createClient(formattedUrl, supabaseKey);

export default async function handler(req: Request) {
  // Handle preflight OPTIONS request
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
      console.error('[API] No token found in either Authorization header or cookie');
      return new Response(
        JSON.stringify({ error: 'Unauthorized'}), 
        { status: 401, headers: getCorsHeaders() }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[API] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: getCorsHeaders() }
      );
    }

    console.log('[API] User authenticated:', user.id);

    // Get the user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error('[API] Subscription error:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription' }), 
        { status: 500, headers: getCorsHeaders() }
      );
    }

    if (!subscription?.stripe_customer_id) {
      console.error('[API] No active subscription found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }), 
        { status: 400, headers: getCorsHeaders() }
      );
    }

    console.log('[API] Found subscription with customer ID:', subscription.stripe_customer_id);

    // Create Stripe portal session with hardcoded production URL
    const appUrl = 'https://www.stealthtext.com';
    
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${appUrl}/account`,
      });
  
      console.log('[API] Created portal session with URL:', session.url);
      
      return new Response(
        JSON.stringify({ url: session.url }), 
        { status: 200, headers: getCorsHeaders() }
      );
    } catch (stripeError) {
      console.error('[API] Stripe error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: stripeError instanceof Error ? stripeError.message : 'Failed to create portal session',
          details: 'Stripe API error'
        }), 
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } catch (error) {
    console.error('[API] Handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create portal session',
        details: error instanceof Error ? error.stack : undefined
      }), 
      { status: 500, headers: getCorsHeaders() }
    );
  }
} 