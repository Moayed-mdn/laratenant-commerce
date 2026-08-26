'use client';

import { useParams } from 'next/navigation';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import { useUserDetail } from '@/hooks/users/useUserDetail';
import { useTranslations } from 'next-intl';
import { UserDetailSkeleton } from '@/features/dashboard/users/UserDetailSkeleton';
import UserDetailCard from '@/features/dashboard/users/UserDetailCard';
import { getStoreRouteParam } from '@/lib/stores/route-param';

/**
 * Merchant Workspace — Customer Detail Content (Client Component).
 * Handles interactivity, hooks, state, etc.
 */
export default function MerchantCustomerDetailContent() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const t = useTranslations('users');

  const storeSlug = getStoreRouteParam(activeStore);

  const { data: user, isLoading, error } = useUserDetail(storeSlug, userId);

  if (!activeStore) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{t('detail.title')}</h1>
        </div>
        <WorkspaceEmptyState
          title={t('noActiveStore.title')}
          message={t('noActiveStore.message')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <p className="text-destructive">{t('detail.error')}</p>
      </div>
    );
  }

  return <UserDetailCard user={user} storeSlug={storeSlug} />;
}
