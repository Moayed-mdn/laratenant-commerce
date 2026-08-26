/**
 * Theme overview page.
 * Server component that wraps the client-side themes content.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ThemesContent } from '@/features/theme/ThemesContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'theme' });

  return {
    title: t('overview.title'),
  };
}

export default function ThemesPage() {
  return <ThemesContent />;
}
