# NinjaText

A secure text processing application with Stripe subscription integration.

## Production Deployment Guide

Follow these steps carefully to fix the current production issues and securely deploy the application:

### 1. Vercel Environment Variables

Log into your Vercel dashboard and set the following environment variables for your project:

```
VITE_SUPABASE_URL=https://qbdzfdqnnhdprwvdnlkn.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_STRIPE_PUBLISHABLE_KEY=[your-publishable-key]
VITE_STRIPE_SECRET_KEY=[your-secret-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
VITE_APP_URL=https://www.ninjatext.com
VITE_STRIPE_WEBHOOK_SECRET=[your-webhook-secret]
VITE_OPENAI_API_KEY=[your-openai-key]
VITE_HUMANIZED_AI_API_KEY=[your-humanized-ai-key]
```

Make sure to set these variables both in your main deployment and in your "Preview" and "Development" environments.

### 2. Stripe Webhook Configuration

1. Log into your Stripe dashboard
2. Go to Developers > Webhooks
3. Update your webhook endpoint to point to: `https://www.ninjatext.com/api-serverless/stripe-webhook`
4. Make sure the following events are enabled:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `payment_intent.succeeded`

### 3. Supabase Configuration

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Run the SQL migrations located in the `supabase/migrations` folder if they haven't been applied
4. Verify that the `subscriptions` table exists with the proper RLS policies

### 4. DNS and SSL Configuration

Make sure your domain is properly configured with:
- HTTPS enabled
- Proper DNS records pointing to your Vercel deployment
- No mixed content warnings

### 5. Testing the Deployment

1. Test the subscription flow with a Stripe test card
2. Verify that the customer portal works correctly
3. Check that webhook events are being received and processed

### 6. Monitoring and Debugging

If you encounter issues in production:

1. Check Vercel deployment logs
2. Check Stripe webhook events logs
3. Verify Supabase database operations
4. Monitor API request/response flows in browser developer tools

## Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your development environment variables
4. Start the development server:
   ```
   npm run dev
   ```

## Security Best Practices

- Never expose API keys or secrets in client-side code
- Use RLS policies in Supabase to restrict data access
- Use proper CORS restrictions on API endpoints
- Implement proper validation for all user inputs 