/**
 * Notification & device token types for the merchant dashboard.
 *
 * Mirrors the backend contract exactly — see justshop-api
 * docs/notifications/CLIENT_PAYLOADS.md and API.md.
 */

/** Stable notification type discriminator. Append new values as the backend
 *  ships them — never rename/remove (see ADDING_A_SCENARIO.md on the backend). */
export type NotificationType =
  | 'order.placed'
  | 'order.status_changed'
  | 'order.cancelled'
  | 'order.received_merchant'
  | 'order.cancelled_by_customer'
  | 'order.high_value'
  | 'product.low_stock'
  | 'store.stripe_connect_status_changed'
  | 'subscription.trial_started'
  | 'subscription.activated'
  | 'subscription.status_changed'
  | 'lead.submitted'
  | 'merchant.registered'
  | 'store.created';

export type NotificationEntityType =
  | 'order'
  | 'product_variant'
  | 'store'
  | 'subscription'
  | 'lead'
  | 'user';

/** A single in-app notification (backed by Laravel's DatabaseNotification). */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entity_type: NotificationEntityType | null;
  entity_id: number | null;
  route: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface DeviceToken {
  id: number;
  platform: DevicePlatform;
  device_id: string | null;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface RegisterDeviceTokenPayload {
  token: string;
  platform: DevicePlatform;
  device_id?: string | null;
  device_name?: string | null;
}

export interface UnreadCount {
  unread_count: number;
}
