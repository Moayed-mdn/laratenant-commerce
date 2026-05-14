#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Tags CRUD Implementation
# Run from project root: bash add_tags_crud.sh
# ─────────────────────────────────────────────────────────────────────────────

BASE="src"
NEXT="${BASE}/app/[locale]/(admin)/stores/[storeId]"

echo "→ Creating directories..."
mkdir -p \
  "${BASE}/hooks/tags" \
  "${NEXT}/tags/_components" \
  "${NEXT}/tags/new/_components" \
  "${NEXT}/tags/[tagId]/edit/_components"

# ─── 1. src/types/tag.ts ──────────────────────────────────────────────────────
echo "→ src/types/tag.ts"
cat > "${BASE}/types/tag.ts" << 'EOF'
/**
 * Tag types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminTagResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────────

export interface TagTranslationRaw {
  locale: string;
  name:   string;
  slug:   string | null;
}

/** Raw API shape — translations keyed by locale (e.g. { "en": {...}, "ar": {...} }) */
export interface TagRaw {
  id:           number;
  store_id:     number;
  type:         string | null;
  color:        string | null;
  is_active:    boolean;
  translations: Record<string, TagTranslationRaw>;
  created_at:   string;
  updated_at:   string;
}

// ── View types ────────────────────────────────────────────────────────────────

export interface TagListItemView {
  id:                number;
  storeId:           number;
  type:              string | null;
  color:             string | null;
  isActive:          boolean;
  name:              string;
  translationsCount: number;
  createdAt:         string;
}

export interface TagDetailView {
  id:           number;
  storeId:      number;
  type:         string | null;
  color:        string | null;
  isActive:     boolean;
  name:         string;
  translations: TagTranslationRaw[];
  createdAt:    string;
  updatedAt:    string;
}

// ── Form / Payload types ──────────────────────────────────────────────────────

export interface TagTranslationFormEntry {
  locale: 'en' | 'ar';
  name:   string;
  slug:   string | null;
}

export interface CreateTagPayload {
  type?:        string | null;
  color?:       string | null;
  is_active?:   boolean;
  translations: TagTranslationFormEntry[];
}

export interface UpdateTagPayload {
  type?:         string | null;
  color?:        string | null;
  is_active?:    boolean;
  translations?: TagTranslationFormEntry[];
}
EOF

# ─── 2. src/schemas/tags.ts ───────────────────────────────────────────────────
echo "→ src/schemas/tags.ts"
cat > "${BASE}/schemas/tags.ts" << 'EOF'
/**
 * Zod schemas for tag filters and forms.
 */

import { z } from 'zod';

// ── Filter schema ─────────────────────────────────────────────────────────────

export const TagFiltersSchema = z.object({
  search:    z.string().default(''),
  type:      z.string().default(''),
  is_active: z.enum(['all', 'true', 'false']).default('all'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type TagFilters = z.infer<typeof TagFiltersSchema>;

// ── Translation entry schema ──────────────────────────────────────────────────

export const TagTranslationSchema = z.object({
  locale: z.enum(['en', 'ar']),
  name:   z.string().min(1, 'Name is required').max(100),
  slug:   z.string().max(100).nullable().optional(),
});

// ── Form schema ───────────────────────────────────────────────────────────────

export const TagFormSchema = z.object({
  type:         z.string().max(50).nullable().optional(),
  color:        z.string().max(50).nullable().optional(),
  is_active:    z.boolean().default(true),
  translations: z
    .array(TagTranslationSchema)
    .min(1, 'At least one translation is required'),
});

export type TagFormValues = z.output<typeof TagFormSchema>;
export type TagFormInput  = z.input<typeof TagFormSchema>;
EOF

# ─── 3. src/lib/mappers/tags.ts ───────────────────────────────────────────────
echo "→ src/lib/mappers/tags.ts"
cat > "${BASE}/lib/mappers/tags.ts" << 'EOF'
/**
 * Tag data mappers.
 * Transforms raw API types to view types for UI consumption.
 * Note: API returns translations as Record<locale, entry>; we convert to array.
 */

import type { TagRaw, TagListItemView, TagDetailView, TagTranslationRaw } from '@/types/tag';
import { formatDate } from '@/lib/utils/date';

function resolveName(
  translations: Record<string, TagTranslationRaw>,
): string {
  return (
    translations['en']?.name ??
    translations['ar']?.name ??
    Object.values(translations)[0]?.name ??
    '—'
  );
}

function translationsToArray(
  translations: Record<string, TagTranslationRaw>,
): TagTranslationRaw[] {
  return Object.values(translations);
}

export function mapTagListItem(raw: TagRaw): TagListItemView {
  return {
    id:                raw.id,
    storeId:           raw.store_id,
    type:              raw.type,
    color:             raw.color,
    isActive:          raw.is_active,
    name:              resolveName(raw.translations),
    translationsCount: Object.keys(raw.translations).length,
    createdAt:         formatDate(raw.created_at),
  };
}

export function mapTagDetail(raw: TagRaw): TagDetailView {
  return {
    id:           raw.id,
    storeId:      raw.store_id,
    type:         raw.type,
    color:        raw.color,
    isActive:     raw.is_active,
    name:         resolveName(raw.translations),
    translations: translationsToArray(raw.translations),
    createdAt:    formatDate(raw.created_at),
    updatedAt:    formatDate(raw.updated_at),
  };
}
EOF

# ─── 4. src/lib/api/tags.ts ───────────────────────────────────────────────────
echo "→ src/lib/api/tags.ts"
cat > "${BASE}/lib/api/tags.ts" << 'EOF'
/**
 * Tags API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { TagRaw, CreateTagPayload, UpdateTagPayload } from '@/types/tag';
import type { TagFilters } from '@/schemas/tags';

function resolveActive(
  value: 'all' | 'true' | 'false',
): 1 | 0 | undefined {
  if (value === 'true')  return 1;
  if (value === 'false') return 0;
  return undefined;
}

export async function getTags(
  storeId: string,
  filters: TagFilters,
): Promise<PaginatedResponse<TagRaw>> {
  const params: Record<string, string | number> = {};

  const active = resolveActive(filters.is_active);
  if (active !== undefined)       params.active   = active;
  if (filters.search)             params.search   = filters.search;
  if (filters.type)               params.type     = filters.type;
  if (filters.page !== 1)         params.page     = filters.page;
  if (filters.perPage !== 15)     params.per_page = filters.perPage;

  return clientApi.get<PaginatedResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().list(),
    { params },
  );
}

export async function getTagDetail(
  storeId: string,
  tagId: string,
): Promise<TagRaw> {
  const response = await clientApi.get<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().detail(tagId),
  );
  return response.data;
}

export async function createTag(
  storeId: string,
  payload: CreateTagPayload,
): Promise<TagRaw> {
  const response = await clientApi.post<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().create(),
    payload,
  );
  return response.data;
}

export async function updateTag(
  storeId: string,
  tagId: string,
  payload: UpdateTagPayload,
): Promise<TagRaw> {
  const response = await clientApi.patch<ApiResponse<TagRaw>>(
    API_ROUTES.store(storeId).tags().update(tagId),
    payload,
  );
  return response.data;
}

export async function deleteTag(
  storeId: string,
  tagId: string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).tags().delete(tagId),
  );
}
EOF

# ─── 5. Hooks ─────────────────────────────────────────────────────────────────
echo "→ src/hooks/tags/useTags.ts"
cat > "${BASE}/hooks/tags/useTags.ts" << 'EOF'
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTags } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapTagListItem } from '@/lib/mappers/tags';
import { selectPaginatedList } from '@/lib/mappers/pagination';
import type { TagRaw, TagListItemView } from '@/types/tag';
import type { PaginatedResponse, ApiError } from '@/types/api';
import type { TagFilters } from '@/schemas/tags';

const DEFAULT_FILTERS: TagFilters = {
  search:    '',
  type:      '',
  is_active: 'all',
  page:      1,
  perPage:   15,
};

export function useTags(
  storeId: string,
  filters: TagFilters = DEFAULT_FILTERS,
) {
  return useQuery<
    PaginatedResponse<TagRaw>,
    ApiError,
    PaginatedResponse<TagListItemView>
  >({
    queryKey:  queryKeys.tags(storeId).list(filters as unknown as Record<string, unknown>),
    queryFn:   () => getTags(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapTagListItem),
  });
}
EOF

echo "→ src/hooks/tags/useTagDetail.ts"
cat > "${BASE}/hooks/tags/useTagDetail.ts" << 'EOF'
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTagDetail } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapTagDetail } from '@/lib/mappers/tags';
import type { TagRaw, TagDetailView } from '@/types/tag';
import type { ApiError } from '@/types/api';

export function useTagDetail(storeId: string, tagId: string) {
  return useQuery<TagRaw, ApiError, TagDetailView>({
    queryKey:  queryKeys.tags(storeId).detail(tagId),
    queryFn:   () => getTagDetail(storeId, tagId),
    staleTime: QUERY_CONFIG.staleTime,
    select:    mapTagDetail,
    enabled:   Boolean(storeId) && Boolean(tagId),
  });
}
EOF

echo "→ src/hooks/tags/useCreateTag.ts"
cat > "${BASE}/hooks/tags/useCreateTag.ts" << 'EOF'
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import type { CreateTagPayload } from '@/types/tag';
import type { ApiError } from '@/types/api';

export function useCreateTag(storeId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('tags');

  return useMutation<unknown, ApiError, CreateTagPayload>({
    mutationFn: (payload) => createTag(storeId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).lists() });
      toast.success(t('form.createSuccess'));
      router.push(ROUTES.store(storeId).tags.list());
    },

    onError: (error) => {
      logger.error('Failed to create tag', { error });
      toast.error(error.message ?? t('form.createError'));
    },
  });
}
EOF

echo "→ src/hooks/tags/useUpdateTag.ts"
cat > "${BASE}/hooks/tags/useUpdateTag.ts" << 'EOF'
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { UpdateTagPayload } from '@/types/tag';
import type { ApiError } from '@/types/api';

export function useUpdateTag(storeId: string, tagId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('tags');

  return useMutation<unknown, ApiError, UpdateTagPayload>({
    mutationFn: (payload) => updateTag(storeId, tagId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).detail(tagId) });
      toast.success(t('form.updateSuccess'));
    },

    onError: (error) => {
      logger.error('Failed to update tag', { error });
      toast.error(error.message ?? t('form.updateError'));
    },
  });
}
EOF

echo "→ src/hooks/tags/useDeleteTag.ts"
cat > "${BASE}/hooks/tags/useDeleteTag.ts" << 'EOF'
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { deleteTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export function useDeleteTag(storeId: string, tagId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('tags');

  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteTag(storeId, tagId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).lists() });
      queryClient.removeQueries({ queryKey: queryKeys.tags(storeId).detail(tagId) });
      toast.success(t('form.deleteSuccess'));
      router.push(ROUTES.store(storeId).tags.list());
    },

    onError: (error) => {
      logger.error('Failed to delete tag', { error });
      toast.error(error.message ?? t('form.deleteError'));
    },
  });
}
EOF

# ─── 6. List page ─────────────────────────────────────────────────────────────
echo "→ Tags list page + components"

cat > "${NEXT}/tags/_components/TagStatusBadge.tsx" << 'EOF'
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Props { isActive: boolean }

export function TagStatusBadge({ isActive }: Props) {
  const t = useTranslations('tags');
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('status.active') : t('status.inactive')}
    </Badge>
  );
}
EOF

cat > "${NEXT}/tags/_components/TagFilters.tsx" << 'EOF'
'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  search:            string;
  onSearchChange:    (v: string) => void;
  isActive:          'all' | 'true' | 'false';
  onIsActiveChange:  (v: 'all' | 'true' | 'false') => void;
}

export default function TagFilters({
  search, onSearchChange, isActive, onIsActiveChange,
}: Props) {
  const t = useTranslations('tags');

  const statusLabel: Record<'all' | 'true' | 'false', string> = {
    all:   t('filters.allStatuses'),
    true:  t('status.active'),
    false: t('status.inactive'),
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        className="w-[220px]"
        placeholder={t('filters.typePlaceholder')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        value={isActive}
        onValueChange={(v) => onIsActiveChange(v as 'all' | 'true' | 'false')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>{statusLabel[isActive]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="true">{t('status.active')}</SelectItem>
          <SelectItem value="false">{t('status.inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

cat > "${NEXT}/tags/_components/TagsSkeleton.tsx" << 'EOF'
import { Skeleton } from '@/components/ui/skeleton';

export function TagsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="rounded-lg border bg-card">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
EOF

cat > "${NEXT}/tags/_components/TagsTable.tsx" << 'EOF'
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import type { TagListItemView } from '@/types/tag';
import type { PaginationMeta } from '@/types/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TagStatusBadge } from './TagStatusBadge';

interface Props {
  tags:            TagListItemView[];
  pagination:      PaginationMeta | undefined;
  page:            number;
  onPageChange:    (page: number) => void;
  perPage:         number;
  onPerPageChange: (perPage: number) => void;
  isLoading:       boolean;
  storeId:         string;
}

export default function TagsTable({
  tags, pagination, page, onPageChange,
  perPage, onPerPageChange, isLoading, storeId,
}: Props) {
  const t = useTranslations('tags');

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  const perPageOptions = ['10', '15', '25', '50'] as const;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.type')}</TableHead>
              <TableHead>{t('table.color')}</TableHead>
              <TableHead>{t('table.translations')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.type ?? '—'}
                </TableCell>
                <TableCell>
                  {tag.color ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-mono text-muted-foreground">
                        {tag.color}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.translationsCount}
                </TableCell>
                <TableCell>
                  <TagStatusBadge isActive={tag.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={ROUTES.store(storeId).tags.edit(String(tag.id))}
                    className="inline-flex shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-clip-padding h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
                  >
                    {t('table.edit')}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.from ?? 0} – {pagination.to ?? 0} {t('table.of')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(perPage)}
              onValueChange={(v) => onPerPageChange(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>{perPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                {t('table.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {t('table.page', { current: page, total: pagination.total_pages })}
              </span>
              <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pagination.total_pages}>
                {t('table.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
EOF

cat > "${NEXT}/tags/_components/TagsContent.tsx" << 'EOF'
'use client';

import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useTags } from '@/hooks/tags/useTags';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import { PlusCircle } from 'lucide-react';
import TagsTable from './TagsTable';
import TagFilters from './TagFilters';
import type { TagFilters as TagFiltersType } from '@/schemas/tags';

interface Props {
  storeId:        string;
  initialFilters: TagFiltersType;
}

const STATUS_OPTIONS = ['all', 'true', 'false'] as const;

export default function TagsContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('tags');

  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(initialFilters.search),
  );
  const [isActive, setIsActive] = useQueryState(
    'is_active',
    parseAsStringLiteral(STATUS_OPTIONS).withDefault(
      initialFilters.is_active as (typeof STATUS_OPTIONS)[number],
    ),
  );
  const [page, setPage]       = useQueryState('page',    parseAsInteger.withDefault(initialFilters.page));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(initialFilters.perPage));

  const filters: TagFiltersType = {
    search,
    type:      '',
    is_active: isActive,
    page,
    perPage,
  };

  const { data, isLoading, error } = useTags(storeId, filters);

  if (error) logger.error('Failed to load tags', { error });

  const handleIsActiveChange = (value: 'all' | 'true' | 'false') => {
    setIsActive(value);
    if (page !== 1) setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link
          href={ROUTES.store(storeId).tags.new()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground h-8 gap-1.5 px-2.5 text-sm font-medium transition-all hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          {t('new')}
        </Link>
      </div>

      <TagFilters
        search={search}
        onSearchChange={handleSearchChange}
        isActive={isActive}
        onIsActiveChange={handleIsActiveChange}
      />

      <TagsTable
        tags={data?.data ?? []}
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
EOF

cat > "${NEXT}/tags/page.tsx" << 'EOF'
import { Suspense } from 'react';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { TagFiltersSchema } from '@/schemas/tags';
import type { TagFilters } from '@/schemas/tags';
import { logger } from '@/lib/logger';
import TagsContent from './_components/TagsContent';
import { TagsSkeleton } from './_components/TagsSkeleton';

const searchParamsCache = createSearchParamsCache({
  search:    parseAsString.withDefault(''),
  is_active: parseAsString.withDefault('all'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return { title: 'Tags', description: 'Manage your store tags' };
}

export default async function TagsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: TagFilters;
  try {
    filters = TagFiltersSchema.parse(parsed);
  } catch {
    filters = TagFiltersSchema.parse({});
    logger.warn('Invalid tag filters, using defaults', { parsed });
  }

  return (
    <Suspense fallback={<TagsSkeleton />}>
      <TagsContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
EOF

# ─── 7. Create page ───────────────────────────────────────────────────────────
echo "→ Tags create page"

cat > "${NEXT}/tags/new/_components/CreateTagForm.tsx" << 'EOF'
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateTag } from '@/hooks/tags/useCreateTag';
import { TagFormSchema, type TagFormValues, type TagFormInput } from '@/schemas/tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props { storeId: string }

const LOCALES = ['en', 'ar'] as const;

export default function CreateTagForm({ storeId }: Props) {
  const t      = useTranslations('tags');
  const create = useCreateTag(storeId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TagFormInput, unknown, TagFormValues>({
    resolver:      zodResolver(TagFormSchema),
    defaultValues: {
      type:         '',
      color:        '',
      is_active:    true,
      translations: LOCALES.map((locale) => ({ locale, name: '', slug: '' })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'translations' });
  const isActive   = watch('is_active');

  const onSubmit = async (values: TagFormValues) => {
    await create.mutateAsync({
      type:      values.type || null,
      color:     values.color || null,
      is_active: values.is_active,
      translations: values.translations
        .filter((tr) => tr.name.trim())
        .map((tr) => ({ ...tr, slug: tr.slug || null })),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
          <p className="text-muted-foreground">{t('form.createSubtitle')}</p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.creating') : t('form.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Translations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('form.translations')}</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  {fields.map((field) => (
                    <TabsTrigger key={field.id} value={field.locale}>
                      {field.locale.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((field, index) => (
                  <TabsContent key={field.id} value={field.locale} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>{t('form.fields.name')}</Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>{t('form.fields.slug')}</Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              {errors.translations && !Array.isArray(errors.translations) && (
                <p className="text-sm text-destructive mt-2">
                  {errors.translations.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <Card>
            <CardHeader><CardTitle>{t('form.settings')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('form.fields.type')}</Label>
                <Input
                  id="type"
                  {...register('type')}
                  placeholder={t('form.fields.typePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t('form.fields.color')}</Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder={t('form.fields.colorPlaceholder')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive ?? true}
                  onCheckedChange={(v) => setValue('is_active', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
EOF

cat > "${NEXT}/tags/new/page.tsx" << 'EOF'
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import CreateTagForm from './_components/CreateTagForm';

export async function generateMetadata() {
  return { title: 'New Tag', description: 'Create a new tag' };
}

export default async function NewTagPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).tags.list()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          &larr; Back to tags
        </Link>
      </div>
      <CreateTagForm storeId={storeId} />
    </div>
  );
}
EOF

# ─── 8. Edit page ─────────────────────────────────────────────────────────────
echo "→ Tags edit page"

cat > "${NEXT}/tags/[tagId]/edit/_components/EditTagSkeleton.tsx" << 'EOF'
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function EditTagSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

cat > "${NEXT}/tags/[tagId]/edit/_components/DeleteTagButton.tsx" << 'EOF'
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeleteTag } from '@/hooks/tags/useDeleteTag';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Props { storeId: string; tagId: string }

export function DeleteTagButton({ storeId, tagId }: Props) {
  const t             = useTranslations('tags');
  const [open, setOpen] = useState(false);
  const deleteMutation  = useDeleteTag(storeId, tagId);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t('form.delete')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('form.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('form.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('form.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => { deleteMutation.mutate(); setOpen(false); }}
            >
              {deleteMutation.isPending ? t('form.deleting') : t('form.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
EOF

cat > "${NEXT}/tags/[tagId]/edit/_components/EditTagForm.tsx" << 'EOF'
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUpdateTag } from '@/hooks/tags/useUpdateTag';
import { TagFormSchema, type TagFormValues, type TagFormInput } from '@/schemas/tags';
import type { TagDetailView } from '@/types/tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  storeId: string;
  tagId:   string;
  tag:     TagDetailView;
}

const LOCALES = ['en', 'ar'] as const;

export default function EditTagForm({ storeId, tagId, tag }: Props) {
  const t      = useTranslations('tags');
  const update = useUpdateTag(storeId, tagId);

  const defaultTranslations = LOCALES.map((locale) => {
    const existing = tag.translations.find((tr) => tr.locale === locale);
    return { locale, name: existing?.name ?? '', slug: existing?.slug ?? '' };
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TagFormInput, unknown, TagFormValues>({
    resolver:      zodResolver(TagFormSchema),
    defaultValues: {
      type:         tag.type ?? '',
      color:        tag.color ?? '',
      is_active:    tag.isActive,
      translations: defaultTranslations,
    },
  });

  const { fields } = useFieldArray({ control, name: 'translations' });
  const isActive   = watch('is_active');

  useEffect(() => {
    const translations = LOCALES.map((locale) => {
      const existing = tag.translations.find((tr) => tr.locale === locale);
      return { locale, name: existing?.name ?? '', slug: existing?.slug ?? '' };
    });
    reset({
      type:         tag.type ?? '',
      color:        tag.color ?? '',
      is_active:    tag.isActive,
      translations,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag.id]);

  const onSubmit = async (values: TagFormValues) => {
    await update.mutateAsync({
      type:      values.type || null,
      color:     values.color || null,
      is_active: values.is_active,
      translations: values.translations
        .filter((tr) => tr.name.trim())
        .map((tr) => ({ ...tr, slug: tr.slug || null })),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('form.editTitle')}</h1>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t('form.saving') : t('form.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Translations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('form.translations')}</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  {fields.map((field) => (
                    <TabsTrigger key={field.id} value={field.locale}>
                      {field.locale.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((field, index) => (
                  <TabsContent key={field.id} value={field.locale} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>{t('form.fields.name')}</Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>{t('form.fields.slug')}</Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <Card>
            <CardHeader><CardTitle>{t('form.settings')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('form.fields.type')}</Label>
                <Input
                  id="type"
                  {...register('type')}
                  placeholder={t('form.fields.typePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t('form.fields.color')}</Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder={t('form.fields.colorPlaceholder')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive ?? true}
                  onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
EOF

cat > "${NEXT}/tags/[tagId]/edit/_components/EditTagContent.tsx" << 'EOF'
'use client';

import { useTranslations } from 'next-intl';
import { useTagDetail } from '@/hooks/tags/useTagDetail';
import { EditTagSkeleton } from './EditTagSkeleton';
import EditTagForm from './EditTagForm';
import { DeleteTagButton } from './DeleteTagButton';

interface Props { storeId: string; tagId: string }

export default function EditTagContent({ storeId, tagId }: Props) {
  const t = useTranslations('tags');
  const { data: tag, isLoading, error } = useTagDetail(storeId, tagId);

  if (isLoading) return <EditTagSkeleton />;

  if (error || !tag) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('detail.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EditTagForm storeId={storeId} tagId={tagId} tag={tag} />

      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">{t('form.dangerZone')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('form.deleteDescription')}</p>
        <DeleteTagButton storeId={storeId} tagId={tagId} />
      </div>
    </div>
  );
}
EOF

cat > "${NEXT}/tags/[tagId]/edit/page.tsx" << 'EOF'
import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import EditTagContent from './_components/EditTagContent';
import { EditTagSkeleton } from './_components/EditTagSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) {
  const { tagId } = await params;
  return { title: `Edit Tag ${tagId}`, description: 'Update tag details' };
}

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ storeId: string; tagId: string; locale: string }>;
}) {
  const { storeId, tagId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).tags.list()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          &larr; Back to tags
        </Link>
      </div>
      <Suspense fallback={<EditTagSkeleton />}>
        <EditTagContent storeId={storeId} tagId={tagId} />
      </Suspense>
    </div>
  );
}
EOF

# ─── 9. Update src/config/routes.ts ───────────────────────────────────────────
echo "→ Patching src/config/routes.ts (adding tags routes)..."
python3 - << 'PYEOF'
import re

path = "src/config/routes.ts"
with open(path, "r") as f:
    content = f.read()

# Add to ROUTES.store() — insert after brands block
brands_route_block = """    brands: {
      list: () => `/stores/${storeId}/brands` as const,
      new:  () => `/stores/${storeId}/brands/new` as const,
      edit: (brandId: string) =>
        `/stores/${storeId}/brands/${brandId}/edit` as const,
    },"""

tags_route_block = """    tags: {
      list: () => `/stores/${storeId}/tags` as const,
      new:  () => `/stores/${storeId}/tags/new` as const,
      edit: (tagId: string) =>
        `/stores/${storeId}/tags/${tagId}/edit` as const,
    },"""

if "tags:" not in content:
    content = content.replace(brands_route_block, brands_route_block + "\n\n" + tags_route_block)

# Add to API_ROUTES.store() — insert after brands() block
api_brands_end = """      restore: (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}/restore`,
    }),"""

api_tags_block = """
    tags: () => ({
      list:   () => `/api/v1/admin/stores/${storeId}/tags`,
      detail: (tagId: string) =>
        `/api/v1/admin/stores/${storeId}/tags/${tagId}`,
      create: () => `/api/v1/admin/stores/${storeId}/tags`,
      update: (tagId: string) =>
        `/api/v1/admin/stores/${storeId}/tags/${tagId}`,
      delete: (tagId: string) =>
        `/api/v1/admin/stores/${storeId}/tags/${tagId}`,
    }),"""

if "tags: () =>" not in content:
    content = content.replace(api_brands_end, api_brands_end + "\n" + api_tags_block)

with open(path, "w") as f:
    f.write(content)

print("  routes.ts patched OK")
PYEOF

# ─── 10. Update src/lib/queryKeys.ts ──────────────────────────────────────────
echo "→ Patching src/lib/queryKeys.ts (adding tags query keys)..."
python3 - << 'PYEOF'
path = "src/lib/queryKeys.ts"
with open(path, "r") as f:
    content = f.read()

brands_keys_block = """  // ── Brands ────────────────────────────────────────────────────────────────────
  brands: (storeId: string) => ({
    all:    () => ['brands', storeId] as const,
    lists:  () => ['brands', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['brands', storeId, 'list', filters] as const,
    detail: (brandId: string) =>
      ['brands', storeId, 'detail', brandId] as const,
  }),"""

tags_keys_block = """
  // ── Tags ──────────────────────────────────────────────────────────────────────
  tags: (storeId: string) => ({
    all:    () => ['tags', storeId] as const,
    lists:  () => ['tags', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['tags', storeId, 'list', filters] as const,
    detail: (tagId: string) =>
      ['tags', storeId, 'detail', tagId] as const,
  }),"""

if "// ── Tags" not in content:
    content = content.replace(brands_keys_block, brands_keys_block + "\n" + tags_keys_block)

with open(path, "w") as f:
    f.write(content)

print("  queryKeys.ts patched OK")
PYEOF

echo ""
echo "✅ Tags CRUD implementation complete."
echo ""
echo "Next steps:"
echo "  1. Run the vibe coder prompt to update:"
echo "     - src/locales/en/common.json  (add 'tags' namespace + nav.tags)"
echo "     - src/locales/ar/common.json  (add 'tags' namespace + nav.tags)"
echo "     - src/app/[locale]/(admin)/_components/sidebar/SidebarNav.tsx (add Tag nav item)"
echo "  2. Run: npm run build  (to verify no TypeScript errors)"