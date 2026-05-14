'use client';
// Reason: needs nuqs state sync and debounced search

/**
 * Products list page content (client component).
 * Manages filters, debounce, and pagination state via URL.
 */

import { Link } from '@/lib/navigation';
import { useQueryState, parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useProducts } from '@/hooks/products/useProducts';
import type { ProductFilters as ProductFiltersType } from '@/schemas/products';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductsTable from './ProductsTable';
import ProductFiltersComponent from './ProductFilters';

interface Props {
  storeId: string;
  initialFilters: ProductFiltersType;
}

const statusOptions = ['all', 'active', 'draft'] as const;

export default function ProductsContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('products');

  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(initialFilters.search)
  );
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(statusOptions).withDefault(
      initialFilters.status as (typeof statusOptions)[number]
    )
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialFilters.page));
  const [perPage, setPerPage] = useQueryState(
    'perPage',
    parseAsInteger.withDefault(initialFilters.perPage)
  );

  const debouncedSearch = useDebounce(search, 300);

  const filters: ProductFiltersType = {
    search: debouncedSearch,
    status,
    page,
    perPage,
  };

  const { data, isLoading, error } = useProducts(storeId, filters);

  if (error) {
    logger.error('Failed to load products', { error });
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    if (value) {
      setStatus(value as (typeof statusOptions)[number]);
      if (page !== 1) setPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href={ROUTES.store(storeId).products.new()}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('new')}
          </Button>
        </Link>
      </div>

      <ProductFiltersComponent
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
      />
      
      <ProductsTable
        products={data?.data ?? []}
        pagination={data?.meta.pagination}
        page={page}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={setPerPage}
        isLoading={isLoading}
        storeId={storeId}
      />
    </div>
  );
}
