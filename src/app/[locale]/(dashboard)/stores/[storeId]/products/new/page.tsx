/**
 * New product page.
 * Server component with empty form.
 */

import { getTranslations } from 'next-intl/server';
import CreateProductForm from '@/features/dashboard/products/CreateProductForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('form.createTitle'),
    description: t('subtitle'),
  };
}

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="space-y-6">
      <CreateProductForm storeId={storeId} />
    </div>
  );
}
