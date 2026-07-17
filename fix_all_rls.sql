-- Fix Row Level Security (RLS) policies for all public tables
-- Run this in Supabase SQL Editor at https://supabase.com/dashboard/project/jxsmbturssyhhilycspo/sql

-- ============================================================
-- CATEGORIES
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_select_authenticated" ON categories;

CREATE POLICY "categories_select_public" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "categories_select_authenticated" 
ON categories FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- NOMINEES
-- ============================================================
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nominees_select_public" ON nominees;
DROP POLICY IF EXISTS "nominees_select_authenticated" ON nominees;

CREATE POLICY "nominees_select_public" 
ON nominees FOR SELECT 
USING (status = 'approved');

CREATE POLICY "nominees_select_authenticated" 
ON nominees FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- SPONSORS
-- ============================================================
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sponsors_select_public" ON sponsors;
DROP POLICY IF EXISTS "sponsors_select_authenticated" ON sponsors;

CREATE POLICY "sponsors_select_public" 
ON sponsors FOR SELECT 
USING (status = 'approved');

CREATE POLICY "sponsors_select_authenticated" 
ON sponsors FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- PARTNERS
-- ============================================================
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partners_select_public" ON partners;
DROP POLICY IF EXISTS "partners_select_authenticated" ON partners;

CREATE POLICY "partners_select_public" 
ON partners FOR SELECT 
USING (status = 'approved');

CREATE POLICY "partners_select_authenticated" 
ON partners FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- NEWS
-- ============================================================
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_select_public" ON news;
DROP POLICY IF EXISTS "news_select_authenticated" ON news;

CREATE POLICY "news_select_public" 
ON news FOR SELECT 
USING (is_published = true);

CREATE POLICY "news_select_authenticated" 
ON news FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- GALLERY
-- ============================================================
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select_public" ON gallery;
DROP POLICY IF EXISTS "gallery_select_authenticated" ON gallery;

CREATE POLICY "gallery_select_public" 
ON gallery FOR SELECT 
USING (true);

CREATE POLICY "gallery_select_authenticated" 
ON gallery FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_select_public" ON announcements;
DROP POLICY IF EXISTS "announcements_select_authenticated" ON announcements;

CREATE POLICY "announcements_select_public" 
ON announcements FOR SELECT 
USING (is_active = true);

CREATE POLICY "announcements_select_authenticated" 
ON announcements FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
DROP POLICY IF EXISTS "site_settings_select_authenticated" ON site_settings;

CREATE POLICY "site_settings_select_public" 
ON site_settings FOR SELECT 
USING (true);

CREATE POLICY "site_settings_select_authenticated" 
ON site_settings FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================
-- VERIFY DATA
-- ============================================================
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Nominees', COUNT(*) FROM nominees
UNION ALL  
SELECT 'Sponsors', COUNT(*) FROM sponsors
UNION ALL
SELECT 'Partners', COUNT(*) FROM partners
UNION ALL
SELECT 'News', COUNT(*) FROM news
UNION ALL
SELECT 'Gallery', COUNT(*) FROM gallery
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'Site Settings', COUNT(*) FROM site_settings;
