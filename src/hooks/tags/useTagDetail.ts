'use client';

import { useQuery } from '@tanstack/react-query';
import { getTagDetail } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapTagDetail } from '@/lib/mappers/tags';
import { useLocale } from 'next-intl';
import type { TagRaw, TagDetailView } from '@/types/tag';
import type { ApiError } from '@/types/api';

export function useTagDetail(storeId: string, tagId: string) {
  const locale = useLocale();

  return useQuery<TagRaw, ApiError, TagDetailView>({
    queryKey:  queryKeys.tags(storeId).detail(tagId),
    queryFn:   () => getTagDetail(storeId, tagId),
    staleTime: QUERY_CONFIG.staleTime,
    select:    mapTagDetail(locale),
    enabled:   Boolean(storeId) && Boolean(tagId),
  });
}