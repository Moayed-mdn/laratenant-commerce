'use client';

/**
 * Store context store using Zustand.
 * Stores display metadata about the current store (name, currency, etc.)
 * NOT for storeId (that comes from URL params).
 * NOT for API calls (storeId comes from URL params).
 */

import { create } from 'zustand';
import type { Store } from '@/types/store';

export interface StoreState {
  currentStore: Store | null;
  isLoading: boolean;
}

export interface StoreActions {
  setCurrentStore: (store: Store) => void;
  clearCurrentStore: () => void;
  setLoading: (loading: boolean) => void;
}

export type StoreStore = StoreState & StoreActions;

export const useStoreStore = create<StoreStore>((set) => ({
  currentStore: null,
  isLoading: false,

  setCurrentStore: (currentStore) => set({ currentStore }),
  clearCurrentStore: () => set({ currentStore: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Selectors
export const selectCurrentStore = (state: StoreStore): Store | null => state.currentStore;
export const selectCurrentStoreName = (state: StoreStore): string => state.currentStore?.name ?? '';
export const selectCurrentStoreCurrency = (state: StoreStore): string => state.currentStore?.currency ?? 'USD';
export const selectIsStoreLoading = (state: StoreStore): boolean => state.isLoading;
