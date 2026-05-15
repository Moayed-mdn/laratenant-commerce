/**
 * Users list page.
 * Server component with Suspense boundary.
 */

import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { UserFiltersSchema } from '@/schemas/users';
import type { UserFilters } from '@/schemas/users';
import { logger } from '@/lib/logger';
import UsersContent from '@/features/dashboard/users/UsersContent';
import { UsersSkeleton } from '@/features/dashboard/users/UsersSkeleton';

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(''),
  role: parseAsString.withDefault('all'),
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
  return {
    title: 'Customers',
    description: 'Manage your store customers',
  };
}

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams = await searchParams;

  // Parse with nuqs cache
  const parsed = searchParamsCache.parse(rawParams);

  // Validate with Zod
  let filters: UserFilters;
  try {
    filters = UserFiltersSchema.parse(parsed);
  } catch {
    // Invalid params — fall back to defaults
    filters = UserFiltersSchema.parse({});
    logger.warn('Invalid user filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
