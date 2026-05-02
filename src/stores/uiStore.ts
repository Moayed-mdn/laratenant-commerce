'use client';

/**
 * UI state store using Zustand.
 * Manages sidebar, modals, and theme state.
 */

import { create } from 'zustand';
import { FEATURES } from '@/config/features';

export interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  locale: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
}

export interface UiActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLocale: (locale: 'en' | 'ar') => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  locale: 'en',
  direction: 'ltr',

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setTheme: (theme) => set({ theme }),
  setLocale: (locale) =>
    set({
      locale,
      direction: FEATURES.enableRTL ? (locale === 'ar' ? 'rtl' : 'ltr') : 'ltr',
    }),
}));

// Selectors
export const selectSidebarOpen = (state: UiStore): boolean => state.sidebarOpen;
export const selectSidebarCollapsed = (state: UiStore): boolean => state.sidebarCollapsed;
export const selectTheme = (state: UiStore): 'light' | 'dark' => state.theme;
export const selectLocale = (state: UiStore): 'en' | 'ar' => state.locale;
export const selectDirection = (state: UiStore): 'ltr' | 'rtl' => state.direction;
export const selectIsDarkMode = (state: UiStore): boolean => state.theme === 'dark';
export const selectIsRTL = (state: UiStore): boolean => state.direction === 'rtl';
