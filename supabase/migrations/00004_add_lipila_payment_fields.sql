-- ============================================================
-- ADD LIPILA PAYMENT FIELDS TO PAYMENTS TABLE
-- ============================================================

-- Add Lipila-specific columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS lipila_reference text,
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'ZMW',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Update payment_type check constraint to include new types
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('registration', 'voting', 'vote', 'nominee_registration'));

-- Update status check constraint to include new statuses
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed'));

-- ============================================================
-- CREATE PAYMENT SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_settings (
  payment_type text PRIMARY KEY,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default payment settings
INSERT INTO payment_settings (payment_type, amount) VALUES
  ('vote', 10),
  ('nominee', 100)
ON CONFLICT (payment_type) DO UPDATE SET
  amount = EXCLUDED.amount,
  updated_at = now();

-- ============================================================
-- ADD IS_WINNER FIELD TO NOMINEES
-- ============================================================
ALTER TABLE nominees 
ADD COLUMN IF NOT EXISTS is_winner boolean NOT NULL DEFAULT false;

-- ============================================================
-- UPDATE RLS POLICIES FOR PAYMENT_SETTINGS
-- ============================================================
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_settings_select_all" ON payment_settings FOR SELECT USING (true);
CREATE POLICY "payment_settings_update_admin" ON payment_settings FOR UPDATE USING (is_admin());
