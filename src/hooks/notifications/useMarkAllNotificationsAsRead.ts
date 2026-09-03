'use client';

/**
 * Hook for marking all of the current user's notifications as read.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsAsRead } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError, PaginatedResponse } from '@/types/api';
import type { AppNotification } from '@/types/notification';

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueriesData<PaginatedResponse<AppNotification>>(
        { queryKey: queryKeys.notifications.lists() },
        (current) => {
          if (!current) return current;
          const now = new Date().toISOString();
          return {
            ...current,
            data: current.data.map((notification) => ({
              ...notification,
              read_at: notification.read_at ?? now,
            })),
          };
        }
      );
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), { unread_count: 0 });
    },
    onError: (error: ApiError) => {
      logger.error('Mark all notifications as read failed', { error });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}
