/**
 * Dashboard page.
 * Thin wrapper with Suspense boundary for streaming.
 */

import { Suspense } from 'react';
import { DashboardSkeleton } from './_components/DashboardSkeleton';
import DashboardContent from './_components/DashboardContent';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface DashboardPageProps {
  params: Promise<{ storeId: string; locale: string }>;
}

/**
 * Generate metadata for the dashboard page.
 */
export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return {
    title: t('title'),
  };
}

/**
 * Dashboard page component with Suspense boundary.
 */
export default async function DashboardPage({ params }: DashboardPageProps) {
  const { storeId, locale } = await params;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent storeId={storeId} />
    </Suspense>

  );
}
