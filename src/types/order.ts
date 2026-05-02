/**
 * Order types for the admin dashboard.
 */

/** Order status union type */
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

/** Payment status union type */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Fulfillment status union type */
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

/** Order customer type */
export interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

/** Order line item type */
export interface OrderLineItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
}

/** Admin order type */
export interface AdminOrder {
  id: number;
  store_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  customer: OrderCustomer;
  line_items: OrderLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
}

/** Order list item view type (mapped for list UI) */
export interface OrderListItemView {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customerName: string;
  customerEmail: string;
  customerId: number;
  total: string;              // formatted currency
  itemCount: number;          // line_items.length
  createdAt: string;          // formatted date
  createdAtRelative: string;  // "2 hours ago"
}

/** Order line item view type (mapped for detail page) */
export interface OrderLineItemView {
  id: number;
  productId: number;
  productName: string;
  sku: string | null;
  quantity: number;
  price: string;              // formatted currency
  total: string;              // formatted currency
}

/** Order detail view type (mapped for detail page) */
export interface OrderDetailView {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customer: OrderCustomer;
  lineItems: OrderLineItemView[];
  subtotal: string;           // formatted currency
  tax: string;                // formatted currency
  shipping: string;           // formatted currency
  total: string;              // formatted currency
  currency: string;
  notes: string | null;
  createdAt: string;          // formatted date + time
  updatedAt: string;          // formatted date
}

/** Order update payload type */
export interface OrderUpdatePayload {
  status: OrderStatus;
}
