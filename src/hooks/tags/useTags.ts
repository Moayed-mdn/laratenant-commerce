'use client';

import { useQuery } from '@tanstack/react-query';
import { getTags } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapTagListItem } from '@/lib/mappers/tags';
import { selectPaginatedList } from '@/lib/mappers/pagination';
import { useLocale } from 'next-intl';
import type { TagRaw, TagListItemView } from '@/types/tag';
import type { PaginatedResponse, ApiError } from '@/types/api';
import type { TagFilters } from '@/schemas/tags';

const DEFAULT_FILTERS: TagFilters = {
  search:    '',
  type:      '',
  is_active: 'all',
  page:      1,
  perPage:   15,
};

export function useTags(
  storeId: string,
  filters: TagFilters = DEFAULT_FILTERS,
) {
  const locale = useLocale();

  return useQuery<
    PaginatedResponse<TagRaw>,
    ApiError,
    PaginatedResponse<TagListItemView>
  >({
    queryKey:  queryKeys.tags(storeId).list(filters as unknown as Record<string, unknown>),
    queryFn:   () => getTags(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapTagListItem(locale)),
  });
}