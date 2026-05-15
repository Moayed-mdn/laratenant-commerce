'use client';

/**
 * Tenant and Store context store using Zustand.
 * Central layer for managing the active tenant/store state.
 * 
 * Evolved from a simple store metadata container into a 
 * foundation for SaaS multi-tenancy.
 */

import { create } from 'zustand';
import type { Store } from '@/types/store';
import { AppType } from '@/lib/tenant/types';

export interface StoreState {
  // Current active store metadata
  currentStore: Store | null;
  
  // Tenant context
  tenantSlug: string | null;
  appType: AppType | null;
  
  // UI State
  isLoading: boolean;
  
  // Future-ready fields
  memberships: unknown[]; // Placeholder for future memberships/multi-store
  permissions: string[]; // Placeholder for active permissions
}

export interface StoreActions {
  setCurrentStore: (store: Store) => void;
  clearCurrentStore: () => void;
  setTenantContext: (slug: string | null, type: AppType) => void;
  setLoading: (loading: boolean) => void;
  setMemberships: (memberships: unknown[]) => void;
  setPermissions: (permissions: string[]) => void;
}

export type StoreStore = StoreState & StoreActions;

export const useStoreStore = create<StoreStore>((set) => ({
  currentStore: null,
  tenantSlug: null,
  appType: null,
  isLoading: false,
  memberships: [],
  permissions: [],

  setCurrentStore: (currentStore) => set({ currentStore }),
  clearCurrentStore: () => set({ currentStore: null }),
  setTenantContext: (tenantSlug, appType) => set({ tenantSlug, appType }),
  setLoading: (isLoading) => set({ isLoading }),
  setMemberships: (memberships) => set({ memberships }),
  setPermissions: (permissions) => set({ permissions }),
}));

// Selectors
export const selectCurrentStore = (state: StoreStore): Store | null => state.currentStore;
export const selectCurrentStoreId = (state: StoreStore): string | null => 
  state.currentStore?.id ? String(state.currentStore.id) : null;
export const selectCurrentStoreName = (state: StoreStore): string => state.currentStore?.name ?? '';
export const selectCurrentStoreCurrency = (state: StoreStore): string => {
  const currency = state.currentStore?.currency;
  return typeof currency === 'string' && currency.length > 0 ? currency : 'USD';
};
export const selectIsStoreLoading = (state: StoreStore): boolean => state.isLoading;
export const selectTenantContext = (state: StoreStore) => ({
  slug: state.tenantSlug,
  appType: state.appType,
});
export const selectMemberships = (state: StoreStore) => state.memberships;
export const selectPermissions = (state: StoreStore) => state.permissions;
