'use client';

/**
 * Hook for fetching products list with pagination and filters.
 */

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api/products';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { ProductFilters } from '@/schemas/products';
import type { AdminProduct, ProductListItemView } from '@/types/product';
import type { PaginatedResponse, ApiError } from '@/types/api';
import { mapProductListItem } from '@/lib/mappers/products';

export function useProducts(storeId: string, filters: ProductFilters) {
  return useQuery<PaginatedResponse<AdminProduct>, ApiError, PaginatedResponse<ProductListItemView>>({
    queryKey: queryKeys.products(storeId).list(filters),
    queryFn: () => getProducts(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => ({
      ...data,
      data: data.data.map((item) => mapProductListItem(item)),
    }),
  });
}
