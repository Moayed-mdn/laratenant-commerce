// src/lib/mappers/pagination.ts

import type { PaginatedResponse, PaginationMeta } from '@/types/api';

/**
 * Enriches raw API pagination with computed from/to fields.
 */
export function mapPagination(pag: PaginationMeta): PaginationMeta {
  return {
    ...pag,
    from: (pag.current_page - 1) * pag.per_page + 1,
    to: (pag.current_page - 1) * pag.per_page + pag.count,
  };
}

/**
 * Generic select transformer for all paginated list queries.
 * Maps raw API items and enriches pagination meta.
 *
 * @param mapper - item-level view mapper (e.g. mapUserListItem)
 */
export function selectPaginatedList<TRaw, TView>(
  mapper: (item: TRaw) => TView,
) {
  return (data: PaginatedResponse<TRaw>): PaginatedResponse<TView> => ({
    ...data,
    data: data.data?.map((item) => mapper(item)) ?? [],
    meta: {
      pagination: mapPagination(data.meta.pagination),
    },
  });
}
