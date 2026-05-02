'use client';
// Reason: needs nuqs state sync and debounced search

/**
 * Users list page content (client component).
 * Manages filters, debounce, and pagination state via URL.
 */

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useUsers } from '@/hooks/users/useUsers';
import type { UserFilters as UserFiltersType } from '@/schemas/users';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import UsersTable from './UsersTable';
import UserFilters from './UserFilters';

interface Props {
  storeId: string;
  initialFilters: UserFiltersType;
}

export default function UsersContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('users');

  // Nuqs state management
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(initialFilters.search));
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(initialFilters.role));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(initialFilters.status));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialFilters.page));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(initialFilters.perPage));

  // Debounce search
  const debouncedSearch = useDebounce(search, 300);

  // Build filters object with debounced search
  const filters: UserFiltersType = {
    search: debouncedSearch,
    role: role as 'all' | 'store_admin' | 'staff' | 'super_admin',
    status: status as 'all' | 'verified' | 'unverified',
    page,
    perPage,
  };

  // Fetch data
  const { data, isLoading, error } = useUsers(storeId, filters);

  // Error handling
  if (error) {
    logger.error('Failed to load users', { error });
  }

  // Handler functions that reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  const handleRoleChange = (value: string | null) => {
    if (value) {
      setRole(value);
      if (page !== 1) setPage(1);
    }
  };

  const handleStatusChange = (value: string | null) => {
    if (value) {
      setStatus(value);
      if (page !== 1) setPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        role={role}
        onRoleChange={handleRoleChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <UsersTable
        users={data?.data ?? []}
        pagination={data?.meta}
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
