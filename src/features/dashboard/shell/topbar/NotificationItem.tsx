'use client';

import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/utils/date';
import { resolveNotificationRoute } from '@/lib/notifications/routing';
import type { AppNotification } from '@/types/notification';

interface NotificationItemProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification, route: string | null) => void;
}

export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('notifications');
  const isUnread = notification.read_at === null;
  const route = resolveNotificationRoute(notification);

  return (
    <button
      type="button"
      onClick={() => onOpen(notification, route)}
      className={cn(
        'flex w-full flex-col gap-1 rounded-md px-3 py-2.5 text-start transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
        isUnread && 'bg-primary/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('text-sm', isUnread ? 'font-semibold' : 'font-medium text-muted-foreground')}>
          {notification.title}
        </span>
        {isUnread && (
          <span
            aria-hidden
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          />
        )}
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
      <span className="text-[11px] text-muted-foreground/80">
        {notification.created_at ? formatRelative(notification.created_at, locale) : t('justNow')}
      </span>
    </button>
  );
}
