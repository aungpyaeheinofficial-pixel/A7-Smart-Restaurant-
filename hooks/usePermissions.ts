import { useMemo } from 'react';
import { useGlobal } from '../Providers';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions } from '../utils/permissions';
import { StaffRole } from '../types';

/**
 * Hook to check permissions based on current user's role
 */
export const usePermissions = () => {
  const { currentUser } = useGlobal();
  const role = currentUser.role as StaffRole;

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      return hasPermission(role, permission);
    };
  }, [role]);

  const checkAnyPermission = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return hasAnyPermission(role, permissions);
    };
  }, [role]);

  const checkAllPermissions = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return hasAllPermissions(role, permissions);
    };
  }, [role]);

  const permissions = useMemo(() => {
    return getRolePermissions(role);
  }, [role]);

  const isManager = useMemo(() => {
    return role === 'Manager';
  }, [role]);

  return {
    role,
    permissions,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isManager,
  };
};

