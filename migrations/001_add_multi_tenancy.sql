-- Migration: Add Multi-Tenancy Support to Easy Bites
-- Description: Creates the companies table and adds company_id to all relevant tables
-- Date: 2025-11-19

-- ============================================================================
-- 1. CREATE COMPANIES TABLE (Tenant Definition)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Add index for faster lookups
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_is_active ON companies(is_active);

-- ============================================================================
-- 2. ADD COMPANY_ID TO PROFILES TABLE
-- ============================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Add role column if it doesn't exist (for RBAC)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager' 
  CHECK (role IN ('super_user', 'company_admin', 'ops', 'manager'));

-- Removed location_ids array column from profiles to use the user_location_assignments table for manager location access.

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- The existing user_locations table is preserved as it is used by other RLS policies.

-- ============================================================================
-- 3. ADD COMPANY_ID TO LOCATIONS TABLE
-- ============================================================================

ALTER TABLE locations
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);

-- ============================================================================
-- 4. ADD COMPANY_ID TO CHECKLISTS TABLE
-- ============================================================================

ALTER TABLE checklists
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checklists_company_id ON checklists(company_id);

-- ============================================================================
-- 5. ADD COMPANY_ID TO CHECKLIST_TASKS TABLE
-- ============================================================================

ALTER TABLE checklist_tasks
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checklist_tasks_company_id ON checklist_tasks(company_id);

-- ============================================================================
-- 6. ADD COMPANY_ID TO CHECKLIST_SUBTASKS TABLE
-- ============================================================================

ALTER TABLE checklist_subtasks
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checklist_subtasks_company_id ON checklist_subtasks(company_id);

-- ============================================================================
-- 7. ADD COMPANY_ID TO CHECKLIST_COMPLETIONS TABLE
-- ============================================================================

ALTER TABLE checklist_completions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checklist_completions_company_id ON checklist_completions(company_id);

-- ============================================================================
-- 8. ADD COMPANY_ID TO CHECKLIST_SUBTASK_COMPLETIONS TABLE
-- ============================================================================

ALTER TABLE checklist_subtask_completions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checklist_subtask_completions_company_id ON checklist_subtask_completions(company_id);

-- ============================================================================
-- 9. ADD COMPANY_ID TO TEMPERATURES TABLE
-- ============================================================================

ALTER TABLE temperatures
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_temperatures_company_id ON temperatures(company_id);

-- ============================================================================
-- 10. ADD COMPANY_ID TO TEMPERATURE_RECORDS TABLE
-- ============================================================================

ALTER TABLE temperature_records
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_temperature_records_company_id ON temperature_records(company_id);

-- ============================================================================
-- 11. ADD COMPANY_ID TO UNITS TABLE
-- ============================================================================

ALTER TABLE units
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_units_company_id ON units(company_id);

-- ============================================================================
-- 12. ADD COMPANY_ID TO FOOD_ITEMS TABLE
-- ============================================================================

ALTER TABLE food_items
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_food_items_company_id ON food_items(company_id);

-- ============================================================================
-- 13. ADD COMPANY_ID TO SUPPLIERS TABLE
-- ============================================================================

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);

-- ============================================================================
-- 14. ADD COMPANY_ID TO TASK_TEMPLATES TABLE
-- ============================================================================

ALTER TABLE task_templates
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_task_templates_company_id ON task_templates(company_id);

-- ============================================================================
-- 15. ADD COMPANY_ID TO TEMPERATURE_RANGES TABLE
-- ============================================================================

ALTER TABLE temperature_ranges
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_temperature_ranges_company_id ON temperature_ranges(company_id);

-- ============================================================================
-- 16. ADD COMPANY_ID TO MAINTENANCE_LOGS TABLE
-- ============================================================================

ALTER TABLE maintenance_logs
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_company_id ON maintenance_logs(company_id);

-- The existing user_locations table is used for manager-location assignments.

-- ============================================================================
-- 18. CREATE AUDIT LOG TABLE (for tracking changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 19. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on locations table
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on checklists table
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- Enable RLS on temperatures table
ALTER TABLE temperatures ENABLE ROW LEVEL SECURITY;

-- Enable RLS on units table
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Enable RLS on food_items table
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on suppliers table
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on task_templates table
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on temperature_ranges table
ALTER TABLE temperature_ranges ENABLE ROW LEVEL SECURITY;

-- Enable RLS on maintenance_logs table
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 20. CREATE RLS POLICIES FOR COMPANIES TABLE
-- ============================================================================

-- Super users can see all companies
CREATE POLICY "super_users_view_all_companies" ON companies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company admins and ops can see their own company
CREATE POLICY "users_view_own_company" ON companies
FOR SELECT USING (
  id IN (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 21. CREATE RLS POLICIES FOR PROFILES TABLE
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
FOR SELECT USING (id = auth.uid());

-- Super users can view all profiles
CREATE POLICY "super_users_view_all_profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company admins can view profiles in their company
CREATE POLICY "company_admins_view_company_profiles" ON profiles
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'company_admin'
  )
);

-- ============================================================================
-- 22. CREATE RLS POLICIES FOR LOCATIONS TABLE
-- ============================================================================

-- Super users can view all locations
CREATE POLICY "super_users_view_all_locations" ON locations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company admins and ops can view locations in their company
CREATE POLICY "company_users_view_company_locations" ON locations
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops')
  )
);

-- Managers can view only their assigned locations (using the existing user_locations table)
CREATE POLICY "managers_view_assigned_locations" ON locations
FOR SELECT USING (
  id IN (
    SELECT location_id FROM user_locations
    WHERE user_id = auth.uid()
  )
  AND company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'manager'
  )
);

-- ============================================================================
-- 23. CREATE RLS POLICIES FOR CHECKLISTS TABLE
-- ============================================================================

-- Super users can view all checklists
CREATE POLICY "super_users_view_all_checklists" ON checklists
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company users can view checklists in their company
CREATE POLICY "company_users_view_company_checklists" ON checklists
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 24. CREATE RLS POLICIES FOR TEMPERATURES TABLE
-- ============================================================================

-- Super users can view all temperatures
CREATE POLICY "super_users_view_all_temperatures" ON temperatures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company users can view temperatures in their company
CREATE POLICY "company_users_view_company_temperatures" ON temperatures
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 25. CREATE RLS POLICIES FOR UNITS TABLE
-- ============================================================================

-- Super users can view all units
CREATE POLICY "super_users_view_all_units" ON units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company users can view units in their company
CREATE POLICY "company_users_view_company_units" ON units
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 26. CREATE RLS POLICIES FOR FOOD_ITEMS TABLE
-- ============================================================================

-- Super users can view all food items
CREATE POLICY "super_users_view_all_food_items" ON food_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company users can view food items in their company
CREATE POLICY "company_users_view_company_food_items" ON food_items
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 27. CREATE RLS POLICIES FOR SUPPLIERS TABLE
-- ============================================================================

-- Super users can view all suppliers
CREATE POLICY "super_users_view_all_suppliers" ON suppliers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company users can view suppliers in their company
CREATE POLICY "company_users_view_company_suppliers" ON suppliers
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('company_admin', 'ops', 'manager')
  )
);

-- ============================================================================
-- 28. CREATE RLS POLICIES FOR AUDIT_LOGS TABLE
-- ============================================================================

-- Super users can view all audit logs
CREATE POLICY "super_users_view_all_audit_logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_user'
  )
);

-- Company admins can view audit logs for their company
CREATE POLICY "company_admins_view_company_audit_logs" ON audit_logs
FOR SELECT USING (
  company_id = (
    SELECT company_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'company_admin'
  )
);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Note: After running this migration, you need to:
-- 1. Manually assign companies to existing users via the Supabase dashboard
-- 2. Update your application code to use the new multi-tenancy structure
-- 3. Test RLS policies thoroughly before deploying to production
