'use client';

/**
 * SidebarNav component.
 * Renders navigation items based on user permissions.
 *
 * Reason for 'use client': needs active route detection via usePathname.
 */

import { usePathname } from '@/lib/navigation';
import { useCan } from '@/stores/authStore';
import { useUiStore, selectSidebarCollapsed } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNavItem } from './SidebarNavItem';
import { ROUTES } from '@/config/routes';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, ShoppingCart, Store, type LucideIcon } from 'lucide-react';

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
  const { user } = useAuth();

  const isSuperAdmin = user?.stores?.[0]?.role === 'super_admin';
  const hasMultipleStores = (user?.stores?.length ?? 0) > 1;
  const isStaff = user?.stores?.find(
    s => String(s.id) === storeId
  )?.role === 'staff';
  const showStoresLink = !isStaff && (isSuperAdmin || hasMultipleStores);

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
      show: canManageUsers,
    },
    {
      label: t('products'),
      href: ROUTES.store(storeId).products.list(),
      icon: Package,
      show: canManageProducts,
    },
    {
      label: t('orders'),
      href: ROUTES.store(storeId).orders.list(),
      icon: ShoppingCart,
      show: canManageOrders,
    },
  ];

  const visibleItems = navItems.filter((item) => item.show);

  const storesItem: NavItem = {
    label: t('stores'),
    href: '/',
    icon: Store,
    show: showStoresLink,
    exact: true,
  };

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
        {storesItem.show && (
          <>
            <li
              role="separator"
              className={cn(
                'my-2 border-t border-sidebar-border',
                isCollapsed && 'mx-2'
              )}
            />
            <SidebarNavItem
              key={storesItem.href}
              label={storesItem.label}
              href={storesItem.href}
              icon={storesItem.icon}
              isCollapsed={isCollapsed}
              isActive={pathname === storesItem.href}
            />
          </>
        )}
      </ul>
    </nav>
  );
}
