-- Set the user with email 'danieleraicaldo93@gmail.com' as 'super_user'
-- This script should be run in the Supabase SQL Editor

UPDATE profiles
SET 
    role = 'super_user',
    company_id = NULL
WHERE 
    email = 'danieleraicaldo93@gmail.com';

-- Verify the update (optional - run this to confirm)
SELECT id, full_name, email, role, company_id FROM profiles WHERE email = 'danieleraicaldo93@gmail.com';
