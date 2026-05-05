/**
 * Users API functions (client-side).
 */

import { apiClient } from '@/lib/api/client/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import { API_ROUTES } from '@/config/routes';
import type { UserListItem, UserDetail } from '@/types/user';
import type { UserFilters } from '@/schemas/users';

/**
 * Get users list with filters.
 */
export async function getUsers(
  storeId: string,
  filters: UserFilters
): Promise<PaginatedResponse<UserListItem>> {
  const params: Record<string, string | number> = {};

  if (filters.search && filters.search !== '') params.search = filters.search;
  if (filters.role !== 'all') params.role = filters.role;
  if (filters.status !== 'all') params.status = filters.status;
  if (filters.page !== 1) params.page = filters.page;
  if (filters.perPage !== 10) params.per_page = filters.perPage;

  const response = await apiClient.get<PaginatedResponse<UserListItem>>(
    API_ROUTES.store(storeId).users().list(),
    { params }
  );

  return response.data;
}

/**
 * Get user detail by ID.
 */
export async function getUserDetail(
  storeId: string,
  userId: string
): Promise<UserDetail> {
  const response = await apiClient.get<ApiResponse<UserDetail>>(
    API_ROUTES.store(storeId).users().detail(userId)
  );

  return response.data.data;
}

/**
 * Delete user by ID.
 */
export async function deleteUser(
  storeId: string,
  userId: string
): Promise<void> {
  await apiClient.delete(API_ROUTES.store(storeId).users().detail(userId));
}
