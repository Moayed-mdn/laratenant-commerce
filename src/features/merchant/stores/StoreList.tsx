'use client';

import { useTranslations } from 'next-intl';
import { Store } from '@/types/store';
import { StoreListItem } from './StoreListItem';
import { WorkspaceEmptyState } from '../components/WorkspaceEmptyState';
import { ROUTES } from '@/config/routes';
import { Building2 } from 'lucide-react';

interface StoreListProps {
  stores: Store[];
}

/**
 * List of stores for the merchant workspace.
 * Renders an empty state if no stores exist.
 */
export function StoreList({ stores }: StoreListProps) {
  const t = useTranslations('stores');

  if (stores.length === 0) {
    return (
      <WorkspaceEmptyState
        icon={Building2}
        title={t('noStoresFound.title')}
        message={t('noStoresFound.message')}
        actionLabel={t('noStoresFound.actionLabel')}
        actionHref={ROUTES.setup()}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {stores.map((store) => (
        <StoreListItem key={store.id} store={store} />
      ))}
    </div>
  );
}
