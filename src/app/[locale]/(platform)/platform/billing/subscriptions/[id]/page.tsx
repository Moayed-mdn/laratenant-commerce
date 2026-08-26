/**
 * Platform subscription detail page.
 */

import { Suspense } from 'react';
import SubscriptionDetailContent from '@/features/platform/subscriptions/SubscriptionDetailContent';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata() {
  const t = await getTranslations('subscriptions');
  return {
    title: t('detail.title'),
    description: t('detail.subtitle'),
  };
}

export default async function SubscriptionDetailPage({ params }: Props) {
  const subscriptionId = parseInt(params.id, 10);
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<div className="p-8 text-center">{t('loading')}</div>}>
      <SubscriptionDetailContent subscriptionId={subscriptionId} />
    </Suspense>
  );
}
