-- Automatic voting payments (Paystack) — keeps manual proof flow as fallback

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_ref text,
  ADD COLUMN IF NOT EXISTS provider_status text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_ref_unique
  ON payments (provider_ref)
  WHERE provider_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_provider_status_idx
  ON payments (provider, provider_status);

-- Atomic approve: admins (manual) or service_role (Paystack webhook/verify)
CREATE OR REPLACE FUNCTION approve_payment(payment_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p payments%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized to approve payments';
  END IF;

  SELECT * INTO p FROM payments WHERE id = payment_id_param FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  IF p.status = 'approved' THEN
    RETURN; -- idempotent for webhook retries
  END IF;
  IF p.status = 'rejected' THEN
    RAISE EXCEPTION 'Cannot approve a rejected payment';
  END IF;

  UPDATE payments
  SET
    status = 'approved',
    paid_at = COALESCE(paid_at, now()),
    provider_status = COALESCE(provider_status, 'success'),
    updated_at = now()
  WHERE id = payment_id_param;

  IF p.payment_type = 'voting' AND p.nominee_id IS NOT NULL THEN
    INSERT INTO votes (user_id, nominee_id, category_id, votes_count, payment_id)
    SELECT p.user_id, p.nominee_id, n.category_id, COALESCE(p.votes_count, 1), p.id
    FROM nominees n WHERE n.id = p.nominee_id;

    UPDATE nominees
    SET vote_count = vote_count + COALESCE(p.votes_count, 1)
    WHERE id = p.nominee_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION approve_payment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION approve_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_payment(uuid) TO service_role;

-- Enable automatic voting by default (manual proof remains available if flipped back on)
INSERT INTO site_settings (key, value) VALUES
  ('manual_verification', 'false'::jsonb),
  ('payment_provider', '"lipila"'::jsonb),
  ('payment_methods', '["Mobile Money", "Card"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
