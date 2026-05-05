/**
 * Products API functions (client-side).
 */

import { apiClient } from '@/lib/api/client/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import { API_ROUTES } from '@/config/routes';
import type { AdminProduct, ProductCreatePayload, ProductUpdatePayload } from '@/types/product';
import type { ProductFilters } from '@/schemas/products';

/**
 * Get products list with filters.
 */
export async function getProducts(
  storeId: string,
  filters: ProductFilters
): Promise<PaginatedResponse<AdminProduct>> {
  const params: Record<string, string | number> = {};

  if (filters.search && filters.search !== '') {
    params.search = filters.search;
  }
  if (filters.status !== 'all') {
    params.status = filters.status;
  }
  if (filters.page !== 1) {
    params.page = filters.page;
  }
  if (filters.perPage !== 10) {
    params.per_page = filters.perPage;
  }
  
  const response = await apiClient.get<PaginatedResponse<AdminProduct>>(
    API_ROUTES.store(storeId).products().list(),
    { params }
  );

  return response.data;
}

/**
 * Get product detail by ID.
 */
export async function getProductDetail(
  storeId: string,
  productId: string
): Promise<AdminProduct> {
  const response = await apiClient.get<ApiResponse<AdminProduct>>(
    API_ROUTES.store(storeId).products().detail(productId)
  );

  return response.data.data;
}

/**
 * Create a new product.
 */
export async function createProduct(
  storeId: string,
  payload: ProductCreatePayload
): Promise<AdminProduct> {
  const response = await apiClient.post<ApiResponse<AdminProduct>>(
    API_ROUTES.store(storeId).products().list(),
    payload
  );

  return response.data.data;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  storeId: string,
  productId: string,
  payload: ProductUpdatePayload
): Promise<AdminProduct> {
  const response = await apiClient.patch<ApiResponse<AdminProduct>>(
    API_ROUTES.store(storeId).products().detail(productId),
    payload
  );

  return response.data.data;
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(
  storeId: string,
  productId: string
): Promise<void> {
  await apiClient.delete(API_ROUTES.store(storeId).products().detail(productId));
}
