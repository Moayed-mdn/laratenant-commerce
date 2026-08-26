import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageTemplatesContent } from '@/features/page-templates/PageTemplatesContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'theme' });

  return {
    title: t('templates.title'),
  };
}

export default function PageTemplatesPage() {
  return <PageTemplatesContent />;
}
