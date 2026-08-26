/**
 * Platform Revenue section — SaaS subscription metrics.
 * Shows totalSubscriptionRevenue and subscription status breakdown.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import type { PlatformDashboardStatsView } from '@/types/platform-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, CreditCard, ArrowRight } from 'lucide-react';

interface Props {
  stats: PlatformDashboardStatsView;
}

export function PlatformRevenueSection({ stats }: Props) {
  const t = useTranslations('platformDashboard.platformRevenue');

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
        <Link href={ROUTES.platform.billing.subscriptions.list()}>
          <Button variant="outline" size="sm">
            {t('viewSubscriptions')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Subscription Revenue */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('subscriptionRevenue')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptionRevenue}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(stats.subscriptionRevenueTrend.direction)}
              <span>{stats.subscriptionRevenueThisMonth} {t('thisMonth')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('subscriptions')}</CardTitle>
            <CardDescription className="text-xs">{t('subscriptionsBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              <div>
                <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                <p className="text-xs text-muted-foreground">{t('total')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">{t('active')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">{stats.trialingSubscriptions}</div>
                <p className="text-xs text-muted-foreground">{t('trialing')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-danger">{stats.pastDueSubscriptions}</div>
                <p className="text-xs text-muted-foreground">{t('pastDue')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted">{stats.canceledSubscriptions}</div>
                <p className="text-xs text-muted-foreground">{t('canceled')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
