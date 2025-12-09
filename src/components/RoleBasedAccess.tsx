import React from 'react'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../utils/multiTenancy'

interface RoleBasedAccessProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredPermission?: string
  fallback?: React.ReactNode
}

/**
 * RoleBasedAccess component for conditional rendering based on user role
 * Useful for showing/hiding UI elements based on user permissions
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}) => {
  const { profile } = useAuth()

  if (!profile) {
    return <>{fallback}</>
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role)) {
      return <>{fallback}</>
    }
  }

  // Check if user has required permission
  if (requiredPermission) {
    const { ROLE_PERMISSIONS } = require('../utils/multiTenancy')
    const permissions = ROLE_PERMISSIONS[profile.role]
    
    if (!permissions?.[requiredPermission]) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

export default RoleBasedAccess
