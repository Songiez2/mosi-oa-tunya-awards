-- Fix Row Level Security (RLS) policies for categories table
-- Run this in Supabase SQL Editor at https://supabase.com/dashboard/project/jxsmbturssyhhilycspo/sql

-- Enable RLS on categories table (if not already enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_select_authenticated" ON categories;

-- Create policy to allow public read access to categories
CREATE POLICY "categories_select_public" 
ON categories FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to read categories
CREATE POLICY "categories_select_authenticated" 
ON categories FOR SELECT 
TO authenticated 
USING (true);

-- Verify categories exist
SELECT COUNT(*) as category_count FROM categories;

-- Show all categories
SELECT name, is_enabled, sort_order FROM categories ORDER BY sort_order;
