'use client';

/**
 * Requests push permission and registers this browser's FCM token once,
 * and shows a toast + refreshes notification queries for pushes received
 * while the dashboard tab is open in the foreground.
 *
 * Silently does nothing if web push isn't configured yet
 * (NEXT_PUBLIC_FIREBASE_* env vars empty) or the browser doesn't support
 * it — the in-app notification center keeps working either way.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestPushPermissionAndGetToken, onForegroundMessage } from '@/lib/firebase/client';
import { isWebPushConfigured } from '@/config/firebase';
import { useRegisterDeviceToken } from './useRegisterDeviceToken';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';

export function usePushNotificationRegistration(enabled: boolean) {
  const queryClient = useQueryClient();
  const registerDeviceToken = useRegisterDeviceToken();
  const hasAttemptedRegistration = useRef(false);

  useEffect(() => {
    if (!enabled || !isWebPushConfigured() || hasAttemptedRegistration.current) {
      return;
    }
    hasAttemptedRegistration.current = true;

    requestPushPermissionAndGetToken()
      .then((token) => {
        if (token) {
          registerDeviceToken.mutate({ token, platform: 'web' });
        }
      })
      .catch((error) => {
        logger.error('Push permission/token request failed', { error });
      });
    // registerDeviceToken is a fresh useMutation object every render — intentionally
    // excluded so this effect only runs once per mount, guarded by the ref above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isWebPushConfigured()) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? payload.data?.title;
      const body = payload.notification?.body ?? payload.data?.body;

      if (title) {
        toast.message(title, { description: body });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe?.();
  }, [enabled, queryClient]);
}
