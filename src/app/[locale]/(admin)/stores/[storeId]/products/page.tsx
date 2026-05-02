/**
 * Products list page.
 * Server component with Suspense boundary.
 */

import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { ProductFiltersSchema } from '@/schemas/products';
import type { ProductFilters } from '@/schemas/products';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';
import ProductsContent from './_components/ProductsContent';
import { ProductsSkeleton } from './_components/ProductsSkeleton';

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams = await searchParams;

  const parsed = searchParamsCache.parse(rawParams);

  let filters: ProductFilters;
  try {
    filters = ProductFiltersSchema.parse(parsed);
  } catch {
    filters = ProductFiltersSchema.parse({});
    logger.warn('Invalid product filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
