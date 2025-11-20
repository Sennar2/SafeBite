# Multi-Tenancy Quick Reference Guide

## Quick Start

### 1. Import Hooks
```typescript
import { useAuth } from '../context/AuthContext'
import { useMultiTenancy } from '../context/MultiTenancyContext'
```

### 2. Get User and Company Info
```typescript
const { profile, isAuthenticated } = useAuth()
const { selectedCompany, selectedLocation } = useMultiTenancy()

// Access user data
console.log(profile.role)           // 'super_user', 'company_admin', 'ops', 'manager'
console.log(profile.company_id)     // UUID of user's company
console.log(profile.location_ids)   // Array of assigned location UUIDs
```

### 3. Filter Data by Company
```typescript
const { data } = await supabase
  .from('temperatures')
  .select('*')
  .eq('company_id', profile.company_id)  // Always add this filter!
  .eq('location_id', selectedLocation.id)
```

### 4. Check Permissions
```typescript
import { RoleBasedAccess } from '../components/RoleBasedAccess'

// Option 1: Conditional rendering
<RoleBasedAccess allowedRoles={['company_admin', 'super_user']}>
  <button>Create Checklist</button>
</RoleBasedAccess>

// Option 2: Programmatic check
if (profile.role === 'company_admin') {
  // Show admin features
}

// Option 3: Permission-based check
<RoleBasedAccess requiredPermission="canCreateChecklists">
  <button>Create Checklist</button>
</RoleBasedAccess>
```

## Common Patterns

### Pattern 1: Fetch Company Data
```typescript
useEffect(() => {
  if (!profile?.company_id) return

  const fetchData = async () => {
    const { data } = await supabase
      .from('checklists')
      .select('*')
      .eq('company_id', profile.company_id)
    
    setChecklists(data || [])
  }

  fetchData()
}, [profile?.company_id])
```

### Pattern 2: Fetch Location Data
```typescript
useEffect(() => {
  if (!selectedLocation || !profile?.company_id) return

  const fetchData = async () => {
    const { data } = await supabase
      .from('temperatures')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('location_id', selectedLocation.id)
    
    setTemperatures(data || [])
  }

  fetchData()
}, [selectedLocation, profile?.company_id])
```

### Pattern 3: Create Record
```typescript
const handleCreate = async (name: string) => {
  if (!profile?.company_id || !selectedLocation) return

  const { data, error } = await supabase
    .from('checklists')
    .insert([
      {
        name,
        company_id: profile.company_id,  // Always include!
        location_id: selectedLocation.id,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating checklist:', error)
  } else {
    setChecklists([...checklists, data[0]])
  }
}
```

### Pattern 4: Manager Location Filtering
```typescript
const getAccessibleLocations = () => {
  if (profile.role === 'super_user' || profile.role === 'company_admin' || profile.role === 'ops') {
    return locations  // All locations
  }
  
  if (profile.role === 'manager') {
    return locations.filter(loc => profile.location_ids?.includes(loc.id))
  }
  
  return []
}
```

## Utility Functions

### Check if user has permission
```typescript
import { hasPermission } from '../utils/multiTenancy'

if (hasPermission(profile.role, 'canCreateChecklists')) {
  // Show create button
}
```

### Get role display name
```typescript
import { getRoleDisplayName } from '../utils/multiTenancy'

console.log(getRoleDisplayName('company_admin'))  // "Company Admin"
```

### Check if user can access location
```typescript
import { canAccessLocation } from '../utils/multiTenancy'

if (canAccessLocation(profile.role, profile.location_ids, locationId)) {
  // User can access this location
}
```

### Get role description
```typescript
import { getRoleDescription } from '../utils/multiTenancy'

console.log(getRoleDescription('ops'))  // "Access to all locations within their company..."
```

## Role Hierarchy

```
super_user (👑)
  ├── Can manage: company_admin, ops, manager
  └── Can access: All companies, all locations

company_admin (🏢)
  ├── Can manage: ops, manager
  └── Can access: All locations in their company

ops (⚙️)
  ├── Can manage: (none)
  └── Can access: All locations in their company

manager (👤)
  ├── Can manage: (none)
  └── Can access: Assigned locations only
```

## Permission Checklist

### Super User Permissions
- ✅ View all companies
- ✅ View all locations
- ✅ Create/edit/delete checklists
- ✅ Record temperatures
- ✅ Complete checklists
- ✅ View all records
- ✅ Download records
- ✅ Generate reports
- ✅ Manage users and roles

### Company Admin Permissions
- ✅ View all locations in company
- ✅ Create/edit/delete checklists
- ✅ Record temperatures
- ✅ Complete checklists
- ✅ View all records in company
- ✅ Download records
- ✅ Generate reports
- ✅ Manage ops and managers
- ❌ Manage other company admins
- ❌ View other companies

### Ops Permissions
- ✅ View all locations in company
- ✅ Record temperatures
- ✅ Complete checklists
- ✅ View all records in company
- ✅ Download records
- ❌ Create/edit/delete checklists
- ❌ Generate reports
- ❌ Manage users

### Manager Permissions
- ✅ View assigned locations only
- ✅ Record temperatures
- ✅ Complete checklists
- ✅ View records in assigned locations
- ✅ Download records
- ❌ Create/edit/delete checklists
- ❌ View all locations
- ❌ Generate reports
- ❌ Manage users

## Common Mistakes to Avoid

### ❌ Don't: Forget to add company_id filter
```typescript
// WRONG - Data from other companies will be visible!
const { data } = await supabase
  .from('temperatures')
  .select('*')
  .eq('location_id', selectedLocation.id)
```

### ✅ Do: Always filter by company_id
```typescript
// CORRECT
const { data } = await supabase
  .from('temperatures')
  .select('*')
  .eq('company_id', profile.company_id)
  .eq('location_id', selectedLocation.id)
```

### ❌ Don't: Hardcode company or location IDs
```typescript
// WRONG - Won't work for other companies
const { data } = await supabase
  .from('checklists')
  .select('*')
  .eq('company_id', 'hardcoded-uuid')
```

### ✅ Do: Use dynamic values from context
```typescript
// CORRECT
const { data } = await supabase
  .from('checklists')
  .select('*')
  .eq('company_id', profile.company_id)
```

### ❌ Don't: Rely only on UI hiding for security
```typescript
// WRONG - User could bypass this in browser console
if (profile.role === 'admin') {
  return <AdminPanel />
}
```

### ✅ Do: Check permissions on both frontend and backend
```typescript
// CORRECT - Check in component
<RoleBasedAccess allowedRoles={['company_admin', 'super_user']}>
  <AdminPanel />
</RoleBasedAccess>

// Also check in API/database with RLS policies
```

## Testing Checklist

- [ ] Super user can see all companies
- [ ] Super user can see all locations
- [ ] Company admin can only see their company
- [ ] Company admin can see all locations in their company
- [ ] Ops can see all locations in their company
- [ ] Manager can only see assigned locations
- [ ] Data from other companies is not visible
- [ ] Users cannot create records for other companies
- [ ] Users cannot edit records from other companies
- [ ] Permissions are enforced on both frontend and database

## Debugging Tips

### Check user profile
```typescript
const { profile } = useAuth()
console.log('User Profile:', profile)
// Should show: id, email, full_name, company_id, role, location_ids
```

### Check selected company and location
```typescript
const { selectedCompany, selectedLocation } = useMultiTenancy()
console.log('Selected Company:', selectedCompany)
console.log('Selected Location:', selectedLocation)
```

### Check RLS policy violations
1. Open browser DevTools → Network tab
2. Look for failed requests with 403 Forbidden
3. Check Supabase logs for RLS policy details
4. Verify user's company_id matches the data's company_id

### Test data access
```typescript
// Try to fetch data with wrong company_id
const { data, error } = await supabase
  .from('temperatures')
  .select('*')
  .eq('company_id', 'wrong-company-id')

// Should return empty array or error due to RLS
console.log('Data:', data)  // Should be []
console.log('Error:', error)  // Should be null (RLS silently filters)
```

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Easy Bites Multi-Tenancy Implementation Guide](./MULTI_TENANCY_IMPLEMENTATION_GUIDE.md)
