/*
  # Fix Subscription Setup

  1. Changes
    - Drop and recreate trigger to fix ordering
    - Ensure proper table permissions
    - Add missing RLS policies
    - Fix subscription creation on user signup
    - Add Stripe webhook handling

  2. Security
    - Maintains RLS
    - Ensures proper access control
*/

-- First, drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_subscription_after_user_signup ON auth.users;
DROP FUNCTION IF EXISTS create_subscription_for_new_user();

-- Ensure subscriptions table exists with proper structure
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;

-- Create updated function for new user subscription
CREATE OR REPLACE FUNCTION create_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'free',
    'active',
    now(),
    now()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but don't prevent user creation
    RAISE NOTICE 'Error creating subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create the trigger with proper timing
CREATE TRIGGER create_subscription_after_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_for_new_user();

-- Add function to handle Stripe webhook events
CREATE OR REPLACE FUNCTION handle_stripe_subscription_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscriptions
  SET
    stripe_subscription_id = NEW.stripe_subscription_id,
    plan = CASE
      WHEN NEW.plan = 'price_1Qq5NqFfiJfL6EMieNtdAzFk' THEN 'premium'
      WHEN NEW.plan = 'price_1Qq5TAFfiJfL6EMiBcQHGdUx' THEN 'premium+'
      WHEN NEW.plan = 'price_1QqMstFfiJfL6EMinLoK8xcj' THEN 'pro'
      ELSE 'free'
    END,
    status = NEW.status,
    current_period_end = NEW.current_period_end,
    cancel_at = NEW.cancel_at,
    updated_at = now()
  WHERE stripe_customer_id = NEW.stripe_customer_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Ensure subscriptions table has correct columns and constraints
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at timestamptz;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Ensure all necessary policies exist
DO $$ BEGIN
  -- Read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can read own subscription'
  ) THEN
    CREATE POLICY "Users can read own subscription"
      ON subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Service role policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Service role can manage all subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage all subscriptions"
      ON subscriptions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription"
      ON subscriptions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can insert own subscription'
  ) THEN
    CREATE POLICY "Users can insert own subscription"
      ON subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;