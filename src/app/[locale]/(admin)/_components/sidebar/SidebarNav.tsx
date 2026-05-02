'use client';

/**
 * SidebarNav component.
 * Renders navigation items based on user permissions.
 * 
 * Reason for 'use client': needs active route detection via usePathname.
 */

import { usePathname } from 'next/navigation';
import { useAuthStore, selectCan } from '@/stores/authStore';
import { useUiStore, selectSidebarCollapsed } from '@/stores/uiStore';
import { SidebarNavItem } from './SidebarNavItem';
import { ROUTES } from '@/config/routes';
import { useTranslations } from 'next-intl';
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
  const can = useAuthStore(selectCan);
  const isCollapsed = useUiStore(selectSidebarCollapsed);
  const t = useTranslations('nav');

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      href: ROUTES.store(storeId).dashboard(),
      icon: LayoutDashboard,
      show: true,
      exact: true,
    },
    {
      label: t('users'),
      href: ROUTES.store(storeId).users.list(),
      icon: Users,
      show: can('canManageUsers'),
    },
    {
      label: t('products'),
      href: ROUTES.store(storeId).products.list(),
      icon: Package,
      show: can('canManageProducts'),
    },
    {
      label: t('orders'),
      href: ROUTES.store(storeId).orders.list(),
      icon: ShoppingCart,
      show: can('canManageOrders'),
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
