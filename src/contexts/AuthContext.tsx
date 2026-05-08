'use client';

/**
 * Auth Context for Client Components
 * Provides user state, loading state, and authentication status.
 * Hydrates user data on mount through the auth API layer.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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
 * Auth Provider Component
 * Wraps the app to provide auth state to all client components.
 */
export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

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
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser, refreshUser]);

  /**
   * Listen for auth:unauthorized events (e.g., from 401 responses).
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUserState(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

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
    window.location.href = '/login';
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
