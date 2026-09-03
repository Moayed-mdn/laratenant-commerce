'use client';

/**
 * Mounts push-notification registration for the authenticated merchant
 * session. Renders nothing — side-effect only.
 */

import { usePushNotificationRegistration } from '@/hooks/notifications/usePushNotificationRegistration';
import { FEATURES } from '@/config/features';

export function PushNotificationRegistrar() {
  usePushNotificationRegistration(FEATURES.enableNotifications);

  return null;
}
