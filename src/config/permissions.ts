/**
 * Permission configuration.
 */

import type { UserRole } from '@/types/user';

interface RolePermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canViewDashboard: boolean;
  canManageStoreSettings: boolean;
  canManageAllStores: boolean;
}

export const PERMISSIONS: Record<UserRole, RolePermissions> = {
  store_admin: {
    canManageUsers: true,
    canManageProducts: true,
    canManageOrders: true,
    canViewDashboard: true,
    canManageStoreSettings: true,
    canManageAllStores: false,
  },
  staff: {
    canManageUsers: false,
    canManageProducts: false,
    canManageOrders: false,
    canViewDashboard: true,
    canManageStoreSettings: false,
    canManageAllStores: false,
  },
  super_admin: {
    canManageUsers: true,
    canManageProducts: true,
    canManageOrders: true,
    canViewDashboard: true,
    canManageStoreSettings: true,
    canManageAllStores: true,
  },
} as const;

export type PermissionKey = keyof RolePermissions;

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return PERMISSIONS[role][permission];
}
