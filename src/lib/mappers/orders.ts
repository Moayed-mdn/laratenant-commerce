/**
 * Order data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type { AdminOrder, OrderLineItem, OrderListItemView, OrderDetailView, OrderLineItemView } from '@/types/order';
import { formatDate, formatDateTime, formatRelative, formatCurrency } from '@/lib/utils/date';

/**
 * Map order line item from raw API shape to view shape.
 */
export function mapOrderLineItem(
  raw: OrderLineItem,
  currency: string = 'USD'
): OrderLineItemView {
  return {
    id: raw.id,
    productId: raw.product_id,
    productName: raw.product_name,
    sku: raw.sku,
    quantity: raw.quantity,
    price: formatCurrency(raw.price, currency),
    total: formatCurrency(raw.total, currency),
  };
}

/**
 * Map order list item from raw API shape to view shape.
 */
export function mapOrderListItem(
  raw: AdminOrder,
  currency: string = 'USD'
): OrderListItemView {
  return {
    id: raw.id,
    orderNumber: raw.order_number,
    status: raw.status,
    paymentStatus: raw.payment_status,
    fulfillmentStatus: raw.fulfillment_status,
    customerName: raw.customer.name,
    customerEmail: raw.customer.email,
    customerId: raw.customer.id,
    total: formatCurrency(raw.total, currency),
    itemCount: raw.line_items.length,
    createdAt: formatDate(raw.created_at),
    createdAtRelative: formatRelative(raw.created_at),
  };
}

/**
 * Map order detail from raw API shape to view shape.
 */
export function mapOrderDetail(
  raw: AdminOrder,
  currency: string = 'USD'
): OrderDetailView {
  return {
    id: raw.id,
    orderNumber: raw.order_number,
    status: raw.status,
    paymentStatus: raw.payment_status,
    fulfillmentStatus: raw.fulfillment_status,
    customer: raw.customer,
    lineItems: raw.line_items.map((item) => mapOrderLineItem(item, currency)),
    subtotal: formatCurrency(raw.subtotal, currency),
    tax: formatCurrency(raw.tax, currency),
    shipping: formatCurrency(raw.shipping, currency),
    total: formatCurrency(raw.total, currency),
    currency: raw.currency,
    notes: raw.notes,
    createdAt: formatDateTime(raw.created_at),
    updatedAt: formatDate(raw.updated_at),
  };
}
