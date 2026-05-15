import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { TagFiltersSchema } from '@/schemas/tags';
import type { TagFilters } from '@/schemas/tags';
import { logger } from '@/lib/logger';
import TagsContent from '@/features/dashboard/tags/TagsContent';
import { TagsSkeleton } from '@/features/dashboard/tags/TagsSkeleton';

const searchParamsCache = createSearchParamsCache({
  search:    parseAsString.withDefault(''),
  is_active: parseAsString.withDefault('all'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return { title: 'Tags', description: 'Manage your store tags' };
}

export default async function TagsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: TagFilters;
  try {
    filters = TagFiltersSchema.parse(parsed);
  } catch {
    filters = TagFiltersSchema.parse({});
    logger.warn('Invalid tag filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<TagsSkeleton />}>
      <TagsContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
