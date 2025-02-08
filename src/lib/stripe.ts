import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('Configuration Error: Missing VITE_STRIPE_PUBLISHABLE_KEY');
  throw new Error('Missing Stripe publishable key');
}

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 1,000 words per month',
      'Basic AI detection',
      'Standard support',
      'Single user'
    ]
  },
  PREMIUM: {
    name: 'StealthText Premium',
    price: 10,
    priceId: 'price_1Qq5TsFfiJfL6EMi4Wog6LRx',
    productId: 'prod_RjYUNTzdWRIChO',
    features: [
      'Up to 10,000 words per month',
      'Advanced AI detection',
      'Priority support',
      'Team collaboration',
      'API access'
    ]
  },
  PREMIUM_PLUS: {
    name: 'StealthText Premium+',
    price: 20,
    productId: 'prod_RjYaNSCSSf4pEb',
    features: [
      'Up to 50,000 words per month',
      'Enterprise AI detection',
      '24/7 priority support',
      'Advanced team features',
      'Custom API integration',
      'Analytics dashboard'
    ]
  },
  PRO: {
    name: 'StealthText Pro',
    price: 30,
    productId: 'prod_RjYbe5FxvDSN9K',
    features: [
      'Unlimited words',
      'Custom AI detection rules',
      'Dedicated support',
      'Enterprise features',
      'White-label options',
      'Advanced analytics',
      'Custom integrations'
    ]
  }
};

export async function createCheckoutSession(priceId: string) {
  console.log('Client: Starting checkout session creation for price:', priceId);
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Client: Authentication Error:', authError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      console.error('Client: No authenticated user found');
      throw new Error('User not authenticated');
    }

    console.log('Client: Fetching subscription data for user:', user.id);
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Client: Subscription Query Error:', subscriptionError);
      throw new Error('Failed to fetch subscription data');
    }

    const requestBody = {
      priceId,
      userId: user.id,
      customerEmail: user.email,
      customerId: subscription?.stripe_customer_id
    };

    console.log('Client: Making API request with body:', requestBody);
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Client: Checkout Session Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const responseData = await response.json();
    console.log('Client: Response data:', responseData);

    if (!responseData.sessionId) {
      console.error('Client: No session ID in response');
      throw new Error('Invalid response: No session ID');
    }

    console.log('Client: Loading Stripe...');
    const stripe = await stripePromise;
    
    if (!stripe) {
      console.error('Client: Stripe failed to load');
      throw new Error('Stripe failed to load');
    }
    
    console.log('Client: Redirecting to checkout with session ID:', responseData.sessionId);
    const { error: redirectError } = await stripe.redirectToCheckout({ 
      sessionId: responseData.sessionId 
    });
    
    if (redirectError) {
      console.error('Client: Redirect Error:', redirectError);
      throw redirectError;
    }
  } catch (error) {
    console.error('Client: Checkout Session Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}