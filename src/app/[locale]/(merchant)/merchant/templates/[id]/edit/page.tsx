import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageTemplateEditContent } from '@/features/page-templates/PageTemplateEditContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'theme' });

  return {
    title: t('templates.customizer.pageTitle'),
  };
}

export default function PageTemplateEditPage() {
  return <PageTemplateEditContent />;
}
