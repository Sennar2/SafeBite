/**
 * Multi-Tenancy and RBAC Utilities
 * Provides helper functions for managing companies, roles, and access control
 */

export type UserRole = 'super_user' | 'company_admin' | 'ops' | 'manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string | null;
  role: UserRole;
  location_ids: string[];
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Role Hierarchy and Permissions
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS = {
  super_user: {
    canViewAllCompanies: true,
    canViewAllLocations: true,
    canCreateCompanies: true,
    canManageUsers: true,
    canCreateChecklists: true,
    canEditChecklists: true,
    canDeleteChecklists: true,
    canRecordTemperatures: true,
    canCompleteChecklists: true,
    canViewAllRecords: true,
    canDownloadRecords: true,
    canGenerateReports: true,
    canManageRoles: true,
  },
  company_admin: {
    canViewAllCompanies: false,
    canViewAllLocations: true,
    canCreateCompanies: false,
    canManageUsers: true,
    canCreateChecklists: true,
    canEditChecklists: true,
    canDeleteChecklists: true,
    canRecordTemperatures: true,
    canCompleteChecklists: true,
    canViewAllRecords: true,
    canDownloadRecords: true,
    canGenerateReports: true,
    canManageRoles: false,
  },
  ops: {
    canViewAllCompanies: false,
    canViewAllLocations: true,
    canCreateCompanies: false,
    canManageUsers: false,
    canCreateChecklists: false,
    canEditChecklists: false,
    canDeleteChecklists: false,
    canRecordTemperatures: true,
    canCompleteChecklists: true,
    canViewAllRecords: true,
    canDownloadRecords: true,
    canGenerateReports: false,
    canManageRoles: false,
  },
  manager: {
    canViewAllCompanies: false,
    canViewAllLocations: false,
    canCreateCompanies: false,
    canManageUsers: false,
    canCreateChecklists: false,
    canEditChecklists: false,
    canDeleteChecklists: false,
    canRecordTemperatures: true,
    canCompleteChecklists: true,
    canViewAllRecords: true,
    canDownloadRecords: true,
    canGenerateReports: false,
    canManageRoles: false,
  },
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS['super_user']
): boolean => {
  return ROLE_PERMISSIONS[role][permission] || false;
};

/**
 * Check if a user can access a specific location
 */
export const canAccessLocation = (
  userRole: UserRole,
  userLocationIds: string[],
  targetLocationId: string
): boolean => {
  if (userRole === 'super_user') return true;
  if (userRole === 'company_admin' || userRole === 'ops') return true;
  // For managers, check if the location is in their assigned locations
  return userLocationIds.includes(targetLocationId);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    super_user: 'App Super User',
    company_admin: 'Company Admin',
    ops: 'Operations Manager',
    manager: 'Manager',
  };
  return roleNames[role] || role;
};

/**
 * Get role description
 */
export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    super_user: 'Full access to all companies, locations, and features. Can manage users and roles.',
    company_admin: 'Access to all locations within their company. Can create and manage checklists, items, and users.',
    ops: 'Access to all locations within their company. Can record temperatures and complete checklists.',
    manager: 'Access to assigned locations only. Can record temperatures and complete checklists.',
  };
  return descriptions[role] || '';
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    super_user: 'bg-red-100 text-red-800',
    company_admin: 'bg-blue-100 text-blue-800',
    ops: 'bg-green-100 text-green-800',
    manager: 'bg-yellow-100 text-yellow-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Get role icon for UI display
 */
export const getRoleIcon = (role: UserRole): string => {
  const icons: Record<UserRole, string> = {
    super_user: '👑',
    company_admin: '🏢',
    ops: '⚙️',
    manager: '👤',
  };
  return icons[role] || '👤';
};

/**
 * Check if a role can manage another role
 */
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, UserRole[]> = {
    super_user: ['super_user', 'company_admin', 'ops', 'manager'],
    company_admin: ['ops', 'manager'],
    ops: [],
    manager: [],
  };
  return roleHierarchy[managerRole]?.includes(targetRole) || false;
};

/**
 * Get list of roles that a user can assign
 */
export const getAssignableRoles = (userRole: UserRole): UserRole[] => {
  const assignableRoles: Record<UserRole, UserRole[]> = {
    super_user: ['super_user', 'company_admin', 'ops', 'manager'],
    company_admin: ['ops', 'manager'],
    ops: [],
    manager: [],
  };
  return assignableRoles[userRole] || [];
};

/**
 * Validate if a user profile is complete
 */
export const isProfileComplete = (profile: UserProfile): boolean => {
  return !!(
    profile.id &&
    profile.email &&
    profile.full_name &&
    profile.company_id &&
    profile.role
  );
};

/**
 * Format user display name with role
 */
export const formatUserDisplay = (user: UserProfile): string => {
  return `${user.full_name} (${getRoleDisplayName(user.role)})`;
};

/**
 * Get access scope description for a user
 */
export const getAccessScopeDescription = (user: UserProfile): string => {
  if (user.role === 'super_user') {
    return 'All companies and locations';
  }
  if (user.role === 'company_admin' || user.role === 'ops') {
    return `All locations in company`;
  }
  if (user.role === 'manager') {
    return `${user.location_ids.length} assigned location(s)`;
  }
  return 'No access';
};

/**
 * Check if a user can perform an action on a specific record
 */
export const canPerformAction = (
  userRole: UserRole,
  userCompanyId: string | null,
  recordCompanyId: string,
  action: 'view' | 'edit' | 'delete'
): boolean => {
  // Super users can do anything
  if (userRole === 'super_user') return true;

  // Check company match for non-super users
  if (userCompanyId !== recordCompanyId) return false;

  // Company admins can do anything within their company
  if (userRole === 'company_admin') return true;

  // Ops can view and edit, but not delete
  if (userRole === 'ops') return action !== 'delete';

  // Managers can only view
  if (userRole === 'manager') return action === 'view';

  return false;
};

/**
 * Get list of all available roles
 */
export const getAllRoles = (): UserRole[] => {
  return ['super_user', 'company_admin', 'ops', 'manager'];
};
