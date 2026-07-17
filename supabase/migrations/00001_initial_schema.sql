
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','moderator','user')),
  is_suspended boolean NOT NULL DEFAULT false,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- NOMINEES
-- ============================================================
CREATE TABLE nominees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  stage_name text,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  biography text,
  phone text,
  email text NOT NULL,
  province text,
  district text,
  profile_picture_url text,
  banner_image_url text,
  facebook text,
  instagram text,
  tiktok text,
  youtube text,
  website text,
  whatsapp text,
  payment_proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason text,
  is_featured boolean NOT NULL DEFAULT false,
  vote_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SPONSORS
-- ============================================================
CREATE TABLE sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  logo_url text,
  rep_name text,
  email text,
  phone text,
  website text,
  address text,
  package text,
  description text,
  banner_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PARTNERS
-- ============================================================
CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  logo_url text,
  email text,
  phone text,
  website text,
  description text,
  address text,
  rep_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('registration','voting')),
  nominee_id uuid REFERENCES nominees(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  votes_count int,
  payment_proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes text,
  transaction_ref text UNIQUE DEFAULT ('TXN-' || substr(gen_random_uuid()::text,1,8)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  votes_count int NOT NULL DEFAULT 1,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  summary text,
  content text,
  image_url text,
  is_published boolean NOT NULL DEFAULT false,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- GALLERY
-- ============================================================
CREATE TABLE gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  category text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('nominees', 'nominees', true),
  ('payments', 'payments', false),
  ('sponsors', 'sponsors', true),
  ('gallery', 'gallery', true),
  ('news', 'news', true),
  ('site', 'site', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- HELPER FUNCTION: is_admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator')
  );
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- RLS
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE USING (is_admin());

-- nominees
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nominees_select_approved" ON nominees FOR SELECT USING (status = 'approved' OR is_admin() OR user_id = auth.uid());
CREATE POLICY "nominees_insert_any" ON nominees FOR INSERT WITH CHECK (true);
CREATE POLICY "nominees_update_admin" ON nominees FOR UPDATE USING (is_admin() OR user_id = auth.uid());
CREATE POLICY "nominees_delete_admin" ON nominees FOR DELETE USING (is_admin());

-- sponsors
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors_select_approved" ON sponsors FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "sponsors_insert_any" ON sponsors FOR INSERT WITH CHECK (true);
CREATE POLICY "sponsors_update_admin" ON sponsors FOR UPDATE USING (is_admin());
CREATE POLICY "sponsors_delete_admin" ON sponsors FOR DELETE USING (is_admin());

-- partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_select_approved" ON partners FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "partners_insert_any" ON partners FOR INSERT WITH CHECK (true);
CREATE POLICY "partners_update_admin" ON partners FOR UPDATE USING (is_admin());
CREATE POLICY "partners_delete_admin" ON partners FOR DELETE USING (is_admin());

-- payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "payments_insert_auth" ON payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "payments_update_admin" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_delete_admin" ON payments FOR DELETE USING (is_admin());

-- votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_own" ON votes FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "votes_insert_admin" ON votes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "votes_update_admin" ON votes FOR UPDATE USING (is_admin());
CREATE POLICY "votes_delete_admin" ON votes FOR DELETE USING (is_admin());

-- news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_select_published" ON news FOR SELECT USING (is_published OR is_admin());
CREATE POLICY "news_insert_admin" ON news FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "news_update_admin" ON news FOR UPDATE USING (is_admin());
CREATE POLICY "news_delete_admin" ON news FOR DELETE USING (is_admin());

-- gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_select_all" ON gallery FOR SELECT USING (true);
CREATE POLICY "gallery_insert_admin" ON gallery FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "gallery_update_admin" ON gallery FOR UPDATE USING (is_admin());
CREATE POLICY "gallery_delete_admin" ON gallery FOR DELETE USING (is_admin());

-- site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_select_all" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_insert_admin" ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "site_settings_update_admin" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "site_settings_delete_admin" ON site_settings FOR DELETE USING (is_admin());

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "audit_logs_insert_all" ON audit_logs FOR INSERT WITH CHECK (true);

-- contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert_all" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_select_admin" ON contact_messages FOR SELECT USING (is_admin());
CREATE POLICY "contact_update_admin" ON contact_messages FOR UPDATE USING (is_admin());

-- announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT USING (true);
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE USING (is_admin());
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE USING (is_admin());

-- ============================================================
-- STORAGE POLICIES
-- ============================================================
CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "auth_upload_avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "public_read_nominees" ON storage.objects FOR SELECT USING (bucket_id = 'nominees');
CREATE POLICY "upload_nominees" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nominees');
CREATE POLICY "admin_read_payments" ON storage.objects FOR SELECT USING (bucket_id = 'payments' AND (auth.uid() IS NOT NULL));
CREATE POLICY "upload_payments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payments' AND auth.uid() IS NOT NULL);
CREATE POLICY "public_read_sponsors" ON storage.objects FOR SELECT USING (bucket_id = 'sponsors');
CREATE POLICY "upload_sponsors" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sponsors');
CREATE POLICY "public_read_gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "admin_upload_gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "public_read_news" ON storage.objects FOR SELECT USING (bucket_id = 'news');
CREATE POLICY "admin_upload_news" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'news' AND auth.uid() IS NOT NULL);
CREATE POLICY "public_read_site" ON storage.objects FOR SELECT USING (bucket_id = 'site');
CREATE POLICY "admin_upload_site" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site' AND auth.uid() IS NOT NULL);

-- ============================================================
-- TRIGGER: auto create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: approve_payment (atomic vote addition)
-- ============================================================
CREATE OR REPLACE FUNCTION approve_payment(payment_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p payments%ROWTYPE;
BEGIN
  SELECT * INTO p FROM payments WHERE id = payment_id_param;
  IF p.status = 'approved' THEN
    RAISE EXCEPTION 'Payment already approved';
  END IF;
  UPDATE payments SET status = 'approved', updated_at = now() WHERE id = payment_id_param;
  IF p.payment_type = 'voting' AND p.nominee_id IS NOT NULL THEN
    INSERT INTO votes (user_id, nominee_id, category_id, votes_count, payment_id)
    SELECT p.user_id, p.nominee_id, n.category_id, COALESCE(p.votes_count, 1), p.id
    FROM nominees n WHERE n.id = p.nominee_id;
    UPDATE nominees SET vote_count = vote_count + COALESCE(p.votes_count, 1)
    WHERE id = p.nominee_id;
  END IF;
END;
$$;

-- ============================================================
-- SEED DATA: Categories
-- ============================================================
INSERT INTO categories (name, sort_order) VALUES
  ('Best Local Business Award', 1),
  ('Best Night Club Award', 2),
  ('Best Local Hospitality Award', 3),
  ('Best Social Media Page Award', 4),
  ('Best Influencer Award', 5),
  ('Best Photographer Award', 6),
  ('Best Videographer Award', 7),
  ('Best Event Award', 8),
  ('Best Model Award', 9),
  ('Best Dancer / Dance Group Award', 10),
  ('Best Provincial Male Artist of the Year', 11),
  ('Best Provincial Female Artist of the Year', 12),
  ('Best Music Video Award', 13),
  ('Best Gospel Artist Award', 14),
  ('Song of the Year Award', 15),
  ('Best Music Producer Award', 16),
  ('Best Comedian of the Year Award', 17),
  ('Best Provincial Club DJ Award', 18),
  ('Best Radio Station Award', 19),
  ('Best Tour Agency Award', 20),
  ('Best Newcomer (Male)', 21),
  ('Best Newcomer (Female)', 22),
  ('Best Band Award', 23),
  ('Best Female Artist Award', 24),
  ('Best Male Artist Award', 25);

-- ============================================================
-- SEED DATA: Site Settings
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('website_name', '"MOSI-OA - TUNYA SOUTHERN AWARDS"'),
  ('header_text', '"MOSI-OA - TUNYA AWARDS 2026"'),
  ('awards_night_date', '"2026-12-31T20:00:00"'),
  ('voting_fee', '10'),
  ('nomination_fee', '100'),
  ('currency', '"K"'),
  ('currency_code', '"ZMW"'),
  ('payments_enabled', 'true'),
  ('mobile_money_number', '"0962267118"'),
  ('account_name', '"TUNYA AWARDS"'),
  ('bank_name', '"Zambia National Bank"'),
  ('bank_account', '"1234567890"'),
  ('payment_instructions', '"1. Send payment to Mobile Money number 0962267118\n2. Screenshot your payment confirmation\n3. Upload the screenshot as payment proof\n4. Our team will verify within 24 hours"'),
  ('help_number', '"0962267118"'),
  ('help_email', '"info@tunyaawards.com"'),
  ('whatsapp_number', '"260962267118"'),
  ('facebook', '"https://facebook.com/tunyaawards"'),
  ('instagram', '"https://instagram.com/tunyaawards"'),
  ('tiktok', '"https://tiktok.com/@tunyaawards"'),
  ('youtube', '"https://youtube.com/@tunyaawards"'),
  ('twitter', '"https://twitter.com/tunyaawards"'),
  ('meta_title', '"MOSI-OA - TUNYA SOUTHERN AWARDS 2026"'),
  ('meta_description', '"Vote for your favorite nominees at the TUNYA SOUTHERN AWARDS 2026. The premier awards ceremony celebrating excellence in Southern Zambia."'),
  ('about_content', '"The TUNYA SOUTHERN AWARDS is the most prestigious awards ceremony in Southern Zambia, celebrating excellence across music, business, entertainment, and more."'),
  ('footer_text', '"© 2026 MOSI-OA - TUNYA SOUTHERN AWARDS. All rights reserved."'),
  ('manual_verification', 'true'),
  ('payment_methods', '["Mobile Money", "Bank Transfer"]');

-- Seed FAQs as announcements
INSERT INTO announcements (title, content, is_active) VALUES
  ('How do I vote?', 'Select your favorite nominee, choose the number of votes, pay via Mobile Money, upload payment proof, and submit. Votes are added after payment verification.', true),
  ('How do I register as a nominee?', 'Fill out the nominee registration form, upload your profile picture and payment proof of K100 registration fee. Our team will review and approve your application.', true),
  ('What is the voting fee?', 'Votes are priced at K10 each. You can purchase 1, 5, 10, or 20 votes at a time.', true),
  ('When is Awards Night?', 'The TUNYA AWARDS 2026 ceremony is scheduled for December 31, 2026. Date and venue details will be announced closer to the event.', true),
  ('How long does payment verification take?', 'Payment verification typically takes 24-48 hours. You will receive an email notification once your payment is confirmed.', true);
