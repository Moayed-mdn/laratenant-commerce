'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRouter, Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { useBootstrapStore } from '@/stores/bootstrapStore';

function StorePickerContent() {
  const t = useTranslations('stores');
  const user = useBootstrapStore((state) => state.user);
  const stores = useBootstrapStore((state) => state.stores);
  const isLoading = useBootstrapStore((state) => state.isBootstrapping);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (stores.length === 0) {
      router.replace(ROUTES.setup());
      return;
    }

    if (stores.length === 1) {
      router.replace(ROUTES.merchant.dashboard());
      return;
    }
  }, [isLoading, router, stores, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || stores.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('welcome')}</h1>
          <p className="text-muted-foreground">
            {t('noStores')}
          </p>
          <Link
            href={ROUTES.setup()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90"
          >
            {t('createFirst')}
          </Link>
        </div>
      </div>
    );
  }

  if (stores.length === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('selectStore.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('selectStore.description')}
          </p>
        </div>

        <div className="space-y-3">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() =>
                router.push(ROUTES.merchant.dashboard())
              }
              className="w-full flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:border-primary transition-colors text-left"
            >
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-muted-foreground">
                  {store.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs rounded-full bg-secondary px-2 py-1 capitalize">
                  {store.role.replace('_', ' ')}
                </span>
                <span className="text-muted-foreground">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardHome() {
  return <StorePickerContent />;
}
