'use client';

/**
 * Hook for fetching orders list with pagination and filters.
 */

import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/lib/api/orders';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { OrderFilters } from '@/schemas/orders';
import type { AdminOrder, OrderListItemView } from '@/types/order';
import type { PaginatedResponse, ApiError } from '@/types/api';
import { mapOrderListItem } from '@/lib/mappers/orders';
import { selectPaginatedList } from '@/lib/mappers/pagination';

export function useOrders(storeId: string, filters: OrderFilters) {
  return useQuery<PaginatedResponse<AdminOrder>, ApiError, PaginatedResponse<OrderListItemView>>({
    queryKey: queryKeys.orders(storeId).list(filters),
    queryFn: () => getOrders(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select: selectPaginatedList(mapOrderListItem),
  });
}
