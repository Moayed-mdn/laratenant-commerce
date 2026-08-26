'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { resolveBootstrapAccessState } from '@/lib/auth/bootstrap-routing';
import { useRouter } from '@/lib/navigation';

export default function DashboardEntryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('dashboard.entryAccess');
  const bootstrap = useBootstrapStore((state) => state.bootstrap);
  const provisioning = useBootstrapStore((state) => state.provisioning);
  const accessState = resolveBootstrapAccessState(bootstrap, provisioning);

  useEffect(() => {
    if (accessState.kind === 'ready') {
      router.push(accessState.redirectPath);
    }
  }, [accessState, router]);

  if (!bootstrap) {
    return null;
  }

  if (accessState.kind === 'ready') {
    return null;
  }

  if (accessState.kind === 'blocked' && bootstrap.active_store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">{t('blocked.title')}</h1>
          <p className="mt-3 text-muted-foreground">
            {t('blocked.description')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('blocked.currentStatus')} <span className="font-medium">{bootstrap.active_store.status}</span>
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button type="button" onClick={() => void queryClient.invalidateQueries({ queryKey: queryKeys.merchant.me() })}>
              {t('refreshSession')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold">{t('resolving.title')}</h1>
        <p className="mt-3 text-muted-foreground">
          {t('resolving.description')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button type="button" onClick={() => router.push(accessState.redirectPath)}>
            {t('continue')}
          </Button>
          <Button type="button" variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: queryKeys.merchant.me() })}>
            {t('refreshBootstrap')}
          </Button>
        </div>
      </div>
    </div>
  );
}
