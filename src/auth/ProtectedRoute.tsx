import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../utils/multiTenancy'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requiredPermission?: string
}

/**
 * ProtectedRoute component that checks authentication and authorization
 * before rendering the protected content
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermission,
}) => {
  const { isAuthenticated, profile, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(profile.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">
              You do not have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your role: <strong>{profile.role}</strong>
            </p>
          </div>
        </div>
      )
    }
  }

  // Check if user has required permission
  if (requiredPermission) {
    const { ROLE_PERMISSIONS } = require('../utils/multiTenancy')
    const permissions = ROLE_PERMISSIONS[profile.role]
    
    if (!permissions?.[requiredPermission]) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">
              You do not have permission to access this feature.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
