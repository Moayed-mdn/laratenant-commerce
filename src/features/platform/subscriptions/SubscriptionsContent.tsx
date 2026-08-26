'use client';

/**
 * Subscriptions list page content (client component).
 * Manages filters, debounce, and pagination state via URL.
 */

import { useQueryState, parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useSubscriptions } from '@/hooks/platform/useSubscriptions';
import type { SubscriptionFilters as SubscriptionFiltersType } from '@/types/billing/subscription';
import { useLocale, useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import SubscriptionsTable from './SubscriptionsTable';
import SubscriptionFilters from './SubscriptionFilters';
import { SubscriptionsSkeleton } from './SubscriptionsSkeleton';

interface Props {
  initialFilters: SubscriptionFiltersType;
}

const statusOptions = [
  'all',
  'incomplete',
  'trialing',
  'active',
  'past_due',
  'grace_period',
  'paused',
  'canceled',
  'expired',
] as const;

export default function SubscriptionsContent({ initialFilters }: Props) {
  const t = useTranslations('subscriptions');

  // URL state with nuqs
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(initialFilters.search));
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(statusOptions).withDefault(initialFilters.status as (typeof statusOptions)[number])
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialFilters.page));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(initialFilters.perPage));

  // Debounce search
  const debouncedSearch = useDebounce(search, 300);

  // Build filters object
  const filters: SubscriptionFiltersType = {
    search: debouncedSearch,
    status: status as SubscriptionFiltersType['status'],
    plan_id: initialFilters.plan_id,
    sort: initialFilters.sort,
    order: initialFilters.order,
    page: page ?? 1,
    perPage: perPage ?? 25,
  };

  // Fetch subscriptions
  const locale = useLocale();
  const { data, isLoading, error, isError } = useSubscriptions(filters, locale);

  // Handler functions
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    if (value) {
      setStatus(value as (typeof statusOptions)[number]);
      setPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    logger.info('Page changed', { page: newPage });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    logger.info('Per page changed', { perPage: newPerPage });
  };

  if (isError && !isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-destructive">{t('error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <SubscriptionFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {isLoading ? (
        <SubscriptionsSkeleton />
      ) : (
        <SubscriptionsTable
          subscriptions={data?.data ?? []}
          pagination={data?.meta.pagination}
          page={filters.page}
          onPageChange={handlePageChange}
          perPage={filters.perPage}
          onPerPageChange={handlePerPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
