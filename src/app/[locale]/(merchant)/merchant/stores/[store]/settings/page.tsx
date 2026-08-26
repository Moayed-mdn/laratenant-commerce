'use client';

import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useParams } from 'next/navigation';
import { StoreSettingsForm } from '@/features/merchant/settings/StoreSettingsForm';
import { useTranslations } from 'next-intl';
import { matchesStoreIdentifier } from '@/lib/stores/route-param';

/**
 * Store Settings Page.
 * Finds the store based on the URL parameter and renders the settings form.
 */
export default function MerchantStoreSettingsPage() {
  const params = useParams();
  const stores = useBootstrapStore((state) => state.stores);
  const t = useTranslations('nav');
  const tSettings = useTranslations('settings');

  const storeSlug = params.store as string;

  // Match store identifier via slug only.
  const store = stores.find((s) => matchesStoreIdentifier(s, storeSlug));

  if (!store) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{t('stores')}</h1>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive">{tSettings('storeNotFound.title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {tSettings('storeNotFound.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{store.name} {tSettings('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tSettings('description', { storeName: store.name })}
        </p>
      </div>

      <StoreSettingsForm store={store} />
    </div>
  );
}
