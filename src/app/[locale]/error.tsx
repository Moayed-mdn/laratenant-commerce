'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

interface LocaleErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleErrorPage({ error, reset }: LocaleErrorPageProps) {
  const router = useRouter();
  const t = useTranslations('errorBoundary');
  void error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-3 text-muted-foreground">
          {t('description')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('hint')}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            {t('retry')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.dashboard.home())}>
            {t('dashboardHome')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.auth.login())}>
            {t('login')}
          </Button>
        </div>
      </div>
    </div>
  );
}
