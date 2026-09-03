'use client';

/**
 * Hook for marking a single notification as read.
 * Optimistically updates the list and unread count so the bell/badge
 * respond instantly, without waiting for the next poll.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError, PaginatedResponse } from '@/types/api';
import type { AppNotification, UnreadCount } from '@/types/notification';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      const previousLists = queryClient.getQueriesData<PaginatedResponse<AppNotification>>({
        queryKey: queryKeys.notifications.lists(),
      });
      const previousUnreadCount = queryClient.getQueryData<UnreadCount>(
        queryKeys.notifications.unreadCount()
      );

      let wasUnread = false;

      queryClient.setQueriesData<PaginatedResponse<AppNotification>>(
        { queryKey: queryKeys.notifications.lists() },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((notification) => {
              if (notification.id === notificationId && !notification.read_at) {
                wasUnread = true;
                return { ...notification, read_at: new Date().toISOString() };
              }
              return notification;
            }),
          };
        }
      );

      if (wasUnread && previousUnreadCount) {
        queryClient.setQueryData<UnreadCount>(queryKeys.notifications.unreadCount(), {
          unread_count: Math.max(0, previousUnreadCount.unread_count - 1),
        });
      }

      return { previousLists, previousUnreadCount };
    },
    onError: (error, _notificationId, context) => {
      logger.error('Mark notification as read failed', { error });
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}

export type UseMarkNotificationAsReadError = ApiError;
