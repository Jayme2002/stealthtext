import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Use import.meta.env instead of process.env for Vite
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Configuration Error: Missing VITE_STRIPE_PUBLISHABLE_KEY');
}

// Log first few characters to debug mode (test vs live)
console.log(`Using Stripe publishable key (first 10 chars): ${STRIPE_PUBLISHABLE_KEY ? STRIPE_PUBLISHABLE_KEY.substring(0, 10) + '...' : 'undefined'}`);

// Set up Stripe with better error handling
let stripePromise;
try {
  stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

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
    
    // Use Supabase Edge Function URL instead of the local API route
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const checkoutEndpoint = `${supabaseUrl}/functions/v1/create-checkout-session`;
    
    console.log(`Client: Using checkout endpoint: ${checkoutEndpoint}`);
    console.log(`Client: Anon key available: ${supabaseAnonKey ? 'Yes (first 5 chars: ' + supabaseAnonKey.substring(0, 5) + '...)' : 'No'}`);
    
    while (retryAttempts <= maxRetries) {
      try {
        response = await fetch(checkoutEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Include apikey for Supabase Edge Functions (with fallback to Authorization)
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify(requestBody),
        });
        
        // Log complete response info
        console.log(`Client: API Response status: ${response.status} ${response.statusText}`);
        console.log('Client: API Response headers:', Object.fromEntries([...response.headers.entries()]));
        
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
    // Try Supabase Edge Function first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const portalEndpoint = `${supabaseUrl}/functions/v1/create-portal-session`;
    
    console.log(`Client: Using portal endpoint: ${portalEndpoint}`);
    
    // Get session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // Try the Supabase Edge Function first
    try {
      console.log('Client: Attempting to use Supabase Edge Function...');
      const response = await fetch(portalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey
        }
      });

      console.log(`Client: Portal API Response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const { url } = await response.json();
        
        if (!url) {
          throw new Error('Invalid response: No portal URL');
        }
        
        console.log('Client: Success! Redirecting to portal URL');
        window.location.href = url;
        return url;
      }
      
      // If Supabase Edge Function fails, throw an error to try the Vercel API instead
      throw new Error(`Supabase Edge Function failed with status ${response.status}`);
    } catch (error) {
      // If the Supabase Edge Function fails, fall back to the Vercel API
      console.log('Client: Supabase Edge Function failed, trying Vercel API instead...');
      
      // Try using the Vercel API instead
      const vercelResponse = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Client: Vercel API Response status: ${vercelResponse.status}`);
      
      if (!vercelResponse.ok) {
        let errorMessage = `Failed to create portal session (${vercelResponse.status})`;
        try {
          const errorData = await vercelResponse.json();
          if (errorData.error) {
            errorMessage = `API Error: ${errorData.error}`;
          }
        } catch (e) {
          errorMessage = `API Error: ${vercelResponse.statusText}`;
        }
        console.error('Client: Portal Session API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const { url } = await vercelResponse.json();
      
      if (!url) {
        console.error('Client: No portal URL in response');
        throw new Error('Invalid response: No portal URL');
      }
      
      console.log('Client: Redirecting to portal URL');
      window.location.href = url;
      
      return url;
    }
  } catch (error) {
    console.error('Client: Portal Session Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}