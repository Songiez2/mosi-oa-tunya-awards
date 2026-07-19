-- INITIAL SCHEMA FOR NEW DB
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

-- INSERT INITIAL ADMIN USER (You must sign up first in Auth, then update your profile role to 'admin')
