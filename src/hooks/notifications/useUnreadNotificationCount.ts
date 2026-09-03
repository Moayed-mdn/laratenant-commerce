'use client';

/**
 * Hook for the unread notification count (drives the topbar bell badge).
 *
 * Polls on an interval rather than relying on window-focus refetch, since
 * QUERY_CONFIG disables refetchOnWindowFocus globally — a merchant who
 * leaves the dashboard tab open should still see the badge update.
 */

import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/types/api';
import type { UnreadCount } from '@/types/notification';

const UNREAD_COUNT_POLL_INTERVAL_MS = 60_000;

export function useUnreadNotificationCount(enabled: boolean = true) {
  return useQuery<UnreadCount, ApiError>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: UNREAD_COUNT_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}
