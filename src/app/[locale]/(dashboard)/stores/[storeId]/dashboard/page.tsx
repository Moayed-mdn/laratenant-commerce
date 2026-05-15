/**
 * Dashboard page.
 * Thin wrapper with Suspense boundary for streaming.
 */

import { Suspense } from 'react';
import { DashboardSkeleton } from '@/features/dashboard/dashboard-overview/DashboardSkeleton';
import DashboardContent from '@/features/dashboard/dashboard-overview/DashboardContent';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface DashboardPageProps {
  params: Promise<{ storeId: string; locale: string }>;
}

/**
 * Generate metadata for the dashboard page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');

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
