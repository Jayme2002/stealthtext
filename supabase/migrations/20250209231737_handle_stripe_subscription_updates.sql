CREATE OR REPLACE FUNCTION handle_stripe_subscription_updated(
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz,
  cancel_at timestamptz,
  will_cancel_at_period_end boolean,
  cancellation_effective_date timestamptz
)
RETURNS void AS $$
BEGIN
  -- First try to update existing subscription
  UPDATE subscriptions SET
    stripe_subscription_id = $2,
    plan = $3,
    status = $4,
    current_period_end = $5,
    cancel_at = $6,
    will_cancel_at_period_end = $7,
    cancellation_effective_date = $8,
    updated_at = NOW()
  WHERE stripe_customer_id = $1;

  -- If no rows updated, insert new subscription
  IF NOT FOUND THEN
    INSERT INTO subscriptions(
      user_id, 
      stripe_customer_id,
      stripe_subscription_id,
      plan,
      status,
      current_period_end,
      cancel_at,
      will_cancel_at_period_end,
      cancellation_effective_date
    )
    SELECT 
      id,
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    FROM auth.users 
    WHERE id IN (
      SELECT user_id FROM subscriptions 
      WHERE stripe_customer_id = $1
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
