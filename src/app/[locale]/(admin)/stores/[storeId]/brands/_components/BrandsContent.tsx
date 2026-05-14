'use client';
// Reason: needs nuqs state sync and interactive filters

/**
 * Brands list page content (client component).
 * Manages filter and pagination state via URL (nuqs).
 */

import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { parseAsStringLiteral } from 'nuqs';
import { useBrands } from '@/hooks/brands/useBrands';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import { PlusCircle } from 'lucide-react';
import BrandsTable from './BrandsTable';
import BrandFilters from './BrandFilters';
import type { BrandFilters as BrandFiltersType } from '@/schemas/brands';

interface Props {
  storeId:        string;
  initialFilters: BrandFiltersType;
}

const STATUS_OPTIONS = ['all', 'true', 'false'] as const;

export default function BrandsContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('brands');

  const [isActive, setIsActive] = useQueryState(
    'is_active',
    parseAsStringLiteral(STATUS_OPTIONS).withDefault(
      initialFilters.is_active as (typeof STATUS_OPTIONS)[number],
    ),
  );

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(initialFilters.page),
  );

  const [perPage, setPerPage] = useQueryState(
    'perPage',
    parseAsInteger.withDefault(initialFilters.perPage),
  );

  const filters: BrandFiltersType = { is_active: isActive, page, perPage };

  const { data, isLoading, error } = useBrands(storeId, filters);

  if (error) {
    logger.error('Failed to load brands', { error });
  }

  const handleIsActiveChange = (value: 'all' | 'true' | 'false') => {
    setIsActive(value);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link
          href={ROUTES.store(storeId).brands.new()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground h-8 gap-1.5 px-2.5 text-sm font-medium transition-all hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          {t('new')}
        </Link>
      </div>

      {/* Filters */}
      <BrandFilters
        isActive={isActive}
        onIsActiveChange={handleIsActiveChange}
      />

      {/* Table */}
      <BrandsTable
        brands={data?.data ?? []}
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