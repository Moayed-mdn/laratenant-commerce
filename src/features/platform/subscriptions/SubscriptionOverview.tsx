/**
 * Subscription overview card.
 * Shows status, plan, pricing, and all period/trial/cancellation dates.
 */

import { useLocale, useTranslations } from 'next-intl';
import type { SubscriptionDetailView } from '@/types/billing/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Props {
  subscription: SubscriptionDetailView;
}

export function SubscriptionOverview({ subscription }: Props) {
  const t = useTranslations('subscriptions.detail');
  const locale = useLocale();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('overview')}</CardTitle>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
        <CardDescription>{t('subscriptionDetails')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('plan')}</h4>
            <div className="mt-1">
              <p className="font-semibold">{subscription.plan?.name || '—'}</p>
              <p className="text-sm text-muted-foreground">
                {subscription.plan?.code} • {subscription.plan?.tier}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('price')}</h4>
            <div className="mt-1">
              <p className="font-semibold">{subscription.priceFormatted}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {subscription.billingCycle || 'monthly'}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Plan Change */}
        {subscription.pendingPlan && (
          <div className="rounded-lg border border-info/30 bg-info-bg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-info mt-0.5" />
              <div>
                <h4 className="font-medium text-info">{t('pendingChange')}</h4>
                <p className="text-sm text-info mt-1">
                  {t('changingTo')} <strong>{subscription.pendingPlan.name}</strong> {t('on')}{' '}
                  {subscription.pendingPlanEffectiveAtFormatted}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          {subscription.trialStartsAt && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">{t('trialPeriod')}</h4>
              <p className="text-sm mt-1">
                {formatDate(subscription.trialStartsAt)} → {formatDate(subscription.trialEndsAt)}
              </p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('currentPeriod')}</h4>
            <p className="text-sm mt-1">
              {formatDate(subscription.currentPeriodStartsAt)} → {formatDate(subscription.currentPeriodEndsAt)}
            </p>
          </div>
          {subscription.gracePeriodEndsAt && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">{t('gracePeriodEnds')}</h4>
              <p className="text-sm mt-1">{formatDate(subscription.gracePeriodEndsAt)}</p>
            </div>
          )}
          {subscription.canceledAt && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">{t('canceledAt')}</h4>
              <p className="text-sm mt-1">{formatDate(subscription.canceledAt)}</p>
              {subscription.cancelAtPeriodEnd && (
                <Badge variant="outline" className="mt-1">
                  {t('endsAt')} {formatDate(subscription.currentPeriodEndsAt)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('providerInfo')}</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('provider')}</span>
              <span className="font-medium">{subscription.provider}</span>
            </div>
            {subscription.providerSubscriptionId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('providerSubscriptionId')}</span>
                <span className="font-mono text-xs">{subscription.providerSubscriptionId}</span>
              </div>
            )}
            {subscription.providerStatus && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('providerStatus')}</span>
                <span>{subscription.providerStatus}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
