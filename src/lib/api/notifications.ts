/**
 * Notifications & device-token API functions (client-side).
 * Never use these functions in RSC — this is a client-only feature (bell/dropdown).
 */

import { clientApi } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import { API_ROUTES } from '@/config/routes';
import type {
  AppNotification,
  DeviceToken,
  RegisterDeviceTokenPayload,
  UnreadCount,
} from '@/types/notification';

export interface NotificationListParams {
  page?: number;
  per_page?: number;
}

/**
 * Get the current merchant user's notifications (paginated, newest first).
 */
export async function getNotifications(
  params: NotificationListParams = {}
): Promise<PaginatedResponse<AppNotification>> {
  return clientApi.get<PaginatedResponse<AppNotification>>(API_ROUTES.merchant.notifications.list(), {
    params,
  });
}

/**
 * Get the current merchant user's unread notification count.
 */
export async function getUnreadCount(): Promise<UnreadCount> {
  const response = await clientApi.get<ApiResponse<UnreadCount>>(
    API_ROUTES.merchant.notifications.unreadCount()
  );
  return response.data;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await clientApi.patch(API_ROUTES.merchant.notifications.markAsRead(notificationId));
}

/**
 * Mark all of the current user's notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await clientApi.patch(API_ROUTES.merchant.notifications.markAllAsRead());
}

/**
 * Register (or refresh) this device's FCM token for push delivery.
 */
export async function registerDeviceToken(
  payload: RegisterDeviceTokenPayload
): Promise<DeviceToken> {
  const response = await clientApi.post<ApiResponse<DeviceToken>>(
    API_ROUTES.merchant.notifications.deviceTokens.register(),
    payload
  );
  return response.data;
}

/**
 * Unregister a device token (e.g. on logout, or when push permission is revoked).
 */
export async function removeDeviceToken(token: string): Promise<void> {
  await clientApi.delete(API_ROUTES.merchant.notifications.deviceTokens.remove(token));
}
