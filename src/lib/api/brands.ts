/**
 * Brands API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  BrandListItem,
  BrandDetail,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@/types/brand';
import type { BrandFilters } from '@/schemas/brands';

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
 * Fetch paginated brands list.
 */
export async function getBrands(
  storeId: string,
  filters: BrandFilters,
): Promise<PaginatedResponse<BrandListItem>> {
  const params: Record<string, string | number> = {};

  const isActive = resolveIsActive(filters.is_active);
  if (isActive !== undefined) params.is_active = isActive;
  if (filters.page !== 1)     params.page      = filters.page;
  if (filters.perPage !== 15) params.per_page  = filters.perPage;

  return clientApi.get<PaginatedResponse<BrandListItem>>(
    API_ROUTES.store(storeId).brands().list(),
    { params },
  );
}

/**
 * Fetch single brand by ID.
 */
export async function getBrandDetail(
  storeId: string,
  brandId: string,
): Promise<BrandDetail> {
  const response = await clientApi.get<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().detail(brandId),
  );
  return response.data;
}

/**
 * Create a new brand.
 */
export async function createBrand(
  storeId: string,
  payload: CreateBrandPayload,
): Promise<BrandDetail> {
  const response = await clientApi.post<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().create(),
    payload,
  );
  return response.data;
}

/**
 * Update an existing brand.
 */
export async function updateBrand(
  storeId: string,
  brandId: string,
  payload: UpdateBrandPayload,
): Promise<BrandDetail> {
  const response = await clientApi.patch<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().update(brandId),
    payload,
  );
  return response.data;
}

/**
 * Soft-delete a brand.
 */
export async function deleteBrand(
  storeId: string,
  brandId: string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).brands().delete(brandId),
  );
}

/**
 * Restore a soft-deleted brand.
 */
export async function restoreBrand(
  storeId: string,
  brandId: string,
): Promise<BrandDetail> {
  const response = await clientApi.patch<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().restore(brandId),
  );
  return response.data;
}