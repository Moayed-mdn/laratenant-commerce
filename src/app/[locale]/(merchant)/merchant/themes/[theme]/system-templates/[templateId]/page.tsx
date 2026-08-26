import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SystemTemplateEditContent } from '@/features/system-templates/SystemTemplateEditContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'systemTemplates' });

  return {
    title: t('edit.pageTitle'),
  };
}

export default function SystemTemplateEditPage() {
  return <SystemTemplateEditContent />;
}
