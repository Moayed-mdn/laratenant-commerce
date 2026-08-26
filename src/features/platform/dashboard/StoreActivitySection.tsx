/**
 * Store Activity section — GMV metrics.
 * Shows totalOrders, totalRevenue (store sales), and store status breakdown.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import type { PlatformDashboardStatsView } from '@/types/platform-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, DollarSign } from 'lucide-react';

interface Props {
  stats: PlatformDashboardStatsView;
}

export function StoreActivitySection({ stats }: Props) {
  const t = useTranslations('platformDashboard.storeActivity');

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalOrders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} {t('pending')}
            </p>
          </CardContent>
        </Card>

        {/* Store Sales (GMV) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('storeSales')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(stats.revenueTrend.direction)}
              <span>{stats.revenueThisMonth} {t('thisMonth')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Store Status Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('stores')}</CardTitle>
            <CardDescription className="text-xs">{t('storesBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.totalStores}</div>
                <p className="text-xs text-muted-foreground">{t('total')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{stats.activeStores}</div>
                <p className="text-xs text-muted-foreground">{t('active')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{stats.pendingStores}</div>
                <p className="text-xs text-muted-foreground">{t('pendingStores')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-danger">{stats.suspendedStores}</div>
                <p className="text-xs text-muted-foreground">{t('suspended')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
