# Multi-Tenancy Implementation Guide for Easy Bites

This guide provides step-by-step instructions for implementing the multi-tenancy and role-based access control (RBAC) system in the Easy Bites application.

## Overview

The Easy Bites application is being transformed from a single-company, multi-location system into a **multi-tenant, role-based access control system** with four user roles:

1. **App Super User** - Full access to all companies, locations, and features
2. **Company Admin** - Full access to their company's locations and features
3. **Ops Manager** - Access to all locations within their company (read/write for operations)
4. **Manager** - Access to assigned locations only (limited to recording and viewing)

## Architecture Overview

### Database Schema Changes

The implementation adds:
- **`companies` table** - Tenant definition
- **`company_id` column** - Added to all relevant tables for data segregation
- **`role` column** - Added to `profiles` table for RBAC
- **`location_ids` column** - Added to `profiles` table for manager location assignments
- **`user_location_assignments` table** - Maps users to their assigned locations
- **`audit_logs` table** - Tracks all changes for compliance
- **Row-Level Security (RLS) policies** - Enforces data segregation at the database level

### Application Architecture

The implementation updates:
- **AuthContext** - Manages authentication and user profile
- **MultiTenancyContext** - Manages companies and locations
- **ProtectedRoute** - Enforces role-based access to pages
- **RoleBasedAccess** - Conditional rendering based on roles
- **Utility functions** - Permission checking and role management

## Implementation Steps

### Step 1: Database Migration

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard/project/ebykgbdqavaqyhxeqrxk
   - Navigate to SQL Editor

2. **Run the Migration Script**
   - Copy the contents of `migrations/001_add_multi_tenancy.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration
   - Wait for completion (should take a few seconds)

3. **Verify the Migration**
   - Go to Table Editor
   - Confirm that the `companies` table exists
   - Verify that all tables have the `company_id` column
   - Check that RLS is enabled on all tables

### Step 2: Update Application Code

1. **Install Dependencies** (if needed)
   ```bash
   npm install
   ```

2. **Copy New Files**
   - The following new files have been created:
     - `src/utils/multiTenancy.ts` - RBAC utilities
     - `src/context/AuthContext.tsx` - Updated authentication
     - `src/context/MultiTenancyContext.tsx` - Multi-tenancy management
     - `src/auth/ProtectedRoute.tsx` - Role-based route protection
     - `src/auth/AuthContext.tsx` - Re-export for convenience
     - `src/components/RoleBasedAccess.tsx` - Conditional rendering
     - `src/components/CompanySelector.tsx` - Company switcher
     - `src/components/LocationSelector.tsx` - Location switcher

3. **Update App.tsx**
   Replace the current App.tsx with the updated version:

   ```typescript
   // src/App.tsx
   import React from 'react'
   import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
   import Login from './pages/Login'
   import Dashboard from './pages/Dashboard'
   import Checklist from './pages/Checklist'
   import Temperatures from './pages/Temperatures'
   import Admin from './pages/Admin'
   import Progress from './pages/Progress'
   import Export from './pages/Export'
   import TempTrends from './pages/TempTrends'
   import UserActivity from './pages/UserActivity'
   import AdminChecklistManager from './pages/AdminChecklistManager'
   import ChecklistCalendar from './pages/ChecklistCalendar'
   import AppLayout from './layouts/AppLayout'
   import { AuthProvider } from './context/AuthContext'
   import { MultiTenancyProvider } from './context/MultiTenancyContext'
   import ProtectedRoute from './auth/ProtectedRoute'

   export default function App() {
     return (
       <AuthProvider>
         <MultiTenancyProvider>
           <Router>
             <Routes>
               {/* Public */}
               <Route path="/login" element={<Login />} />

               {/* Protected area */}
               <Route
                 element={
                   <ProtectedRoute>
                     <AppLayout />
                   </ProtectedRoute>
                 }
               >
                 <Route path="/" element={<Dashboard />} />
                 <Route path="/checklist" element={<Checklist />} />
                 <Route path="/temperatures" element={<Temperatures />} />
                 <Route path="/admin" element={<Admin />} />
                 <Route path="/user-activity" element={<UserActivity />} />
                 <Route path="/export" element={<Export />} />
                 <Route path="/temperature-trends" element={<TempTrends />} />
                 <Route path="/progress" element={<Progress />} />
                 <Route path="/checklist-admin" element={<AdminChecklistManager />} />
                 <Route path="/checklist-calendar" element={<ChecklistCalendar />} />
               </Route>

               {/* Fallback */}
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </Router>
         </MultiTenancyProvider>
       </AuthProvider>
     )
   }
   ```

4. **Update Layouts/Header.tsx**
   Add company and location selectors to the header:

   ```typescript
   import { CompanySelector } from '../components/CompanySelector'
   import { LocationSelector } from '../components/LocationSelector'
   import { useAuth } from '../context/AuthContext'
   import { getRoleDisplayName, getRoleIcon } from '../utils/multiTenancy'

   // Inside the header component, add:
   <div className="flex items-center gap-6">
     <CompanySelector />
     <LocationSelector />
     <div className="flex items-center gap-2">
       <span>{getRoleIcon(profile.role)}</span>
       <span className="text-sm text-gray-600">{getRoleDisplayName(profile.role)}</span>
     </div>
   </div>
   ```

5. **Update Data Fetching**
   All data queries need to be updated to include the `company_id` filter. Example:

   ```typescript
   // Before
   const { data: temps } = await supabase
     .from("temperatures")
     .select("*")
     .eq("location_id", selectedLocation)

   // After
   const { data: temps } = await supabase
     .from("temperatures")
     .select("*")
     .eq("location_id", selectedLocation)
     .eq("company_id", profile.company_id)
   ```

### Step 3: Set Up Initial Data

1. **Create a Super User Account**
   - Sign up or create a user account in Supabase Auth
   - Go to Supabase Table Editor → profiles
   - Update the user's profile:
     - Set `role` to `super_user`
     - Leave `company_id` empty (super users access all companies)

2. **Create Companies**
   - Go to Supabase Table Editor → companies
   - Insert company records with:
     - `name` - Company name
     - `description` - Optional description
     - `address` - Optional address
     - `is_active` - Set to `true`

3. **Assign Companies to Users**
   - Go to profiles table
   - For each user, set:
     - `company_id` - The company they belong to
     - `role` - Their role (company_admin, ops, or manager)
     - `location_ids` - For managers, add an array of location UUIDs

4. **Update Locations**
   - Go to locations table
   - For each location, set `company_id` to the appropriate company

### Step 4: Update Existing Pages

Each page needs to be updated to:
1. Use the new `useAuth()` and `useMultiTenancy()` hooks
2. Filter data by `company_id` and `location_id`
3. Check permissions before showing features
4. Use `RoleBasedAccess` component for conditional rendering

#### Example: Dashboard.tsx

```typescript
import { useAuth } from '../context/AuthContext'
import { useMultiTenancy } from '../context/MultiTenancyContext'
import { RoleBasedAccess } from '../components/RoleBasedAccess'

export default function Dashboard() {
  const { profile } = useAuth()
  const { selectedLocation, selectedCompany } = useMultiTenancy()
  const [stats, setStats] = useState(...)

  useEffect(() => {
    if (!selectedLocation || !profile?.company_id) return
    fetchStats()
  }, [selectedLocation, profile?.company_id])

  const fetchStats = async () => {
    const { data: temps } = await supabase
      .from("temperatures")
      .select("*")
      .eq("location_id", selectedLocation.id)
      .eq("company_id", profile.company_id)
      .gte("timestamp", `${selectedDate}T00:00:00`)
      .lte("timestamp", `${selectedDate}T23:59:59`)

    // ... rest of the logic
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
      
      {/* Show company and location info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Company: <strong>{selectedCompany?.name}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Location: <strong>{selectedLocation?.name}</strong>
        </p>
      </div>

      {/* Show features based on role */}
      <RoleBasedAccess requiredPermission="canGenerateReports">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Generate Report
        </button>
      </RoleBasedAccess>

      {/* ... rest of the dashboard */}
    </div>
  )
}
```

### Step 5: Test the Implementation

1. **Test Super User Access**
   - Log in as a super user
   - Verify you can see all companies
   - Verify you can see all locations
   - Verify all features are available

2. **Test Company Admin Access**
   - Log in as a company admin
   - Verify you can only see your company
   - Verify you can see all locations in your company
   - Verify you can create and manage checklists

3. **Test Ops Manager Access**
   - Log in as an ops manager
   - Verify you can see all locations in your company
   - Verify you can record temperatures
   - Verify you cannot create checklists

4. **Test Manager Access**
   - Log in as a manager
   - Verify you can only see your assigned locations
   - Verify you can record temperatures
   - Verify you cannot create checklists

### Step 6: Deploy to Production

1. **Backup Your Database**
   - Go to Supabase Project Settings
   - Create a backup before deploying

2. **Deploy Application**
   - Build the application: `npm run build`
   - Deploy to your hosting platform (Vercel, etc.)
   - Test all functionality in production

3. **Monitor for Issues**
   - Check browser console for errors
   - Monitor Supabase logs for RLS policy violations
   - Verify data is properly segregated

## Role Permissions Matrix

| Feature | Super User | Company Admin | Ops | Manager |
|---------|-----------|--------------|-----|---------|
| View All Companies | ✅ | ❌ | ❌ | ❌ |
| View Company Locations | ✅ | ✅ | ✅ | Assigned Only |
| Create Checklists | ✅ | ✅ | ❌ | ❌ |
| Edit Checklists | ✅ | ✅ | ❌ | ❌ |
| Delete Checklists | ✅ | ✅ | ❌ | ❌ |
| Record Temperatures | ✅ | ✅ | ✅ | ✅ |
| Complete Checklists | ✅ | ✅ | ✅ | ✅ |
| View All Records | ✅ | ✅ | ✅ | ✅ |
| Download Records | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |

## Troubleshooting

### Issue: "RLS policy violation" error

**Cause**: The RLS policies are blocking access to data.

**Solution**:
1. Verify the user has a `company_id` set in their profile
2. Verify the data record has the correct `company_id`
3. Check that the RLS policies are correctly configured
4. Review Supabase logs for detailed error messages

### Issue: User can see data from other companies

**Cause**: RLS policies are not properly enforced.

**Solution**:
1. Verify RLS is enabled on the table
2. Check that all RLS policies are in place
3. Verify the user's `company_id` matches the data's `company_id`
4. Test with a fresh browser session (clear cookies)

### Issue: Manager can see all locations instead of assigned ones

**Cause**: The `location_ids` array is not properly set or the RLS policy is not checking it.

**Solution**:
1. Verify the manager's `location_ids` array contains the correct location UUIDs
2. Check that the RLS policy for managers is correctly filtering by `location_ids`
3. Verify the location records have the correct `company_id`

## Best Practices

1. **Always filter by company_id**
   - Every query should include `.eq("company_id", userCompanyId)`
   - This ensures data is properly segregated even if RLS fails

2. **Use the provided hooks**
   - Use `useAuth()` to get user profile and company_id
   - Use `useMultiTenancy()` to get selected company and locations
   - Never hardcode company or location IDs

3. **Check permissions before showing UI**
   - Use `RoleBasedAccess` component for conditional rendering
   - Use `hasPermission()` function for programmatic checks
   - Never rely solely on UI hiding for security

4. **Log all changes**
   - Insert records into `audit_logs` table for compliance
   - Track who made what changes and when

5. **Test thoroughly**
   - Test each role independently
   - Test switching between companies and locations
   - Test edge cases (no locations, no companies, etc.)

## Support and Questions

For questions or issues with the implementation:
1. Check the troubleshooting section above
2. Review the Supabase documentation: https://supabase.com/docs
3. Check the application logs in Supabase
4. Review the RLS policies in the SQL migration script

## Next Steps

After implementing multi-tenancy:
1. Create an admin dashboard for managing companies and users
2. Implement audit logging and compliance reporting
3. Add more granular permissions (e.g., per-location permissions)
4. Implement team management features
5. Add SSO (Single Sign-On) support for enterprise customers
