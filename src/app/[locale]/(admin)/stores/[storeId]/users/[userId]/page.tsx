/**
 * User detail page.
 * Server component with Suspense boundary.
 */

import { Suspense } from 'react';
import { logger } from '@/lib/logger';
import UserDetailContent from './_components/UserDetailContent';
import { UserDetailSkeleton } from './_components/UserDetailSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string; userId: string; locale: string }>;
}) {
  const { userId } = await params;
  return {
    title: `User ${userId}`,
    description: 'View customer details',
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ storeId: string; userId: string; locale: string }>;
}) {
  const { storeId, userId, locale } = await params;

  return (
    <Suspense fallback={<UserDetailSkeleton />}>
      <UserDetailContent storeId={storeId} userId={userId} />
    </Suspense>
  );
}
