/**
 * New product page.
 * Server component with empty form.
 */

import { getTranslations } from 'next-intl/server';
import CreateProductForm from '@/features/dashboard/products/CreateProductForm';

export async function generateMetadata() {
  const t = await getTranslations('products');

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
