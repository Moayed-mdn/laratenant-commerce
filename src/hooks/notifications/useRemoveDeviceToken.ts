'use client';

/**
 * Hook for unregistering a device token — e.g. when the user logs out or
 * revokes push permission, so a stale token doesn't keep receiving pushes.
 */

import { useMutation } from '@tanstack/react-query';
import { removeDeviceToken } from '@/lib/api/notifications';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export function useRemoveDeviceToken() {
  return useMutation({
    mutationFn: (token: string) => removeDeviceToken(token),
    retry: 0,
    onError: (error: ApiError) => {
      // Non-fatal — the token will simply go unused/expire on the backend.
      logger.warn('Device token removal failed', { error });
    },
  });
}
