'use client';

/**
 * Hook for deleting a user.
 */

import { useMutation } from '@tanstack/react-query';
import { deleteUser } from '@/lib/api/users';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export interface UseDeleteUserOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteUser(storeId: string, options?: UseDeleteUserOptions) {
  return useMutation({
    mutationFn: (userId: string) => deleteUser(storeId, userId),
    retry: 0,
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users(storeId).lists() });
      logger.info('User deleted', { storeId });
      options?.onSuccess?.();
    },
    onError: (error: ApiError) => {
      logger.error('Delete user failed', { error });
      options?.onError?.(error);
    },
  });
}
