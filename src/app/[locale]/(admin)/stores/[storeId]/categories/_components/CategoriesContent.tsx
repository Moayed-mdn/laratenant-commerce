'use client';
// Reason: needs nuqs state sync and interactive filters

/**
 * Categories list page content (client component).
 * Manages filter and pagination state via URL (nuqs).
 */

import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { parseAsStringLiteral } from 'nuqs';
import { useCategories } from '@/hooks/categories/useCategories';
import { useTranslations } from 'next-intl';
import { PlusCircle } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import CategoriesTable from './CategoriesTable';
import CategoryFilters from './CategoryFilters';
import type { CategoryFilters as CategoryFiltersType } from '@/schemas/categories';

interface Props {
  storeId:        string;
  initialFilters: CategoryFiltersType;
}

const STATUS_OPTIONS = ['all', 'true', 'false'] as const;

export default function CategoriesContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('categories');

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

  const filters: CategoryFiltersType = { is_active: isActive, page, perPage };

  const { data, isLoading, error } = useCategories(storeId, filters);

  if (error) {
    logger.error('Failed to load categories', { error });
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
          href={ROUTES.store(storeId).categories.new()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <PlusCircle className="h-4 w-4" />
          {t('new')}
        </Link>
      </div>

      {/* Filters */}
      <CategoryFilters
        isActive={isActive}
        onIsActiveChange={handleIsActiveChange}
      />

      {/* Table */}
      <CategoriesTable
        categories={data?.data ?? []}
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