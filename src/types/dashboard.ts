/**
 * Dashboard types for the admin dashboard.
 * Raw API shapes and mapped view shapes are kept separate.
 * Never use raw API types directly in UI components.
 */

import type { OrderStatus, PaymentStatus } from '@/types/order';
import type { ProductStatus } from '@/types/product';

/**
 * Raw API response shape for dashboard stats.
 */
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  products_change: number;
}

/**
 * Mapped view shape for dashboard stats UI.
 */
export interface DashboardStatsView {
  totalRevenue: string;
  totalOrders: string;
  totalCustomers: string;
  totalProducts: string;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
  revenueChangeFormatted: string;
  ordersChangeFormatted: string;
  customersChangeFormatted: string;
  productsChangeFormatted: string;
  isRevenueUp: boolean;
  isOrdersUp: boolean;
  isCustomersUp: boolean;
  isProductsUp: boolean;
}

/**
 * Raw API response shape for a recent order item.
 */
export interface RecentOrderItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  total: number;
  currency: string;
  created_at: string;
}

/**
 * Mapped view shape for a recent order item UI.
 */
export interface RecentOrderItemView {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerEmail: string;
  customerId: number;
  total: string;
  createdAt: string;
  createdAtRelative: string;
}

/**
 * Raw API response shape for a top product item.
 */
export interface TopProductItem {
  id: number;
  name: string;
  status: ProductStatus;
  total_sold: number;
  revenue: number;
  currency: string;
}

/**
 * Mapped view shape for a top product item UI.
 */
export interface TopProductItemView {
  id: number;
  name: string;
  status: ProductStatus;
  totalSold: number;
  totalSoldFormatted: string;
  revenue: string;
}
