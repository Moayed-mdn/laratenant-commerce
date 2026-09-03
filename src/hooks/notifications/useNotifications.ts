'use client';

/**
 * Hook for fetching the current merchant user's notifications.
 */

import { useQuery } from '@tanstack/react-query';
import { getNotifications, type NotificationListParams } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { AppNotification } from '@/types/notification';
import type { ApiError, PaginatedResponse } from '@/types/api';

export function useNotifications(params: NotificationListParams = {}, enabled: boolean = true) {
  return useQuery<PaginatedResponse<AppNotification>, ApiError>({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => getNotifications(params),
    staleTime: QUERY_CONFIG.staleTime,
    enabled,
  });
}
