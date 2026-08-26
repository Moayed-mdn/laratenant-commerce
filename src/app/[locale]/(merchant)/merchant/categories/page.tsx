'use client';

import { useBootstrapStore } from '@/stores/bootstrapStore';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import { MerchantPageHeader } from '@/features/merchant/components/MerchantPageHeader';
import CategoriesContent from '@/features/dashboard/categories/CategoriesContent';
import { useTranslations } from 'next-intl';
import { FolderTree, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { getStoreRouteParam } from '@/lib/stores/route-param';

const INITIAL_FILTERS = {
  is_active: 'all' as const,
  page: 1,
  perPage: 10,
};

/**
 * Merchant Workspace Categories Page.
 * Displays the categories list for the currently active store.
 */
export default function MerchantCategoriesPage() {
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const t = useTranslations('nav');
  const ct = useTranslations('categories');

  if (!activeStore) {
    return (
      <div className="flex flex-col gap-6">
        <MerchantPageHeader
          title={t('categories')}
          description={ct('subtitle')}
        />
        <WorkspaceEmptyState icon={FolderTree} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        title={t('categories')}
        description={ct('subtitle')}
      >
        <Link href={ROUTES.merchant.categories.new()}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {ct('new')}
          </Button>
        </Link>
      </MerchantPageHeader>
      <CategoriesContent storeSlug={getStoreRouteParam(activeStore)} initialFilters={INITIAL_FILTERS} />
    </div>
  );
}
