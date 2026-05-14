'use client';

/**
 * Hook for fetching paginated brands list.
 * Accepts optional filters — defaults to active brands when omitted
 * (used by BrandSelect which needs a flat list without pagination UI).
 */

import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/lib/api/brands';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapBrandListItem } from '@/lib/mappers/brands';
import { selectPaginatedList } from '@/lib/mappers/pagination';
import type { BrandListItem, BrandListItemView } from '@/types/brand';
import type { PaginatedResponse, ApiError } from '@/types/api';
import type { BrandFilters } from '@/schemas/brands';

const DEFAULT_FILTERS: BrandFilters = {
  is_active: 'true',
  page:      1,
  perPage:   100,
};

export function useBrands(
  storeId: string,
  filters: BrandFilters = DEFAULT_FILTERS,
) {
  return useQuery<
    PaginatedResponse<BrandListItem>,
    ApiError,
    PaginatedResponse<BrandListItemView>
  >({
    queryKey: queryKeys.brands(storeId).list(
      filters as unknown as Record<string, unknown>,
    ),
    queryFn:   () => getBrands(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapBrandListItem),
  });
}