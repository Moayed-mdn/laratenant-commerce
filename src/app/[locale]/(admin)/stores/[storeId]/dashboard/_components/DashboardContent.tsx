/**
 * Dashboard content component.
 * Async RSC that fetches all dashboard data and renders the page content.
 * Wrapped in Suspense by the parent page for streaming.
 */

import { serverFetch } from '@/lib/api/server';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse } from '@/types/api';
import type { DashboardStats, RecentOrderItem, TopProductItem } from '@/types/dashboard';
import { mapDashboardStats, mapRecentOrder, mapTopProduct } from '@/lib/mappers/dashboard';
import { getTranslations } from 'next-intl/server';
import { StatsGrid } from './StatsGrid';
import { RecentOrdersTable } from './RecentOrdersTable';
import { TopProductsList } from './TopProductsList';
import { logger } from '@/lib/logger';

interface DashboardContentProps {
  storeId: string;
}

/**
 * Main dashboard content with server-side data fetching.
 */
export default async function DashboardContent({ storeId }: DashboardContentProps) {
  const t = await getTranslations('dashboard');

  try {
    // Fetch all data in parallel
    const [statsRaw, recentOrdersRaw, topProductsRaw] = await Promise.all([
      serverFetch<ApiResponse<DashboardStats>>(
        API_ROUTES.store(storeId).dashboard().stats()
      ),
      serverFetch<ApiResponse<RecentOrderItem[]>>(
        API_ROUTES.store(storeId).dashboard().recentOrders()
      ),
      serverFetch<ApiResponse<TopProductItem[]>>(
        API_ROUTES.store(storeId).dashboard().topProducts()
      ),
    ]);

    // Default currency fallback — Phase 2 will get this from store settings
    const currency = 'USD';

    // Map raw data to view shapes
    const stats = mapDashboardStats(statsRaw.data, currency);
    const recentOrders = recentOrdersRaw.data.map((o) => mapRecentOrder(o, currency));
    const topProducts = topProductsRaw.data.map((p) => mapTopProduct(p, currency));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted text-sm mt-1">{t('subtitle')}</p>
        </div>
        <StatsGrid stats={stats} />
        <div className="grid gap-6 md:grid-cols-2">
          <RecentOrdersTable orders={recentOrders} storeId={storeId} />
          <TopProductsList products={topProducts} storeId={storeId} />
        </div>
      </div>
    );
  } catch (error) {
    logger.error('[DashboardContent] Failed to fetch dashboard data', error);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted text-sm mt-1">{t('subtitle')}</p>
        </div>
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-destructive text-sm">{t('error')}</p>
        </div>
      </div>
    );
  }
}
