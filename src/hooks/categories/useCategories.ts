'use client';

/**
 * Hook for fetching paginated categories list.
 * Accepts optional filters — defaults to active categories when omitted
 * (used by CategorySelect which needs a flat list without pagination UI).
 */

import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapCategoryListItem } from '@/lib/mappers/categories';
import { selectPaginatedList } from '@/lib/mappers/pagination';
import type { CategoryListItem, CategoryListItemView } from '@/types/category';
import type { PaginatedResponse, ApiError } from '@/types/api';
import type { CategoryFilters } from '@/schemas/categories';

const DEFAULT_FILTERS: CategoryFilters = {
  is_active: 'true',
  page:      1,
  perPage:   100,
};

export function useCategories(
  storeId: string,
  filters: CategoryFilters = DEFAULT_FILTERS,
) {
  return useQuery<
    PaginatedResponse<CategoryListItem>,
    ApiError,
    PaginatedResponse<CategoryListItemView>
  >({
    queryKey: queryKeys.categories(storeId).list(
      filters as unknown as Record<string, unknown>,
    ),
    queryFn:   () => getCategories(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapCategoryListItem),
  });
}