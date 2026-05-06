'use client';

/**
 * AuthInitializer component.
 * Syncs server-fetched user into client Zustand store on mount.
 * 
 * This is the documented exception to NO_USEEFFECT rule:
 * Reason: 'sync server-fetched user into client Zustand store on mount'
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { AdminUser } from '@/types/user';

interface AuthInitializerProps {
  user: AdminUser | null;
  children: React.ReactNode;
}

/**
 * Client component that initializes the auth store with server-fetched user data.
 * Renders children only — no visual output.
 */
export function AuthInitializer({ user, children }: AuthInitializerProps) {
  useEffect(() => {
    const { setUser, clearUser } = useAuthStore.getState();
    if (user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [user]);

  return <>{children}</>;
}
