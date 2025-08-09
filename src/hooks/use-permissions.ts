import { useState, useEffect } from 'react'

type Permission = string
type Role = string

interface UsePermissionsProps {
  userRole?: Role
  permissions?: Permission[]
}

export function usePermissions({ userRole, permissions = [] }: UsePermissionsProps = {}) {
  const [userPermissions, setUserPermissions] = useState<Permission[]>(permissions)

  useEffect(() => {
    if (userRole) {
      // In a real app, you would fetch permissions based on role
      // This is a mock implementation
      const rolePermissions: Record<string, Permission[]> = {
        admin: ['create', 'read', 'update', 'delete'],
        manager: ['create', 'read', 'update'],
        staff: ['read', 'update'],
        viewer: ['read']
      }
      setUserPermissions(rolePermissions[userRole] || [])
    }
  }, [userRole])

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userPermissions
  }
}