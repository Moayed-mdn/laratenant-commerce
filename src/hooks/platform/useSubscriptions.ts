'use client';

/**
 * Hooks for fetching platform subscriptions.
 */

import { useQuery } from '@tanstack/react-query';
import { getSubscriptions, getSubscriptionDetail } from '@/lib/api/platform/subscriptions';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { 
  SubscriptionListItem, 
  SubscriptionListItemView,
  SubscriptionDetail,
  SubscriptionDetailView,
  SubscriptionFilters 
} from '@/types/billing/subscription';
import type { PaginatedResponse, ApiError } from '@/types/api';
import { mapSubscriptionListItem, mapSubscriptionDetail } from '@/lib/mappers/subscriptions';
import { selectPaginatedList } from '@/lib/mappers/pagination';

export function useSubscriptions(filters: SubscriptionFilters, locale: string = 'en') {
  return useQuery<
    PaginatedResponse<SubscriptionListItem>,
    ApiError,
    PaginatedResponse<SubscriptionListItemView>
  >({
    queryKey: queryKeys.platform.subscriptions.list(filters as unknown as Record<string, unknown>),
    queryFn: () => getSubscriptions(filters),
    staleTime: QUERY_CONFIG.staleTime,
    select: selectPaginatedList((item) => mapSubscriptionListItem(item, locale)),
  });
}

export function useSubscriptionDetail(id: number, locale: string = 'en') {
  return useQuery<SubscriptionDetail, ApiError, SubscriptionDetailView>({
    queryKey: queryKeys.platform.subscriptions.detail(id),
    queryFn: () => getSubscriptionDetail(id),
    staleTime: QUERY_CONFIG.staleTime,
    select: (detail) => mapSubscriptionDetail(detail, locale),
  });
}
