'use client';

/**
 * UI state store using Zustand.
 * Manages sidebar, theme, and RTL direction state.
 * 
 * IMPORTANT: locale source of truth is next-intl (useLocale hook).
 * Zustand only tracks 'direction' for RTL CSS application.
 */

import { create } from 'zustand';
import { FEATURES } from '@/config/features';

export interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
}

export interface UiActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDirection: (locale: 'en' | 'ar') => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  direction: 'ltr',

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setTheme: (theme) => set({ theme }),
  setDirection: (locale) =>
    set({
      direction: FEATURES.enableRTL ? (locale === 'ar' ? 'rtl' : 'ltr') : 'ltr',
    }),
}));

// Selectors
export const selectSidebarOpen = (state: UiStore): boolean => state.sidebarOpen;
export const selectSidebarCollapsed = (state: UiStore): boolean => state.sidebarCollapsed;
export const selectTheme = (state: UiStore): 'light' | 'dark' => state.theme;
export const selectDirection = (state: UiStore): 'ltr' | 'rtl' => state.direction;
export const selectIsDarkMode = (state: UiStore): boolean => state.theme === 'dark';
export const selectIsRTL = (state: UiStore): boolean => state.direction === 'rtl';
