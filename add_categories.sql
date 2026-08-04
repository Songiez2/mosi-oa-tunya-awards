-- Add 25 correct award categories
-- Run this in Supabase SQL Editor at https://supabase.com/dashboard/project/jxsmbturssyhhilycspo/sql

-- Insert the 25 categories as specified (will update if exists)
INSERT INTO categories (id, name, description, sort_order, is_enabled, created_at) VALUES
  (gen_random_uuid(), 'Best Local Business Award', 'Award for the best local business', 1, true, now()),
  (gen_random_uuid(), 'Best Night Club Award', 'Award for the best night club', 2, true, now()),
  (gen_random_uuid(), 'Best Local Hospitality Award', 'Award for the best local hospitality business', 3, true, now()),
  (gen_random_uuid(), 'Best Social Media Page Award', 'Award for the best social media page', 4, true, now()),
  (gen_random_uuid(), 'Best Influencer Award', 'Award for the best social media influencer', 5, true, now()),
  (gen_random_uuid(), 'Best Photographer Award', 'Award for the best photographer', 6, true, now()),
  (gen_random_uuid(), 'Best Videographer Award', 'Award for the best videographer', 7, true, now()),
  (gen_random_uuid(), 'Best Event Award', 'Award for the best event organized', 8, true, now()),
  (gen_random_uuid(), 'Best Model Award', 'Award for the best model', 9, true, now()),
  (gen_random_uuid(), 'Best Dancer / Dance Group Award', 'Award for the best dancer or dance group', 10, true, now()),
  (gen_random_uuid(), 'Best Provincial Male Artist of the Year', 'Award for the best provincial male artist', 11, true, now()),
  (gen_random_uuid(), 'Best Provincial Female Artist of the Year', 'Award for the best provincial female artist', 12, true, now()),
  (gen_random_uuid(), 'Best Music Video Award', 'Award for the best music video', 13, true, now()),
  (gen_random_uuid(), 'Best Gospel Artist Award', 'Award for the best gospel artist', 14, true, now()),
  (gen_random_uuid(), 'Song of the Year Award', 'Award for the best song of the year', 15, true, now()),
  (gen_random_uuid(), 'Best Music Producer Award', 'Award for the best music producer', 16, true, now()),
  (gen_random_uuid(), 'Best Comedian Award', 'Award for the best comedian', 17, true, now()),
  (gen_random_uuid(), 'Best Provincial Club DJ Award', 'Award for the best provincial club DJ', 18, true, now()),
  (gen_random_uuid(), 'Best Radio Station Award', 'Award for the best radio station', 19, true, now()),
  (gen_random_uuid(), 'Best Tour Agency Award', 'Award for the best tour agency', 20, true, now()),
  (gen_random_uuid(), 'Best Newcomer Male', 'Award for the best newcomer male artist', 21, true, now()),
  (gen_random_uuid(), 'Best Newcomer Female', 'Award for the best newcomer female artist', 22, true, now()),
  (gen_random_uuid(), 'Best Band Award', 'Award for the best band', 23, true, now()),
  (gen_random_uuid(), 'Best Female Artist Award', 'Award for the best female artist', 24, true, now()),
  (gen_random_uuid(), 'Best Male Artist Award', 'Award for the best male artist', 25, true, now())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_enabled = EXCLUDED.is_enabled;
