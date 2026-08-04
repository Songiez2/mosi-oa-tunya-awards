-- Create admin account for topkuchalo@gmail.com
-- Step 1: Sign up the user through the app at http://localhost:5175/register
-- Step 2: Then run this SQL to make them an admin

-- Update the user's profile to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'topkuchalo@gmail.com';

-- Verify the admin was created
SELECT id, full_name, email, role, is_suspended FROM profiles WHERE email = 'topkuchalo@gmail.com';
