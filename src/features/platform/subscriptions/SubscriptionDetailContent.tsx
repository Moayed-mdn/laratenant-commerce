'use client';

/**
 * Subscription detail page content (client component).
 */

import { useSubscriptionDetail } from '@/hooks/platform/useSubscriptions';
import { useLocale, useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionOverview } from './SubscriptionOverview';
import { SubscriptionMerchantPanel } from './SubscriptionMerchantPanel';
import { SubscriptionInvoices } from './SubscriptionInvoices';
import { SubscriptionEvents } from './SubscriptionEvents';

interface Props {
  subscriptionId: number;
}

export default function SubscriptionDetailContent({ subscriptionId }: Props) {
  const t = useTranslations('subscriptions');
  const locale = useLocale();
  const { data: subscription, isLoading, error } = useSubscriptionDetail(subscriptionId, locale);

  if (error) {
    logger.error('[SubscriptionDetailContent] Failed to load subscription', error);
    const httpStatus = (error as { status?: number }).status;
    
    return (
      <div className="space-y-4">
        <Link href={ROUTES.platform.billing.subscriptions.list()}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('detail.back')}
          </Button>
        </Link>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <p className="text-destructive">
            {httpStatus === 404 ? t('detail.notFound') : t('detail.error')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !subscription) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.platform.billing.subscriptions.list()}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('detail.back')}
          </Button>
        </Link>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.platform.billing.subscriptions.list()}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('detail.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {t('detail.title')} #{subscription.id}
            </h1>
            <p className="text-sm text-muted-foreground">{subscription.merchant.ownerEmail}</p>
          </div>
        </div>
      </div>

      <SubscriptionOverview subscription={subscription} />
      <SubscriptionMerchantPanel subscription={subscription} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionInvoices subscription={subscription} />
        <SubscriptionEvents subscription={subscription} />
      </div>
    </div>
  );
}
