/**
 * Platform subscriptions list page.
 */

import { Suspense } from 'react';
import SubscriptionsContent from '@/features/platform/subscriptions/SubscriptionsContent';
import { defaultSubscriptionFilters } from '@/schemas/subscriptions';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('subscriptions');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function SubscriptionsPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('loading')}</div>}>
      <SubscriptionsContent initialFilters={defaultSubscriptionFilters} />
    </Suspense>
  );
}
