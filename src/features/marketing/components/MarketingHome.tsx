'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export function MarketingHome() {
  const t = useTranslations('marketing');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('home.hero.headline')}</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {t('home.hero.subtext')}
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90">
          {t('cta.login')}
        </Link>
        <Link href="/pricing" className="border px-6 py-2 rounded-md font-medium hover:bg-accent">
          {t('nav.pricing')}
        </Link>
      </div>
    </div>
  );
}
