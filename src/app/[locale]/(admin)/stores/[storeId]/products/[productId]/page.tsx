/**
 * Edit product page.
 * Server component with Suspense boundary.
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { logger } from '@/lib/logger';
import EditProductContent from './_components/EditProductContent';
import { EditProductSkeleton } from './_components/EditProductSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string; productId: string; locale: string }>;
}) {
  const { locale, productId } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: `${t('form.editTitle')} #${productId}`,
    description: t('subtitle'),
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string; locale: string }>;
}) {
  const { storeId, productId } = await params;

  return (
    <Suspense fallback={<EditProductSkeleton />}>
      <EditProductContent storeId={storeId} productId={productId} />
    </Suspense>
  );
}
