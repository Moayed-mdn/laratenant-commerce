'use client';

/**
 * SidebarNav component.
 * Renders navigation items based on user permissions.
 *
 * Reason for 'use client': needs active route detection via usePathname.
 */

import { usePathname } from 'next/navigation';
import { useCan } from '@/stores/authStore';
import { useUiStore, selectSidebarCollapsed } from '@/stores/uiStore';
import { SidebarNavItem } from './SidebarNavItem';
import { ROUTES } from '@/config/routes';
import { useTranslations, useLocale } from 'next-intl';
import { LayoutDashboard, Users, Package, ShoppingCart, type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  show: boolean;
  exact?: boolean;
}

interface SidebarNavProps {
  storeId: string;
}

/**
 * Navigation list component with permission-based item filtering.
 */
export function SidebarNav({ storeId }: SidebarNavProps) {
  const pathname = usePathname();
  const canManageUsers = useCan('canManageUsers');
  const canManageProducts = useCan('canManageProducts');
  const canManageOrders = useCan('canManageOrders');
  const isCollapsed = useUiStore(selectSidebarCollapsed);
  const t = useTranslations('nav');
  const locale = useLocale();

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      href: ROUTES.store(locale, storeId).dashboard(),
      icon: LayoutDashboard,
      show: true,
      exact: true,
    },
    {
      label: t('users'),
      href: ROUTES.store(locale, storeId).users.list(),
      icon: Users,
      show: canManageUsers,
    },
    {
      label: t('products'),
      href: ROUTES.store(locale, storeId).products.list(),
      icon: Package,
      show: canManageProducts,
    },
    {
      label: t('orders'),
      href: ROUTES.store(locale, storeId).orders.list(),
      icon: ShoppingCart,
      show: canManageOrders,
    },
  ];

  const visibleItems = navItems.filter((item) => item.show);

  return (
    <nav aria-label={t('mainNav')} className="flex-1 overflow-y-auto px-2 py-4">
      <ul role="list" className="space-y-1">
        {visibleItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <SidebarNavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
          );
        })}
      </ul>
    </nav>
  );
}
