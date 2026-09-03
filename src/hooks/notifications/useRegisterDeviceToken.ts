'use client';

/**
 * Hook for registering (or refreshing) this device's FCM push token.
 */

import { useMutation } from '@tanstack/react-query';
import { registerDeviceToken } from '@/lib/api/notifications';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';
import type { DeviceToken, RegisterDeviceTokenPayload } from '@/types/notification';

export interface UseRegisterDeviceTokenOptions {
  onSuccess?: (deviceToken: DeviceToken) => void;
  onError?: (error: ApiError) => void;
}

export function useRegisterDeviceToken(options?: UseRegisterDeviceTokenOptions) {
  return useMutation({
    mutationFn: (payload: RegisterDeviceTokenPayload) => registerDeviceToken(payload),
    retry: 0,
    onSuccess: (deviceToken) => {
      logger.info('Device registered for push notifications', { platform: deviceToken.platform });
      options?.onSuccess?.(deviceToken);
    },
    onError: (error: ApiError) => {
      logger.error('Device token registration failed', { error });
      options?.onError?.(error);
    },
  });
}
