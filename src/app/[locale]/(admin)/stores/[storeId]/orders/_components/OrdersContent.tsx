'use client';
// Reason: needs nuqs state sync and debounced search

/**
 * Orders list page content (client component).
 * Manages filters, debounce, and pagination state via URL.
 */

import { useQueryState } from 'nuqs';
import { parseAsString, parseAsInteger } from 'nuqs/parsers';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useOrders } from '@/hooks/orders/useOrders';
import type { OrderFilters as OrderFiltersType } from '@/schemas/orders';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import OrderFiltersComponent from './OrderFilters';
import OrdersTable from './OrdersTable';
import { OrdersSkeleton } from './OrdersSkeleton';

interface Props {
  storeId: string;
  initialFilters: OrderFiltersType;
}

export default function OrdersContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('orders');

  // URL state with nuqs - payment_status uses underscore to match API
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(initialFilters.search)
  );
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault(initialFilters.status)
  );
  const [paymentStatus, setPaymentStatus] = useQueryState(
    'payment_status',
    parseAsString.withDefault(initialFilters.payment_status)
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialFilters.page));
  const [perPage, setPerPage] = useQueryState(
    'perPage',
    parseAsInteger.withDefault(initialFilters.perPage)
  );

  // Debounce search only (status and payment_status are not debounced)
  const debouncedSearch = useDebounce(search, 300);

  // Build filters object with debounced search
  const filters: OrderFiltersType = {
    search: debouncedSearch,
    status: status as 'all' | 'pending' | 'confirmed' | 'cancelled' | 'refunded',
    payment_status: paymentStatus as 'all' | 'pending' | 'paid' | 'failed' | 'refunded',
    page: page ?? 1,
    perPage: perPage ?? 10,
  };

  // Fetch orders
  const { data, isLoading, error } = useOrders(storeId, filters);

  // Handler functions - reset page on filter change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatus(value);
    setPage(1);
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

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-destructive">{t('table.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderFiltersComponent
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
      />

      {isLoading ? (
        <OrdersSkeleton />
      ) : (
        <OrdersTable
          orders={data?.data ?? []}
          pagination={data?.meta}
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
