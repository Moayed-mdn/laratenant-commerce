#!/usr/bin/env bash

# =============================================================================
# PART 2 — API Modules, Mappers, Hooks
# =============================================================================

set -e

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/src"

echo "🚀 Part 2: API Modules, Mappers, Hooks..."
echo "📁 Base path: $BASE"

# =============================================================================
# HELPER
# =============================================================================

write_file() {
    local path="$1"
    local content="$2"
    mkdir -p "$(dirname "$path")"
    printf '%s' "$content" > "$path"
    echo "  ✅ $path"
}

# =============================================================================
# 1. API MODULES
# =============================================================================

echo ""
echo "📦 [1/4] API Modules..."

write_file "$SRC/lib/api/categories.ts" \
'/**
 * Categories API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '"'"'@/lib/api/client'"'"';
import { API_ROUTES } from '"'"'@/config/routes'"'"';
import type { ApiResponse, PaginatedResponse } from '"'"'@/types/api'"'"';
import type {
  CategoryListItem,
  CategoryDetail,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '"'"'@/types/category'"'"';
import type { CategoryFilters } from '"'"'@/schemas/categories'"'"';

/**
 * Fetch paginated categories list.
 */
export async function getCategories(
  storeId: string,
  filters: CategoryFilters,
): Promise<PaginatedResponse<CategoryListItem>> {
  const params: Record<string, string | number> = {};

  if (filters.is_active !== '"'"'all'"'"') {
    params.is_active = filters.is_active;
  }
  if (filters.page !== 1)    params.page     = filters.page;
  if (filters.perPage !== 15) params.per_page = filters.perPage;

  return clientApi.get<PaginatedResponse<CategoryListItem>>(
    API_ROUTES.store(storeId).categories().list(),
    { params },
  );
}

/**
 * Fetch single category by ID.
 */
export async function getCategoryDetail(
  storeId: string,
  categoryId: string,
): Promise<CategoryDetail> {
  const response = await clientApi.get<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().detail(categoryId),
  );
  return response.data;
}

/**
 * Create a new category.
 */
export async function createCategory(
  storeId: string,
  payload: CreateCategoryPayload,
): Promise<CategoryDetail> {
  const response = await clientApi.post<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().create(),
    payload,
  );
  return response.data;
}

/**
 * Update an existing category.
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<CategoryDetail> {
  const response = await clientApi.patch<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().update(categoryId),
    payload,
  );
  return response.data;
}

/**
 * Soft-delete a category.
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).categories().delete(categoryId),
  );
}

/**
 * Restore a soft-deleted category.
 */
export async function restoreCategory(
  storeId: string,
  categoryId: string,
): Promise<CategoryDetail> {
  const response = await clientApi.patch<ApiResponse<CategoryDetail>>(
    API_ROUTES.store(storeId).categories().restore(categoryId),
  );
  return response.data;
}
'

write_file "$SRC/lib/api/brands.ts" \
'/**
 * Brands API functions (client-side).
 * All calls go through clientApi → /api/proxy → Laravel.
 */

import { clientApi } from '"'"'@/lib/api/client'"'"';
import { API_ROUTES } from '"'"'@/config/routes'"'"';
import type { ApiResponse, PaginatedResponse } from '"'"'@/types/api'"'"';
import type {
  BrandListItem,
  BrandDetail,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '"'"'@/types/brand'"'"';
import type { BrandFilters } from '"'"'@/schemas/brands'"'"';

/**
 * Fetch paginated brands list.
 */
export async function getBrands(
  storeId: string,
  filters: BrandFilters,
): Promise<PaginatedResponse<BrandListItem>> {
  const params: Record<string, string | number> = {};

  if (filters.is_active !== '"'"'all'"'"') {
    params.is_active = filters.is_active;
  }
  if (filters.page !== 1)    params.page     = filters.page;
  if (filters.perPage !== 15) params.per_page = filters.perPage;

  return clientApi.get<PaginatedResponse<BrandListItem>>(
    API_ROUTES.store(storeId).brands().list(),
    { params },
  );
}

/**
 * Fetch single brand by ID.
 */
export async function getBrandDetail(
  storeId: string,
  brandId: string,
): Promise<BrandDetail> {
  const response = await clientApi.get<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().detail(brandId),
  );
  return response.data;
}

/**
 * Create a new brand.
 */
export async function createBrand(
  storeId: string,
  payload: CreateBrandPayload,
): Promise<BrandDetail> {
  const response = await clientApi.post<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().create(),
    payload,
  );
  return response.data;
}

/**
 * Update an existing brand.
 */
export async function updateBrand(
  storeId: string,
  brandId: string,
  payload: UpdateBrandPayload,
): Promise<BrandDetail> {
  const response = await clientApi.patch<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().update(brandId),
    payload,
  );
  return response.data;
}

/**
 * Soft-delete a brand.
 */
export async function deleteBrand(
  storeId: string,
  brandId: string,
): Promise<void> {
  await clientApi.delete(
    API_ROUTES.store(storeId).brands().delete(brandId),
  );
}

/**
 * Restore a soft-deleted brand.
 */
export async function restoreBrand(
  storeId: string,
  brandId: string,
): Promise<BrandDetail> {
  const response = await clientApi.patch<ApiResponse<BrandDetail>>(
    API_ROUTES.store(storeId).brands().restore(brandId),
  );
  return response.data;
}
'

# =============================================================================
# 2. MAPPERS
# =============================================================================

echo ""
echo "📦 [2/4] Mappers..."

write_file "$SRC/lib/mappers/categories.ts" \
'/**
 * Category data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  CategoryListItem,
  CategoryListItemView,
  CategoryDetail,
  CategoryDetailView,
} from '"'"'@/types/category'"'"';
import { formatDate } from '"'"'@/lib/utils/date'"'"';

/**
 * Resolve display name from translation or fall back to slug.
 */
function resolveName(
  translation: { name: string } | null | undefined,
  slug: string,
): string {
  return translation?.name ?? slug;
}

/**
 * Map category list item from raw API shape to view shape.
 */
export function mapCategoryListItem(raw: CategoryListItem): CategoryListItemView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    slug:          raw.slug,
    parentId:      raw.parent_id,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    name:          resolveName(raw.translation, raw.slug),
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    deletedAt:     raw.deleted_at,
  };
}

/**
 * Map category detail from raw API shape to view shape.
 */
export function mapCategoryDetail(raw: CategoryDetail): CategoryDetailView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    slug:          raw.slug,
    parentId:      raw.parent_id,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    name:          resolveName(raw.translation, raw.slug),
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    updatedAt:     formatDate(raw.updated_at),
    deletedAt:     raw.deleted_at,
    translations:  raw.translations,
    parent:        raw.parent,
    children:      raw.children.map(mapCategoryListItem),
    breadcrumb:    raw.breadcrumb,
  };
}
'

write_file "$SRC/lib/mappers/brands.ts" \
'/**
 * Brand data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  BrandListItem,
  BrandListItemView,
  BrandDetail,
  BrandDetailView,
} from '"'"'@/types/brand'"'"';
import { formatDate } from '"'"'@/lib/utils/date'"'"';

/**
 * Map brand list item from raw API shape to view shape.
 */
export function mapBrandListItem(raw: BrandListItem): BrandListItemView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    name:          raw.name,
    slug:          raw.slug,
    description:   raw.description,
    logoUrl:       raw.logo_url,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    deletedAt:     raw.deleted_at,
  };
}

/**
 * Map brand detail from raw API shape to view shape.
 */
export function mapBrandDetail(raw: BrandDetail): BrandDetailView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    name:          raw.name,
    slug:          raw.slug,
    description:   raw.description,
    logoUrl:       raw.logo_url,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    updatedAt:     formatDate(raw.updated_at),
    deletedAt:     raw.deleted_at,
  };
}
'

# =============================================================================
# 3. HOOKS — Categories
# =============================================================================

echo ""
echo "📦 [3/4] Hooks — Categories..."

write_file "$SRC/hooks/categories/useCategories.ts" \
''"'"'use client'"'"';

/**
 * Hook for fetching paginated categories list.
 */

import { useQuery } from '"'"'@tanstack/react-query'"'"';
import { getCategories } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { QUERY_CONFIG } from '"'"'@/config/query'"'"';
import { mapCategoryListItem } from '"'"'@/lib/mappers/categories'"'"';
import { selectPaginatedList } from '"'"'@/lib/mappers/pagination'"'"';
import type { CategoryListItem, CategoryListItemView } from '"'"'@/types/category'"'"';
import type { PaginatedResponse, ApiError } from '"'"'@/types/api'"'"';
import type { CategoryFilters } from '"'"'@/schemas/categories'"'"';

export function useCategories(storeId: string, filters: CategoryFilters) {
  return useQuery<
    PaginatedResponse<CategoryListItem>,
    ApiError,
    PaginatedResponse<CategoryListItemView>
  >({
    queryKey: queryKeys.categories(storeId).list(
      filters as unknown as Record<string, unknown>,
    ),
    queryFn:   () => getCategories(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapCategoryListItem),
  });
}
'

write_file "$SRC/hooks/categories/useCategoryDetail.ts" \
''"'"'use client'"'"';

/**
 * Hook for fetching a single category by ID.
 */

import { useQuery } from '"'"'@tanstack/react-query'"'"';
import { getCategoryDetail } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { QUERY_CONFIG } from '"'"'@/config/query'"'"';
import { mapCategoryDetail } from '"'"'@/lib/mappers/categories'"'"';
import type { CategoryDetail, CategoryDetailView } from '"'"'@/types/category'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useCategoryDetail(storeId: string, categoryId: string) {
  return useQuery<CategoryDetail, ApiError, CategoryDetailView>({
    queryKey: queryKeys.categories(storeId).detail(categoryId),
    queryFn:  () => getCategoryDetail(storeId, categoryId),
    staleTime: QUERY_CONFIG.staleTime,
    select:    mapCategoryDetail,
    enabled:   Boolean(storeId) && Boolean(categoryId),
  });
}
'

write_file "$SRC/hooks/categories/useCreateCategory.ts" \
''"'"'use client'"'"';

/**
 * Hook for creating a new category.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { useRouter } from '"'"'@/lib/navigation'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { createCategory } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { CreateCategoryPayload } from '"'"'@/types/category'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useCreateCategory(storeId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('"'"'categories'"'"');

  return useMutation<unknown, ApiError, CreateCategoryPayload>({
    mutationFn: (payload) => createCategory(storeId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      toast.success(t('"'"'form.createSuccess'"'"'));
      router.push(ROUTES.store(storeId).categories.list());
    },

    onError: (error) => {
      logger.error('"'"'Failed to create category'"'"', { error });
      toast.error(error.message ?? t('"'"'form.createError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/categories/useUpdateCategory.ts" \
''"'"'use client'"'"';

/**
 * Hook for updating an existing category.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { updateCategory } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { UpdateCategoryPayload } from '"'"'@/types/category'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useUpdateCategory(storeId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('"'"'categories'"'"');

  return useMutation<unknown, ApiError, UpdateCategoryPayload>({
    mutationFn: (payload) => updateCategory(storeId, categoryId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).detail(categoryId),
      });
      toast.success(t('"'"'form.updateSuccess'"'"'));
    },

    onError: (error) => {
      logger.error('"'"'Failed to update category'"'"', { error });
      toast.error(error.message ?? t('"'"'form.updateError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/categories/useDeleteCategory.ts" \
''"'"'use client'"'"';

/**
 * Hook for soft-deleting a category.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { useRouter } from '"'"'@/lib/navigation'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { deleteCategory } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useDeleteCategory(storeId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('"'"'categories'"'"');

  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteCategory(storeId, categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.categories(storeId).detail(categoryId),
      });
      toast.success(t('"'"'form.deleteSuccess'"'"'));
      router.push(ROUTES.store(storeId).categories.list());
    },

    onError: (error) => {
      logger.error('"'"'Failed to delete category'"'"', { error });
      toast.error(error.message ?? t('"'"'form.deleteError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/categories/useRestoreCategory.ts" \
''"'"'use client'"'"';

/**
 * Hook for restoring a soft-deleted category.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { restoreCategory } from '"'"'@/lib/api/categories'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useRestoreCategory(storeId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('"'"'categories'"'"');

  return useMutation<unknown, ApiError, void>({
    mutationFn: () => restoreCategory(storeId, categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).detail(categoryId),
      });
      toast.success(t('"'"'form.restoreSuccess'"'"'));
    },

    onError: (error) => {
      logger.error('"'"'Failed to restore category'"'"', { error });
      toast.error(error.message ?? t('"'"'form.restoreError'"'"'));
    },
  });
}
'

# =============================================================================
# 4. HOOKS — Brands
# =============================================================================

echo ""
echo "📦 [4/4] Hooks — Brands..."

write_file "$SRC/hooks/brands/useBrands.ts" \
''"'"'use client'"'"';

/**
 * Hook for fetching paginated brands list.
 */

import { useQuery } from '"'"'@tanstack/react-query'"'"';
import { getBrands } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { QUERY_CONFIG } from '"'"'@/config/query'"'"';
import { mapBrandListItem } from '"'"'@/lib/mappers/brands'"'"';
import { selectPaginatedList } from '"'"'@/lib/mappers/pagination'"'"';
import type { BrandListItem, BrandListItemView } from '"'"'@/types/brand'"'"';
import type { PaginatedResponse, ApiError } from '"'"'@/types/api'"'"';
import type { BrandFilters } from '"'"'@/schemas/brands'"'"';

export function useBrands(storeId: string, filters: BrandFilters) {
  return useQuery<
    PaginatedResponse<BrandListItem>,
    ApiError,
    PaginatedResponse<BrandListItemView>
  >({
    queryKey: queryKeys.brands(storeId).list(
      filters as unknown as Record<string, unknown>,
    ),
    queryFn:   () => getBrands(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select:    selectPaginatedList(mapBrandListItem),
  });
}
'

write_file "$SRC/hooks/brands/useBrandDetail.ts" \
''"'"'use client'"'"';

/**
 * Hook for fetching a single brand by ID.
 */

import { useQuery } from '"'"'@tanstack/react-query'"'"';
import { getBrandDetail } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { QUERY_CONFIG } from '"'"'@/config/query'"'"';
import { mapBrandDetail } from '"'"'@/lib/mappers/brands'"'"';
import type { BrandDetail, BrandDetailView } from '"'"'@/types/brand'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useBrandDetail(storeId: string, brandId: string) {
  return useQuery<BrandDetail, ApiError, BrandDetailView>({
    queryKey:  queryKeys.brands(storeId).detail(brandId),
    queryFn:   () => getBrandDetail(storeId, brandId),
    staleTime: QUERY_CONFIG.staleTime,
    select:    mapBrandDetail,
    enabled:   Boolean(storeId) && Boolean(brandId),
  });
}
'

write_file "$SRC/hooks/brands/useCreateBrand.ts" \
''"'"'use client'"'"';

/**
 * Hook for creating a new brand.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { useRouter } from '"'"'@/lib/navigation'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { createBrand } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { CreateBrandPayload } from '"'"'@/types/brand'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useCreateBrand(storeId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('"'"'brands'"'"');

  return useMutation<unknown, ApiError, CreateBrandPayload>({
    mutationFn: (payload) => createBrand(storeId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      toast.success(t('"'"'form.createSuccess'"'"'));
      router.push(ROUTES.store(storeId).brands.list());
    },

    onError: (error) => {
      logger.error('"'"'Failed to create brand'"'"', { error });
      toast.error(error.message ?? t('"'"'form.createError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/brands/useUpdateBrand.ts" \
''"'"'use client'"'"';

/**
 * Hook for updating an existing brand.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { updateBrand } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { UpdateBrandPayload } from '"'"'@/types/brand'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useUpdateBrand(storeId: string, brandId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('"'"'brands'"'"');

  return useMutation<unknown, ApiError, UpdateBrandPayload>({
    mutationFn: (payload) => updateBrand(storeId, brandId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).detail(brandId),
      });
      toast.success(t('"'"'form.updateSuccess'"'"'));
    },

    onError: (error) => {
      logger.error('"'"'Failed to update brand'"'"', { error });
      toast.error(error.message ?? t('"'"'form.updateError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/brands/useDeleteBrand.ts" \
''"'"'use client'"'"';

/**
 * Hook for soft-deleting a brand.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { useRouter } from '"'"'@/lib/navigation'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { deleteBrand } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useDeleteBrand(storeId: string, brandId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('"'"'brands'"'"');

  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteBrand(storeId, brandId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.brands(storeId).detail(brandId),
      });
      toast.success(t('"'"'form.deleteSuccess'"'"'));
      router.push(ROUTES.store(storeId).brands.list());
    },

    onError: (error) => {
      logger.error('"'"'Failed to delete brand'"'"', { error });
      toast.error(error.message ?? t('"'"'form.deleteError'"'"'));
    },
  });
}
'

write_file "$SRC/hooks/brands/useRestoreBrand.ts" \
''"'"'use client'"'"';

/**
 * Hook for restoring a soft-deleted brand.
 */

import { useMutation, useQueryClient } from '"'"'@tanstack/react-query'"'"';
import { toast } from '"'"'sonner'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { restoreBrand } from '"'"'@/lib/api/brands'"'"';
import { queryKeys } from '"'"'@/lib/queryKeys'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import type { ApiError } from '"'"'@/types/api'"'"';

export function useRestoreBrand(storeId: string, brandId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('"'"'brands'"'"');

  return useMutation<unknown, ApiError, void>({
    mutationFn: () => restoreBrand(storeId, brandId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).detail(brandId),
      });
      toast.success(t('"'"'form.restoreSuccess'"'"'));
    },

    onError: (error) => {
      logger.error('"'"'Failed to restore brand'"'"', { error });
      toast.error(error.message ?? t('"'"'form.restoreError'"'"'));
    },
  });
}
'

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PART 2 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  API Modules:"
echo "  ✅ src/lib/api/categories.ts"
echo "  ✅ src/lib/api/brands.ts"
echo ""
echo "  Mappers:"
echo "  ✅ src/lib/mappers/categories.ts"
echo "  ✅ src/lib/mappers/brands.ts"
echo ""
echo "  Hooks — Categories:"
echo "  ✅ src/hooks/categories/useCategories.ts"
echo "  ✅ src/hooks/categories/useCategoryDetail.ts"
echo "  ✅ src/hooks/categories/useCreateCategory.ts"
echo "  ✅ src/hooks/categories/useUpdateCategory.ts"
echo "  ✅ src/hooks/categories/useDeleteCategory.ts"
echo "  ✅ src/hooks/categories/useRestoreCategory.ts"
echo ""
echo "  Hooks — Brands:"
echo "  ✅ src/hooks/brands/useBrands.ts"
echo "  ✅ src/hooks/brands/useBrandDetail.ts"
echo "  ✅ src/hooks/brands/useCreateBrand.ts"
echo "  ✅ src/hooks/brands/useUpdateBrand.ts"
echo "  ✅ src/hooks/brands/useDeleteBrand.ts"
echo "  ✅ src/hooks/brands/useRestoreBrand.ts"
echo ""
echo "▶  Run Part 3 next: Categories UI (pages + components)"
echo "════════════════════════════════════════════════════════════"