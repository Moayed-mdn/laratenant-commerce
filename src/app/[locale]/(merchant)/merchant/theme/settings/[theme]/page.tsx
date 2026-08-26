/**
 * Theme settings page.
 * Server component that wraps the client-side theme settings content.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ThemeSettingsContent } from '@/features/theme/settings/ThemeSettingsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'theme' });

  return {
    title: t('settings.title'),
  };
}

export default async function ThemeSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; theme: string }>;
}) {
  const { theme: themeIdentifier } = await params;
  
  return <ThemeSettingsContent themeIdentifier={themeIdentifier} />;
}
