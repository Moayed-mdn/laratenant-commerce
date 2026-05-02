/**
 * Users list page content (async RSC).
 * Fetches users data and renders the table with filters.
 */

import { serverFetch } from '@/lib/api/server/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { UserListItem } from '@/types/user';
import { mapUserListItem } from '@/lib/mappers/users';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';
import UsersTable from './UsersTable';
import UserFilters from './UserFilters';
import type { UserFilters as UserFiltersType } from '@/schemas/users';

interface Props {
  storeId: string;
  initialFilters: UserFiltersType;
}

export default async function UsersContent({ storeId, initialFilters }: Props) {
  const t = await getTranslations('users');

  try {
    // Build query params for server fetch
    const params: Record<string, string | number> = {};

    if (initialFilters.search && initialFilters.search !== '') {
      params.search = initialFilters.search;
    }
    if (initialFilters.role !== 'all') {
      params.role = initialFilters.role;
    }
    if (initialFilters.status !== 'all') {
      params.status = initialFilters.status;
    }
    if (initialFilters.page !== 1) {
      params.page = initialFilters.page;
    }
    if (initialFilters.perPage !== 10) {
      params.per_page = initialFilters.perPage;
    }

    const response = await serverFetch<ApiResponse<PaginatedResponse<UserListItem>>>(
      `${API_ROUTES.store(storeId).users.list()}${Object.keys(params).length ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''}`
    );

    const mappedData = response.data.data.map(mapUserListItem);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <UserFilters
          search={initialFilters.search}
          role={initialFilters.role}
          status={initialFilters.status}
        />

        <UsersTable
          users={mappedData}
          pagination={response.data.meta}
          currentPage={initialFilters.page}
          perPage={initialFilters.perPage}
          storeId={storeId}
        />
      </div>
    );
  } catch (error) {
    logger.error('Failed to load users', { error });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">{t('table.empty')}</p>
        </div>
      </div>
    );
  }
}
