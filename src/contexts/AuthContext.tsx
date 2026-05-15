'use client';

/**
 * Auth Context for Client Components
 * Provides user state, loading state, and authentication status.
 * Hydrates user data on mount through the auth API layer.
 * 
 * Centralized unauthorized handling:
 * - Listens for auth:unauthorized events from clientFetch
 * - Performs logout flow via logoutSession()
 * - Clears auth state
 * - Redirects to locale-aware login with preserved redirect target
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/auth';
import { getSessionMe, logoutSession } from '@/lib/api/auth';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

/**
 * Build localized login URL with redirect target preserved.
 * Preserves locale, pathname, and querystring when possible.
 */
function buildLoginRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/login';
  }

  const currentLocale = document.documentElement.lang || 'en';
  
  // Preserve the full path including querystring
  const redirectTarget = window.location.pathname + window.location.search;
  
  // Build URL with locale prefix and redirect param
  const url = new URL(`/login`, window.location.origin);
  url.searchParams.set('redirect', redirectTarget);
  
  // Prepend locale to pathname
  return `/${currentLocale}${url.pathname}${url.search}`;
}

/**
 * Auth Provider Component
 * Wraps the app to provide auth state to all client components.
 */
export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  /** Fetch current user from internal auth route through API layer. */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await getSessionMe();
      setUserState(currentUser);
    } catch (error) {
      logger.error('Failed to refresh auth user', { error });
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Hydrate user on mount if not provided initially.
   */
  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!initialUser) {
        await refreshUser();
      }
    };
    bootstrapAuth();
  }, [initialUser, refreshUser]);

  /**
   * Centralized unauthorized event handler.
   * Called when clientFetch detects 401 responses.
   * 
   * Flow:
   * 1. Call logoutSession() to clear HttpOnly cookies server-side
   * 2. Clear local auth state
   * 3. Invalidate TanStack Query cache to prevent stale auth UI
   * 4. Redirect to locale-aware login with preserved redirect target
   */
  useEffect(() => {
    const handleUnauthorized = async () => {
      // Prevent concurrent logout flows
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        // Step 1: Clear session cookies via server-side logout
        await logoutSession().catch((error) => {
          // Log but don't fail - we still need to clear local state and redirect
          logger.warn('Logout during unauthorized flow failed, continuing with cleanup', { error });
        });
      } finally {
        // Step 2: Clear local auth state regardless of logout success
        setUserState(null);
        
        // Step 3: Invalidate all query cache to prevent stale authenticated UI
        queryClient.clear();
        
        // Step 4: Redirect to localized login with preserved target
        const loginUrl = buildLoginRedirectUrl();
        window.location.href = loginUrl;
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [isLoggingOut, queryClient]);

  /**
   * Set user manually (e.g., after login).
   */
  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  /** Logout user through auth API module. */
  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } catch (error) {
      logger.warn('Logout request failed, clearing local state', { error });
    }
    setUserState(null);
    
    // Use locale-aware redirect for manual logout as well
    const currentLocale = document.documentElement.lang || 'en';
    window.location.href = `/${currentLocale}/login`;
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    refreshUser,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user has a specific role.
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.stores?.some(store => store.role === role) ?? false;
}

/**
 * Hook to get the current store ID from user.
 */
export function useStoreId(): number | null {
  const { user } = useAuth();
  return user?.stores?.[0]?.id ?? null;
}