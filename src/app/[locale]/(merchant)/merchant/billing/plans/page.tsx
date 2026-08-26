/**
 * Plan Selection Page
 * Browse and select subscription plans
 */

import { getTranslations } from 'next-intl/server';
import { PlansPageClient } from './PlansPageClient';

export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'billing.plans' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function PlansPage() {
  return <PlansPageClient />;
}
