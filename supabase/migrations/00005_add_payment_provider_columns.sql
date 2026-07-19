-- Add payment provider columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS provider_ref text,
ADD COLUMN IF NOT EXISTS provider_status text;

-- Add comments
COMMENT ON COLUMN payments.provider IS 'Payment provider (lipila, flutterwave, manual, etc.)';
COMMENT ON COLUMN payments.provider_ref IS 'Reference ID from payment provider';
COMMENT ON COLUMN payments.provider_status IS 'Status from payment provider (created, pending, completed, failed, etc.)';
