/**
 * Brands list page.
 * Server component — thin wrapper with Suspense boundary.
 */

import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { BrandFiltersSchema } from '@/schemas/brands';
import type { BrandFilters } from '@/schemas/brands';
import { logger } from '@/lib/logger';
import BrandsContent from './_components/BrandsContent';
import { BrandsSkeleton } from './_components/BrandsSkeleton';

const searchParamsCache = createSearchParamsCache({
  is_active: parseAsString.withDefault('all'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return {
    title:       'Brands',
    description: 'Manage your store brands',
  };
}

export default async function BrandsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: BrandFilters;
  try {
    filters = BrandFiltersSchema.parse(parsed);
  } catch {
    filters = BrandFiltersSchema.parse({});
    logger.warn('Invalid brand filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<BrandsSkeleton />}>
      <BrandsContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
