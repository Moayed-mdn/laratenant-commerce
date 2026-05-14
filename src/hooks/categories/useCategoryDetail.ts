'use client';

/**
 * Hook for fetching a single category by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { getCategoryDetail } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapCategoryDetail } from '@/lib/mappers/categories';
import type { CategoryDetail, CategoryDetailView } from '@/types/category';
import type { ApiError } from '@/types/api';

export function useCategoryDetail(storeId: string, categoryId: string) {
  return useQuery<CategoryDetail, ApiError, CategoryDetailView>({
    queryKey: queryKeys.categories(storeId).detail(categoryId),
    queryFn:  () => getCategoryDetail(storeId, categoryId),
    staleTime: QUERY_CONFIG.staleTime,
    select:    mapCategoryDetail,
    enabled:   Boolean(storeId) && Boolean(categoryId),
  });
}
