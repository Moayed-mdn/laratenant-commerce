'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('notFound');
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">{t('code')}</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">
        {t('description')}
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        {t('goHome')}
      </Link>
    </div>
  );
}
