import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

console.log('[Webhook] Using Supabase URL:', formattedUrl);

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

// Webhook secret for verifying the event - use non-VITE prefixed version with fallback
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.VITE_STRIPE_WEBHOOK_SECRET || '';
if (!webhookSecret) {
  throw new Error('Missing Stripe Webhook Secret');
}

// Helper to map price IDs to plan names
function mapPriceToPlan(priceId: string) {
  return priceId === "price_1Qq5NqFfiJfL6EMieNtdAzFk" ? "premium" 
       : priceId === "price_1Qq5TAFfiJfL6EMiBcQHGdUx" ? "premium+" 
       : priceId === "price_1QvrMxFfiJfL6EMiBTkaRSsP" ? "pro"
       : "free";
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('Handling Stripe event:', event.type);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.metadata?.user_id) {
          console.error('Missing user_id in session metadata');
          break;
        }
        
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
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
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        let effectiveDate = subscription.cancel_at_period_end && subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null;
        
        // Fallback: if cancel_at_period_end is true but cancel_at is missing, use current_period_end
        if (subscription.cancel_at_period_end && !effectiveDate && subscription.current_period_end) {
          effectiveDate = new Date(subscription.current_period_end * 1000).toISOString();
        }
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            plan: mapPriceToPlan(subscription.items.data[0].price.id),
            status: subscription.status,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at: effectiveDate
          })
          .eq('stripe_customer_id', subscription.customer as string);
        
        if (error) {
          console.error('DB update failed in customer.subscription.updated', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (error) {
          console.error('DB update failed on cancellation:', error);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            plan: mapPriceToPlan(subscription.items.data[0].price.id),
            status: subscription.status,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString() 
              : null
          })
          .eq('stripe_customer_id', subscription.customer as string);
          
        if (error) {
          console.error(`DB update failed for event ${event.type}:`, error);
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 