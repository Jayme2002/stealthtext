import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Extremely thorough URL cleaning to handle any format issues
function cleanUrl(url: string): string {
  // Remove quotes, backslashes, and unnecessary spaces
  let cleaned = url.replace(/["'\\]/g, '').trim();
  
  // Remove URL encoding
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // If decoding fails, continue with the original cleaned string
  }
  
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

// Initialize Supabase client with environment variables
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Use non-VITE prefixed env var with fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Clean the URL
const formattedUrl = cleanUrl(rawSupabaseUrl);

console.log('[API] Using Supabase URL:', formattedUrl);

const supabase = createClient(formattedUrl, supabaseKey, {
  global: {
    headers: {
      'X-Client-Info': 'stealth-writer'
    }
  }
});

// Initialize Stripe - use non-VITE prefixed env var with fallback
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY || '';
if (!stripeSecretKey) {
  throw new Error('Missing Stripe Secret Key');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

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
        { status: 401, headers }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers }
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
        { status: 500, headers }
      );
    }

    if (!subscription?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }), 
        { status: 400, headers }
      );
    }

    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/account`,
    });

    return new Response(
      JSON.stringify({ url: session.url }), 
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Portal session error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create portal session'
      }), 
      { status: 500, headers }
    );
  }
} 