/**
 * Stats grid component displaying all dashboard stats.
 * Pure display component — no client state needed.
 */

import { StatCard, type StatCardIcon } from './StatCard';
import type { DashboardStatsView } from '@/types/dashboard';
import { getTranslations } from 'next-intl/server';

interface StatsGridProps {
  stats: DashboardStatsView;
}

/**
 * Grid of stat cards for dashboard metrics.
 */
export async function StatsGrid({ stats }: StatsGridProps) {
  const t = await getTranslations('dashboard');

  const statCards: Array<{
    title: string;
    value: string;
    change: string;
    isUp: boolean;
    icon: StatCardIcon;
  }> = [
    {
      title: t('stats.revenue'),
      value: stats.totalRevenue,
      change: stats.revenueChangeFormatted,
      isUp: stats.isRevenueUp,
      icon: 'revenue',
    },
    {
      title: t('stats.orders'),
      value: stats.totalOrders,
      change: stats.ordersChangeFormatted,
      isUp: stats.isOrdersUp,
      icon: 'orders',
    },
    {
      title: t('stats.customers'),
      value: stats.totalCustomers,
      change: stats.customersChangeFormatted,
      isUp: stats.isCustomersUp,
      icon: 'customers',
    },
    {
      title: t('stats.products'),
      value: stats.totalProducts,
      change: stats.productsChangeFormatted,
      isUp: stats.isProductsUp,
      icon: 'products',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          isUp={stat.isUp}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
