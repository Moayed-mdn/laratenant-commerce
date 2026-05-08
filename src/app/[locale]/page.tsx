'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/routes';

function StorePickerContent() {
  const t = useTranslations('stores');
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated — middleware handles redirect to /login
    // but just in case:
    if (!user) {
      router.replace('/login');
      return;
    }

    const stores = user.stores ?? [];

    // No stores — redirect to create store page
    if (stores.length === 0) {
      router.replace(ROUTES.stores.new());
      return;
    }

    // One store — auto redirect to its dashboard
    if (stores.length === 1) {
      router.replace(
        ROUTES.store(String(stores[0].id)).dashboard()
      );
      return;
    }

    // Multiple stores — stay on this page and show picker
    // (rendered below)
  }, [user, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No stores
  if (!user || user.stores.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('welcome')}</h1>
          <p className="text-muted-foreground">
            {t('noStores')}
          </p>
          <a
            href={ROUTES.stores.new()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90"
          >
            {t('createFirst')}
          </a>
        </div>
      </div>
    );
  }

  // Multiple stores — show picker
  if (user.stores.length === 1) {
    // Still redirecting — show spinner
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
          <h1 className="text-2xl font-bold">Select a Store</h1>
          <p className="text-muted-foreground mt-1">
            Choose which store you want to manage
          </p>
        </div>

        <div className="space-y-3">
          {user.stores.map((store) => (
            <button
              key={store.id}
              onClick={() =>
                router.push(
                  ROUTES.store(String(store.id)).dashboard()
                )
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

export default function HomePage() {
  return (
    <AuthProvider>
      <StorePickerContent />
    </AuthProvider>
  );
}