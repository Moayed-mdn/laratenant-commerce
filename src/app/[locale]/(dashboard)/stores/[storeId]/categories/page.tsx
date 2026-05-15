/**
 * Categories list page.
 * Server component — thin wrapper with Suspense boundary.
 */

import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { CategoryFiltersSchema } from '@/schemas/categories';
import type { CategoryFilters } from '@/schemas/categories';
import { logger } from '@/lib/logger';
import CategoriesContent from '@/features/dashboard/categories/CategoriesContent';
import { CategoriesSkeleton } from '@/features/dashboard/categories/CategoriesSkeleton';

const searchParamsCache = createSearchParamsCache({
  is_active: parseAsString.withDefault('all'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return {
    title:       'Categories',
    description: 'Manage your store categories',
  };
}

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: CategoryFilters;
  try {
    filters = CategoryFiltersSchema.parse(parsed);
  } catch {
    filters = CategoryFiltersSchema.parse({});
    logger.warn('Invalid category filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
