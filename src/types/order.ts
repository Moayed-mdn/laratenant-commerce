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
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
