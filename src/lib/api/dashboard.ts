/**
 * Dashboard API functions for client-side use.
 * Uses apiClient (axios) for HTTP requests.
 * Never use these functions in RSC — use serverFetch instead.
 */

import { apiClient } from '@/lib/api/client/axios';
import type { ApiResponse } from '@/types/api';
import { API_ROUTES } from '@/config/routes';
import type {
  DashboardStats,
  RecentOrderItem,
  TopProductItem,
} from '@/types/dashboard';

/**
 * Fetch dashboard stats for a store.
 * @param storeId - Store ID from URL params
 */
export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    API_ROUTES.store(storeId).dashboard.stats()
  );
  return response.data.data;
}

/**
 * Fetch recent orders for a store.
 * @param storeId - Store ID from URL params
 */
export async function getRecentOrders(storeId: string): Promise<RecentOrderItem[]> {
  const response = await apiClient.get<ApiResponse<RecentOrderItem[]>>(
    API_ROUTES.store(storeId).dashboard.recentOrders()
  );
  return response.data.data;
}

/**
 * Fetch top products for a store.
 * @param storeId - Store ID from URL params
 */
export async function getTopProducts(storeId: string): Promise<TopProductItem[]> {
  const response = await apiClient.get<ApiResponse<TopProductItem[]>>(
    API_ROUTES.store(storeId).dashboard.topProducts()
  );
  return response.data.data;
}
