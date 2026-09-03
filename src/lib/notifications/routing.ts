/**
 * Resolves where clicking a notification should navigate to in this
 * dashboard, based on its `type` (see justshop-api
 * docs/notifications/CLIENT_PAYLOADS.md for the full contract).
 *
 * Returns null for notification types that have no corresponding screen in
 * this merchant dashboard (e.g. types sent only to customers or platform
 * admins) — the caller should still mark the notification as read, just
 * without navigating anywhere.
 */

import { ROUTES } from '@/config/routes';
import type { AppNotification } from '@/types/notification';

export function resolveNotificationRoute(notification: AppNotification): string | null {
  const { type, entity_id: entityId, data } = notification;

  switch (type) {
    case 'order.received_merchant':
    case 'order.cancelled_by_customer':
    case 'order.high_value':
    case 'order.placed':
    case 'order.status_changed':
    case 'order.cancelled':
      return entityId !== null ? ROUTES.merchant.orders.detail(String(entityId)) : null;

    case 'product.low_stock': {
      const productId = data?.product_id;
      return typeof productId === 'number' || typeof productId === 'string'
        ? ROUTES.merchant.products.edit(String(productId))
        : null;
    }

    case 'store.stripe_connect_status_changed':
      return ROUTES.merchant.settings();

    case 'subscription.trial_started':
    case 'subscription.activated':
    case 'subscription.status_changed':
      return ROUTES.merchant.billing.dashboard();

    // Platform-admin-only notification types — no route in this dashboard.
    case 'lead.submitted':
    case 'merchant.registered':
    case 'store.created':
      return null;

    default:
      return null;
  }
}
