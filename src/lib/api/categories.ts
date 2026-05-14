/**
 * Categories API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CategoryListItem,
  CategoryDetail,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category';
import type { CategoryFilters } from '@/schemas/categories';

/**
 * Convert is_active filter value to backend-expected format.
 * Backend validates the field as boolean (true/false),
 * but string "true"/"false" causes 422 — must send 1 or 0.
 */
function resolveIsActive(
  value: 'all' | 'true' | 'false',
): 1 | 0 | undefined {
  if (value === 'true')  return 1;
  if (value === 'false') return 0;
  return undefined; // 'all' → omit param entirely
}

/**
 * Fetch paginated categories list.
 */
export async function getCategories(
  storeId: string,
  filters: CategoryFilters,
): Promise<PaginatedResponse<CategoryListItem>> {
  const params: Record<string, string | number> = {};

  const isActive = resolveIsActive(filters.is_active);
  if (isActive !== undefined) params.is_active = isActive;
  if (filters.page !== 1)     params.page      = filters.page;
  if (filters.perPage !== 15) params.per_page  = filters.perPage;

  return clientApi.get<PaginatedResponse<CategoryListItem>>(
    API_ROUTES.store(storeId).categories().list(),
    { params },
  );
}

/**
 * Fetch single category by ID.
 */
export async function getCategoryDetail(
  storeId: string,
  categoryId: string,
): Promise<CategoryDetail> {
  const response = await clientApi.get<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().detail(categoryId),
  );
  return response.data;
}

/**
 * Create a new category.
 */
export async function createCategory(
  storeId: string,
  payload: CreateCategoryPayload,
): Promise<CategoryDetail> {
  const response = await clientApi.post<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().create(),
    payload,
  );
  return response.data;
}

/**
 * Update an existing category.
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<CategoryDetail> {
  const response = await clientApi.patch<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().update(categoryId),
    payload,
  );
  return response.data;
}

/**
 * Soft-delete a category.
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).categories().delete(categoryId),
  );
}

/**
 * Restore a soft-deleted category.
 */
export async function restoreCategory(
  storeId: string,
  categoryId: string,
): Promise<CategoryDetail> {
  const response = await clientApi.patch<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().restore(categoryId),
  );
  return response.data;
}