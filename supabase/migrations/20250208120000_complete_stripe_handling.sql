-- Create consolidated subscriptions table with all necessary columns
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

-- Enable RLS and create policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Service role can manage all subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage all subscriptions"
      ON subscriptions FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can manage own subscription'
  ) THEN
    CREATE POLICY "Users can manage own subscription"
      ON subscriptions FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create comprehensive Stripe handling function
CREATE OR REPLACE FUNCTION handle_stripe_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan,
    status,
    current_period_end,
    cancel_at
  )
  VALUES (
    NEW.id,
    NEW.stripe_customer_id,
    NEW.stripe_subscription_id,
    CASE
      WHEN NEW.plan = 'price_1Qq5NqFfiJfL6EMieNtdAzFk' THEN 'premium'
      WHEN NEW.plan = 'price_1Qq5TAFfiJfL6EMiBcQHGdUx' THEN 'premium+'
      WHEN NEW.plan = 'price_1QqMstFfiJfL6EMinLoK8xcj' THEN 'pro'
      ELSE 'free'
    END,
    NEW.status,
    NEW.current_period_end,
    NEW.cancel_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at = EXCLUDED.cancel_at,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error processing Stripe event: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth.users
DROP TRIGGER IF EXISTS create_subscription_after_user_signup ON auth.users;
CREATE TRIGGER create_subscription_after_user_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_stripe_subscription_event();

-- Create update trigger for subscriptions
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at(); 