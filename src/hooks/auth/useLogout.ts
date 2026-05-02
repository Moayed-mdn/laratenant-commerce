'use client';

/**
 * Mutation hook for logout.
 * 
 * Hard rules followed:
 * - No useRouter import (navigation in component layer only)
 * - No toast import (toast in component layer only)
 * - retry: 0 (mutations never retry)
 */

import { useMutation } from '@tanstack/react-query';
import { logout } from '@/lib/api/auth';
import queryClient from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook to handle user logout.
 * Clears auth state and query cache on success.
 * 
 * @param options - Optional callbacks for success/error
 * @returns TanStack Query mutation object
 */
export function useLogout(options?: UseLogoutOptions) {
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: logout,
    retry: 0, // Hard rule: mutations never retry
    onSuccess: () => {
      clearUser();
      queryClient.clear(); // Clear all cached data
      logger.info('User logged out');
      options?.onSuccess?.();
    },
    onError: (error: ApiError) => {
      logger.error('Logout failed', { error });
      options?.onError?.(error);
    },
  });
}
