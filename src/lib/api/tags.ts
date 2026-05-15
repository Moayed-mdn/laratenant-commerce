/**
 * Tags API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  TagRaw,
  TagListItemView,
  CreateTagPayload,
  UpdateTagPayload,
} from '@/types/tag';
import type { TagFilters } from '@/schemas/tags';

// ── Mapper ────────────────────────────────────────────────────────────────────

/**
 * Maps the raw Laravel AdminTagResource shape to the camelCase view type
 * consumed by UI components.
 *
 * Translation priority: 'en' → first available locale → empty string.
 */
function mapTagRaw(raw: TagRaw): TagListItemView {
  const locales   = Object.keys(raw.translations);
  const preferred = raw.translations['en'] ?? raw.translations[locales[0]];

  return {
    id:                raw.id,
    storeId:           raw.store_id,
    type:              raw.type,
    color:             raw.color,
    isActive:          raw.is_active,
    name:              preferred?.name ?? '',
    translationsCount: locales.length,
    createdAt:         raw.created_at,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveActive(
  value: 'all' | 'true' | 'false',
): 1 | 0 | undefined {
  if (value === 'true')  return 1;
  if (value === 'false') return 0;
  return undefined;
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of tags.
 * filters is optional so TagSelect (no filters needed) can call useTags(storeId).
 */
export async function getTags(
  storeId: string,
  filters?: TagFilters,
): Promise<PaginatedResponse<TagListItemView>> {
  const params: Record<string, string | number> = {};

  if (filters) {
    const active = resolveActive(filters.is_active);
    if (active !== undefined)     params.active   = active;
    if (filters.search)           params.search   = filters.search;
    if (filters.type)             params.type     = filters.type;
    if (filters.page !== 1)       params.page     = filters.page;
    if (filters.perPage !== 15)   params.per_page = filters.perPage;
  }

  const raw = await clientApi.get<PaginatedResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().list(),
    { params },
  );

  return {
    ...raw,
    data: raw.data.map(mapTagRaw),
  };
}

export async function getTagDetail(
  storeId: string,
  tagId:   string,
): Promise<TagRaw> {
  const response = await clientApi.get<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().detail(tagId),
  );
  return response.data;
}

export async function createTag(
  storeId:  string,
  payload:  CreateTagPayload,
): Promise<TagRaw> {
  const response = await clientApi.post<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().create(),
    payload,
  );
  return response.data;
}

export async function updateTag(
  storeId:  string,
  tagId:    string,
  payload:  UpdateTagPayload,
): Promise<TagRaw> {
  const response = await clientApi.patch<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().update(tagId),
    payload,
  );
  return response.data;
}

export async function deleteTag(
  storeId: string,
  tagId:   string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).tags().delete(tagId),
  );
}