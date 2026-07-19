-- MOSI-OA TUNYA SOUTHERN AWARDS SCHEMA --

CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE status_type AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_type AS ENUM ('registration', 'voting');
CREATE TYPE media_type AS ENUM ('image', 'video');

-- PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'user',
    is_suspended BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOMINEES
CREATE TABLE nominees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    stage_name TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    biography TEXT,
    phone TEXT,
    email TEXT NOT NULL,
    province TEXT,
    district TEXT,
    profile_picture_url TEXT,
    banner_image_url TEXT,
    facebook TEXT,
    instagram TEXT,
    tiktok TEXT,
    youtube TEXT,
    website TEXT,
    whatsapp TEXT,
    payment_proof_url TEXT,
    status status_type DEFAULT 'pending',
    rejection_reason TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    vote_count INT DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORS
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    logo_url TEXT,
    rep_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    package TEXT,
    description TEXT,
    banner_url TEXT,
    status status_type DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERS
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name TEXT NOT NULL,
    logo_url TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    description TEXT,
    address TEXT,
    rep_name TEXT,
    status status_type DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    payment_type payment_type NOT NULL,
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    votes_count INT DEFAULT 0,
    payment_proof_url TEXT,
    status status_type DEFAULT 'pending',
    notes TEXT,
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOTES
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    votes_count INT DEFAULT 1,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE SETTINGS
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INITIAL SETTINGS DATA
INSERT INTO site_settings (key, value) VALUES ('settings', '{
  "payment_mode": "manual",
  "lipila_enabled": false,
  "lipila_sandbox": true,
  "lipila_api_key": "",
  "lipila_account_id": "",
  "lipila_webhook_secret": "",
  "lipila_currency": "ZMW",
  "lipila_timeout": 30000,
  "lipila_retry_attempts": 3,
  "mtn_enabled": true,
  "airtel_enabled": true,
  "zamtel_enabled": true,
  "cards_enabled": false,
  "vote_min_quantity": 1,
  "vote_max_quantity": 1000,
  "voting_start_date": "",
  "voting_end_date": "",
  "voting_status": "open",
  "vote_discounts": false,
  "vote_taxes": 0,
  "website_name": "MOSI-OA TUNYA SOUTHERN AWARDS",
  "site_name": "MOSI-OA TUNYA SOUTHERN AWARDS",
  "header_text": "Celebrating Excellence in the Southern Region",
  "awards_night_date": "2024-12-20",
  "awards_date": "2024-12-20",
  "logo_url": "/AWARD.png",
  "favicon_url": "/AWARD.png",
  "about_text": "Welcome to the MOSI-OA TUNYA SOUTHERN AWARDS.",
  "about_content": "Detailed about content...",
  "footer_text": "MOSI-OA TUNYA SOUTHERN AWARDS. All Rights Reserved.",
  "currency": "ZMW",
  "currency_code": "ZMW",
  "facebook": "",
  "instagram": "",
  "tiktok": "",
  "youtube": "",
  "twitter": "",
  "facebook_url": "",
  "instagram_url": "",
  "tiktok_url": "",
  "youtube_url": "",
  "twitter_url": "",
  "meta_title": "MOSI-OA TUNYA SOUTHERN AWARDS",
  "meta_description": "Vote for your favorite nominees.",
  "ga_tracking_id": "",
  "voting_fee": 10,
  "nomination_fee": 100,
  "payments_enabled": true,
  "mobile_money_number": "0962 267 118",
  "account_name": "Awards Organization",
  "bank_name": "Zambia Bank",
  "bank_account": "0123456789",
  "payment_instructions": "Please transfer the fee to the mobile money number.",
  "payment_qr_url": "",
  "manual_verification": true,
  "payment_methods": ["mtn"],
  "quick_links": "",
  "support_links": "",
  "office_address": "Livingstone, Zambia",
  "help_email": "info@awards.com",
  "help_number": "0962 267 118",
  "contact_email": "info@awards.com",
  "whatsapp_number": "260962267118",
  "whatsapp_enabled": true,
  "smtp_host": "",
  "smtp_port": 587,
  "smtp_user": "",
  "smtp_encryption": "STARTTLS",
  "email_from": "noreply@awards.com",
  "email_from_name": "Awards Team",
  "notify_user_register": true,
  "notify_vote_confirm": true,
  "notify_nominee_register": true,
  "notify_nominee_approved": true,
  "notify_sponsor_approved": true,
  "notify_partner_approved": true,
  "notify_admin_new_payment": true,
  "notify_admin_new_nominee": true,
  "rate_limiting_enabled": true,
  "captcha_enabled": false,
  "audit_log_enabled": true,
  "maintenance_mode": false
}');


-- INSERT INITIAL ADMIN USER (You must sign up first in Auth, then update your profile role to 'admin')
