/**
 * Dashboard data mappers.
 * Transform raw API responses into view-ready shapes.
 * Never use raw API types directly in UI components.
 */

import type {
  DashboardStats,
  DashboardStatsView,
  RecentOrderItem,
  RecentOrderItemView,
  TopProductItem,
  TopProductItemView,
} from '@/types/dashboard';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils/date';

/**
 * Map raw dashboard stats to view shape.
 * @param raw - Raw API response data
 * @param currency - Currency code for formatting
 */
export function mapDashboardStats(
  raw: DashboardStats,
  currency: string
): DashboardStatsView {
  const formatChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return {
    totalRevenue: formatCurrency(raw.total_revenue, currency),
    totalOrders: raw.total_orders.toLocaleString(),
    totalCustomers: raw.total_customers.toLocaleString(),
    totalProducts: raw.total_products.toLocaleString(),
    revenueChange: raw.revenue_change,
    ordersChange: raw.orders_change,
    customersChange: raw.customers_change,
    productsChange: raw.products_change,
    revenueChangeFormatted: formatChange(raw.revenue_change),
    ordersChangeFormatted: formatChange(raw.orders_change),
    customersChangeFormatted: formatChange(raw.customers_change),
    productsChangeFormatted: formatChange(raw.products_change),
    isRevenueUp: raw.revenue_change >= 0,
    isOrdersUp: raw.orders_change >= 0,
    isCustomersUp: raw.customers_change >= 0,
    isProductsUp: raw.products_change >= 0,
  };
}

/**
 * Map raw recent order item to view shape.
 * @param raw - Raw API response data
 * @param currency - Currency code for formatting
 */
export function mapRecentOrder(
  raw: RecentOrderItem,
  currency: string
): RecentOrderItemView {
  return {
    id: raw.id,
    orderNumber: raw.order_number,
    status: raw.status,
    paymentStatus: raw.payment_status,
    customerName: raw.customer.name,
    customerEmail: raw.customer.email,
    customerId: raw.customer.id,
    total: formatCurrency(raw.total, currency),
    createdAt: formatDate(raw.created_at),
    createdAtRelative: formatRelative(raw.created_at),
  };
}

/**
 * Map raw top product item to view shape.
 * @param raw - Raw API response data
 * @param currency - Currency code for formatting
 */
export function mapTopProduct(
  raw: TopProductItem,
  currency: string
): TopProductItemView {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    totalSold: raw.total_sold,
    totalSoldFormatted: raw.total_sold.toLocaleString(),
    revenue: formatCurrency(raw.revenue, currency),
  };
}
