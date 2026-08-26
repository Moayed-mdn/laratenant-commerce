/**
 * Platform dashboard page.
 */

import { Suspense } from 'react';
import PlatformDashboardContent from '@/features/platform/dashboard/PlatformDashboardContent';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('platformDashboard');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function PlatformDashboardPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('loading')}</div>}>
      <PlatformDashboardContent />
    </Suspense>
  );
}
