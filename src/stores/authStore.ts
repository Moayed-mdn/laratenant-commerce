'use client';

/**
 * Auth store using Zustand.
 * Stores user info only — NOT storeId (that comes from URL params).
 */

import { create } from 'zustand';
import type { AdminUser, UserRole } from '@/types/user';
import { PERMISSIONS, hasPermission, type PermissionKey } from '@/config/permissions';

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Selectors
export const selectUser = (state: AuthStore): AdminUser | null => state.user;
export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore): boolean => state.isLoading;
export const selectUserRole = (state: AuthStore): UserRole | null => state.user?.role ?? null;

/**
 * Selector to check if the current user has a specific permission.
 * Returns false if no user is authenticated.
 */
export const selectCan = (state: AuthStore) => (permission: PermissionKey): boolean => {
  const user = state.user;
  if (!user) return false;
  return hasPermission(user.role, permission);
};
