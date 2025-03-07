import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('Configuration Error: Missing VITE_STRIPE_PUBLISHABLE_KEY');
  throw new Error('Missing Stripe publishable key');
}

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Only define plan features in client code, not sensitive pricing details
export const PLANS = {
  free: {
    name: '500 Words',
    price: 0,
    monthly_words: 500,
    max_request_words: 250,
    features: [
      '500 words per month',
      'Up to 250 words per request'
    ]
  },
  premium: {
    name: '10,000 Words',
    price: 10,
    priceId: "price_1Qq5NqFfiJfL6EMieNtdAzFk",
    productId: 'prod_RjYUNTzdWRIChO',
    monthly_words: 10000,
    max_request_words: 500,
    features: [
      '10,000 words per month',
      'Up to 500 words per request'
    ]
  },
  "premium+": {
    name: '25,000 Words',
    price: 20,
    priceId: 'price_1Qq5TAFfiJfL6EMiBcQHGdUx',
    productId: 'prod_RjYaNSCSSf4pEb',
    monthly_words: 25000,
    max_request_words: 1000,
    features: [
      '25,000 words per month',
      'Up to 1,000 words per request'
    ]
  },
  pro: {
    name: '50,000 Words',
    price: 30,
    priceId: 'price_1QvrMxFfiJfL6EMiBTkaRSsP',
    productId: 'prod_RpWPW2K2oaVwqA',
    monthly_words: 50000,
    max_request_words: 2000,
    features: [
      '50,000 words per month',
      'Up to 2,000 words per request'
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
      .select('stripe_customer_id, plan')
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

    let retryAttempts = 0;
    const maxRetries = 2;
    let response;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const checkoutEndpoint = `${supabaseUrl}/functions/v1/create-checkout-session`;
    
    console.log(`Client: Using checkout endpoint: ${checkoutEndpoint}`);
    
    while (retryAttempts <= maxRetries) {
      try {
        response = await fetch(checkoutEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify(requestBody),
        });
        break; // If successful, exit the loop
      } catch (error) {
        retryAttempts++;
        if (retryAttempts > maxRetries) throw error;
        console.log(`Retrying API request, attempt ${retryAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }

    if (!response) {
      throw new Error('Failed to make API request after retries');
    }

    console.log('🔵 [4] API response status:', response.status);
    if (!response.ok) {
      let errorMessage = 'API Error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        try {
          errorMessage = await response.text() || errorMessage;
        } catch {
          errorMessage = `API Error: ${response.statusText}`;
        }
      }
      console.error('🔴 [5] API Error:', errorMessage);
      throw new Error(errorMessage);
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

export async function createPortalSession() {
  console.log('Client: Creating Stripe Portal Session');
  
  try {
    // Use Supabase Edge Function URL instead of the local API route
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const portalEndpoint = `${supabaseUrl}/functions/v1/create-portal-session`;
    
    console.log(`Client: Using portal endpoint: ${portalEndpoint}`);
    
    // Get session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(portalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      }
    });

    if (!response.ok) {
      let errorMessage = `Failed to create portal session (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `API Error: ${errorData.error}`;
        }
      } catch (e) {
        errorMessage = `API Error: ${response.statusText}`;
      }
      console.error('Client: Portal Session API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    const { url } = await response.json();
    
    if (!url) {
      console.error('Client: No portal URL in response');
      throw new Error('Invalid response: No portal URL');
    }
    
    console.log('Client: Redirecting to portal URL');
    window.location.href = url;
    
    return url;
  } catch (error) {
    console.error('Client: Portal Session Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}