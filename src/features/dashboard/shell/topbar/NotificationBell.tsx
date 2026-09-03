'use client';

/**
 * NotificationBell component.
 * Bell icon with an unread-count badge; opens a dropdown listing the
 * merchant user's recent notifications across all their stores.
 *
 * Only renders if FEATURES.enableNotifications is true.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Loader2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem';
import { useUnreadNotificationCount } from '@/hooks/notifications/useUnreadNotificationCount';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useMarkNotificationAsRead } from '@/hooks/notifications/useMarkNotificationAsRead';
import { useMarkAllNotificationsAsRead } from '@/hooks/notifications/useMarkAllNotificationsAsRead';
import { useRouter } from '@/lib/navigation';
import { FEATURES } from '@/config/features';
import type { AppNotification } from '@/types/notification';

const DROPDOWN_PAGE_SIZE = 10;

export function NotificationBell() {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useUnreadNotificationCount(FEATURES.enableNotifications);
  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useNotifications({ per_page: DROPDOWN_PAGE_SIZE }, open);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  if (!FEATURES.enableNotifications) {
    return null;
  }

  const unreadCount = unreadData?.unread_count ?? 0;
  const notifications = listData?.data ?? [];

  const handleOpenNotification = (notification: AppNotification, route: string | null) => {
    if (notification.read_at === null) {
      markAsRead.mutate(notification.id);
    }
    setOpen(false);
    if (route) {
      router.push(route);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'relative'
        )}
        aria-label={
          unreadCount > 0
            ? t('unreadBadgeAriaLabel', { count: unreadCount })
            : t('bellAriaLabel')
        }
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -end-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">{t('panelTitle')}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {t('markAllAsRead')}
            </button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-0.5 p-1.5">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t('loading')}
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t('retry')}
                </button>
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
                <p className="text-sm font-medium">{t('emptyTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('emptyDescription')}</p>
              </div>
            )}

            {!isLoading &&
              !isError &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={handleOpenNotification}
                />
              ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
