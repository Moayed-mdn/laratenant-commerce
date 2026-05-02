'use client';

/**
 * Mutation hook for login flow.
 * Handles authentication and user state update.
 */

import { useMutation } from '@tanstack/react-query';
import { login, type LoginCredentials, type LoginResponse } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import queryClient from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export interface UseLoginOptions {
  onSuccess?: (storeId: string) => void;
  onError?: (error: ApiError) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation<LoginResponse, ApiError, LoginCredentials>({
    mutationFn: login,
    retry: 0, // Hard rule — mutations never retry
    onSuccess: (data) => {
      // Update auth store with user info
      console.log('this is the data',{data})
      setUser(data.user);

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

      // Determine redirect based on user's store assignment
      if (data.user.store_id !== null) {
        options?.onSuccess?.(String(data.user.store_id));
      } else {
        // No store assigned — component handles error display
        options?.onSuccess?.('');
      }

      logger.info('Login successful', { userId: data.user.id });
    },
    onError: (error: ApiError) => {
      logger.error('Login failed', { error });
      options?.onError?.(error);
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}
