'use client';

/**
 * Platform admin sidebar navigation.
 * Shows platform-level navigation items for super admins.
 */

import { usePathname } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

/**
 * Platform navigation component.
 */
export function PlatformSidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems: NavItem[] = [
    {
      label: t('platformDashboard'),
      href: ROUTES.platform.dashboard(),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: t('subscriptions'),
      href: ROUTES.platform.billing.subscriptions.list(),
      icon: CreditCard,
    },
  ];

  return (
    <nav aria-label={t('a11yNavigation')} className="flex-1 overflow-y-auto px-2 py-4">
      <ul role="list" className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
