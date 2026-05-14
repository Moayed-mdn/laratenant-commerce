#!/usr/bin/env bash

# =============================================================================
# PART 1 — Foundation: Config, Types, Schemas
# =============================================================================

set -e

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/src"

echo "🚀 Part 1: Foundation — Config, Types, Schemas..."
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
# 1. ROUTES CONFIG (updated)
# =============================================================================

echo ""
echo "📦 [1/7] Updating src/config/routes.ts..."

write_file "$SRC/config/routes.ts" \
'/**
 * Route configuration.
 *
 * IMPORTANT RULE: ROUTES never include locale prefix.
 * next-intl router adds locale automatically.
 * These are used with next-intl'\''s useRouter() and Link components.
 *
 * For hard redirects (redirect() from next/navigation in server components),
 * you must prepend the locale manually.
 */

export const ROUTES = {
  auth: {
    login:  () => '"'"'/login'"'"' as const,
    logout: () => '"'"'/logout'"'"' as const,
  },
  stores: {
    new: () => '"'"'/stores/new'"'"' as const,
  },
  store: (storeId: string) => ({
    dashboard: () => `/stores/${storeId}/dashboard` as const,

    users: {
      list:   () => `/stores/${storeId}/users` as const,
      detail: (userId: string) =>
        `/stores/${storeId}/users/${userId}` as const,
    },

    products: {
      list:   () => `/stores/${storeId}/products` as const,
      new:    () => `/stores/${storeId}/products/new` as const,
      edit:   (productId: string) =>
        `/stores/${storeId}/products/${productId}` as const,
    },

    orders: {
      list:   () => `/stores/${storeId}/orders` as const,
      detail: (orderId: string) =>
        `/stores/${storeId}/orders/${orderId}` as const,
    },

    categories: {
      list: () => `/stores/${storeId}/categories` as const,
      new:  () => `/stores/${storeId}/categories/new` as const,
      edit: (categoryId: string) =>
        `/stores/${storeId}/categories/${categoryId}/edit` as const,
    },

    brands: {
      list: () => `/stores/${storeId}/brands` as const,
      new:  () => `/stores/${storeId}/brands/new` as const,
      edit: (brandId: string) =>
        `/stores/${storeId}/brands/${brandId}/edit` as const,
    },
  }),
} as const;

export const API_ROUTES = {
  home: () => '"'"'/'"'"' as const,

  auth: {
    csrfCookie: () => '"'"'/sanctum/csrf-cookie'"'"',
    login:      () => '"'"'/api/v1/users/auth/login'"'"',
    logout:     () => '"'"'/api/v1/users/auth/logout'"'"',
    me:         () => '"'"'/api/v1/users/auth/me'"'"',
    register:   () => '"'"'/api/v1/users/auth/register'"'"',
  },

  store: (storeId: string) => ({

    dashboard: () => ({
      stats:        () => `/api/v1/admin/stores/${storeId}/dashboard/stats`,
      recentOrders: () => `/api/v1/admin/stores/${storeId}/dashboard/recent-orders`,
      topProducts:  () => `/api/v1/admin/stores/${storeId}/dashboard/top-products`,
    }),

    users: () => ({
      list:    () => `/api/v1/admin/stores/${storeId}/users`,
      detail:  (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}`,
      block:   (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/block`,
      unblock: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/unblock`,
      restore: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/restore`,
    }),

    products: () => ({
      list:    () => `/api/v1/admin/stores/${storeId}/products`,
      detail:  (productId: string) =>
        `/api/v1/admin/stores/${storeId}/products/${productId}`,
      restore: (productId: string) =>
        `/api/v1/admin/stores/${storeId}/products/${productId}/restore`,
    }),

    categories: () => ({
      list:    () => `/api/v1/admin/stores/${storeId}/categories`,
      detail:  (categoryId: string) =>
        `/api/v1/admin/stores/${storeId}/categories/${categoryId}`,
      create:  () => `/api/v1/admin/stores/${storeId}/categories`,
      update:  (categoryId: string) =>
        `/api/v1/admin/stores/${storeId}/categories/${categoryId}`,
      delete:  (categoryId: string) =>
        `/api/v1/admin/stores/${storeId}/categories/${categoryId}`,
      restore: (categoryId: string) =>
        `/api/v1/admin/stores/${storeId}/categories/${categoryId}/restore`,
    }),

    brands: () => ({
      list:    () => `/api/v1/admin/stores/${storeId}/brands`,
      detail:  (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}`,
      create:  () => `/api/v1/admin/stores/${storeId}/brands`,
      update:  (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}`,
      delete:  (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}`,
      restore: (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}/restore`,
    }),

    orders: () => ({
      list:         () => `/api/v1/admin/stores/${storeId}/orders`,
      detail:       (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}`,
      updateStatus: (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/status`,
      cancel:       (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/cancel`,
      refund:       (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/refund`,
    }),

  }),
} as const;
'

# =============================================================================
# 2. PERMISSIONS CONFIG (updated)
# =============================================================================

echo ""
echo "📦 [2/7] Updating src/config/permissions.ts..."

write_file "$SRC/config/permissions.ts" \
'/**
 * Permission configuration.
 */

import type { UserRole } from '"'"'@/types/user'"'"';

interface RolePermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canViewDashboard: boolean;
  canManageStoreSettings: boolean;
  canManageAllStores: boolean;
  canManageCategories: boolean;
  canManageBrands: boolean;
}

export const PERMISSIONS: Record<UserRole, RolePermissions> = {
  store_admin: {
    canManageUsers:        true,
    canManageProducts:     true,
    canManageOrders:       true,
    canViewDashboard:      true,
    canManageStoreSettings: true,
    canManageAllStores:    false,
    canManageCategories:   true,
    canManageBrands:       true,
  },
  staff: {
    canManageUsers:        false,
    canManageProducts:     false,
    canManageOrders:       false,
    canViewDashboard:      true,
    canManageStoreSettings: false,
    canManageAllStores:    false,
    canManageCategories:   false,
    canManageBrands:       false,
  },
  super_admin: {
    canManageUsers:        true,
    canManageProducts:     true,
    canManageOrders:       true,
    canViewDashboard:      true,
    canManageStoreSettings: true,
    canManageAllStores:    true,
    canManageCategories:   true,
    canManageBrands:       true,
  },
} as const;

export type PermissionKey = keyof RolePermissions;

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return PERMISSIONS[role][permission];
}
'

# =============================================================================
# 3. QUERY KEYS (updated)
# =============================================================================

echo ""
echo "📦 [3/7] Updating src/lib/queryKeys.ts..."

write_file "$SRC/lib/queryKeys.ts" \
'/**
 * Centralized TanStack Query key factory.
 * All query keys must be defined here — never inline.
 */

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────
  me: () => ['"'"'me'"'"'] as const,

  auth: {
    me: () => ['"'"'me'"'"'] as const,
  },

  // ── Products ──────────────────────────────────────────────────
  products: (storeId: string) => ({
    all:    () => ['"'"'products'"'"', storeId] as const,
    lists:  () => ['"'"'products'"'"', storeId, '"'"'list'"'"'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['"'"'products'"'"', storeId, '"'"'list'"'"', filters] as const,
    detail: (productId: string) =>
      ['"'"'products'"'"', storeId, '"'"'detail'"'"', productId] as const,
  }),

  // ── Categories ────────────────────────────────────────────────
  categories: (storeId: string) => ({
    all:    () => ['"'"'categories'"'"', storeId] as const,
    lists:  () => ['"'"'categories'"'"', storeId, '"'"'list'"'"'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['"'"'categories'"'"', storeId, '"'"'list'"'"', filters] as const,
    detail: (categoryId: string) =>
      ['"'"'categories'"'"', storeId, '"'"'detail'"'"', categoryId] as const,
  }),

  // ── Brands ────────────────────────────────────────────────────
  brands: (storeId: string) => ({
    all:    () => ['"'"'brands'"'"', storeId] as const,
    lists:  () => ['"'"'brands'"'"', storeId, '"'"'list'"'"'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['"'"'brands'"'"', storeId, '"'"'list'"'"', filters] as const,
    detail: (brandId: string) =>
      ['"'"'brands'"'"', storeId, '"'"'detail'"'"', brandId] as const,
  }),

  // ── Orders ────────────────────────────────────────────────────
  orders: (storeId: string) => ({
    all:    () => ['"'"'orders'"'"', storeId] as const,
    lists:  () => ['"'"'orders'"'"', storeId, '"'"'list'"'"'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['"'"'orders'"'"', storeId, '"'"'list'"'"', filters] as const,
    detail: (orderId: string) =>
      ['"'"'orders'"'"', storeId, '"'"'detail'"'"', orderId] as const,
  }),

  // ── Users ─────────────────────────────────────────────────────
  users: (storeId: string) => ({
    all:    () => ['"'"'users'"'"', storeId] as const,
    lists:  () => ['"'"'users'"'"', storeId, '"'"'list'"'"'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['"'"'users'"'"', storeId, '"'"'list'"'"', filters] as const,
    detail: (userId: string) =>
      ['"'"'users'"'"', storeId, '"'"'detail'"'"', userId] as const,
  }),

  // ── Dashboard ─────────────────────────────────────────────────
  dashboard: (storeId: string) => ({
    stats:        () => ['"'"'dashboard'"'"', storeId, '"'"'stats'"'"'] as const,
    recentOrders: () => ['"'"'dashboard'"'"', storeId, '"'"'recent-orders'"'"'] as const,
    topProducts:  () => ['"'"'dashboard'"'"', storeId, '"'"'top-products'"'"'] as const,
  }),
};
'

# =============================================================================
# 4. TYPES — Category
# =============================================================================

echo ""
echo "📦 [4/7] Creating src/types/category.ts..."

write_file "$SRC/types/category.ts" \
'/**
 * Category types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminCategoryResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────

/** Single translation entry (one locale) */
export interface CategoryTranslationRaw {
  locale: string;
  name:   string;
  slug:   string;
}

/** Parent reference embedded in detail response */
export interface CategoryParentRaw {
  id:   number;
  slug: string;
  name: string;
}

/** Category list item — raw API shape */
export interface CategoryListItem {
  id:             number;
  store_id:       number;
  slug:           string;
  parent_id:      number | null;
  sort_order:     number;
  is_active:      boolean;
  /** Current-locale translation (may be null if not yet translated) */
  translation:    CategoryTranslationRaw | null;
  products_count: number;
  created_at:     string;
  updated_at:     string;
  deleted_at:     string | null;
}

/** Category detail — raw API shape (superset of list item) */
export interface CategoryDetail extends CategoryListItem {
  /** All locale translations */
  translations: CategoryTranslationRaw[];
  parent:       CategoryParentRaw | null;
  children:     CategoryListItem[];
  breadcrumb:   Array<{ id: number; name: string; slug: string }>;
}

// ── View types ────────────────────────────────────────────────────────────

/** Category list item — mapped for UI consumption */
export interface CategoryListItemView {
  id:            number;
  storeId:       number;
  slug:          string;
  parentId:      number | null;
  sortOrder:     number;
  isActive:      boolean;
  /** Resolved display name (current locale, fallback to slug) */
  name:          string;
  productsCount: number;
  createdAt:     string;
  deletedAt:     string | null;
}

/** Category detail — mapped for UI consumption */
export interface CategoryDetailView {
  id:            number;
  storeId:       number;
  slug:          string;
  parentId:      number | null;
  sortOrder:     number;
  isActive:      boolean;
  name:          string;
  productsCount: number;
  createdAt:     string;
  updatedAt:     string;
  deletedAt:     string | null;
  translations:  CategoryTranslationRaw[];
  parent:        CategoryParentRaw | null;
  children:      CategoryListItemView[];
  breadcrumb:    Array<{ id: number; name: string; slug: string }>;
}

// ── Form types ────────────────────────────────────────────────────────────

/** Translation entry used in create/update form */
export interface CategoryTranslationFormEntry {
  locale: '"'"'en'"'"' | '"'"'ar'"'"';
  name:   string;
  slug:   string;
}

/** Payload sent to POST /categories */
export interface CreateCategoryPayload {
  slug:         string;
  parent_id:    number | null;
  sort_order:   number;
  is_active:    boolean;
  translations: CategoryTranslationFormEntry[];
}

/** Payload sent to PATCH /categories/:id */
export interface UpdateCategoryPayload extends CreateCategoryPayload {}

// ── Filter types ──────────────────────────────────────────────────────────

export interface CategoryFilters {
  is_active: '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"';
  page:      number;
  perPage:   number;
}
'

# =============================================================================
# 5. TYPES — Brand
# =============================================================================

echo ""
echo "📦 [5/7] Creating src/types/brand.ts..."

write_file "$SRC/types/brand.ts" \
'/**
 * Brand types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminBrandResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────

/** Brand list item — raw API shape */
export interface BrandListItem {
  id:             number;
  store_id:       number;
  name:           string;
  slug:           string;
  description:    string | null;
  logo_url:       string | null;
  sort_order:     number;
  is_active:      boolean;
  products_count: number;
  created_at:     string;
  updated_at:     string;
  deleted_at:     string | null;
}

/** Brand detail — raw API shape (same shape, kept separate for extensibility) */
export interface BrandDetail extends BrandListItem {}

// ── View types ────────────────────────────────────────────────────────────

/** Brand list item — mapped for UI consumption */
export interface BrandListItemView {
  id:            number;
  storeId:       number;
  name:          string;
  slug:          string;
  description:   string | null;
  logoUrl:       string | null;
  sortOrder:     number;
  isActive:      boolean;
  productsCount: number;
  createdAt:     string;
  deletedAt:     string | null;
}

/** Brand detail — mapped for UI consumption */
export interface BrandDetailView extends BrandListItemView {
  updatedAt: string;
}

// ── Form types ────────────────────────────────────────────────────────────

/** Payload sent to POST /brands */
export interface CreateBrandPayload {
  name:        string;
  slug:        string;
  description: string | null;
  logo_url:    string | null;
  sort_order:  number;
  is_active:   boolean;
}

/** Payload sent to PATCH /brands/:id */
export interface UpdateBrandPayload extends CreateBrandPayload {}

// ── Filter types ──────────────────────────────────────────────────────────

export interface BrandFilters {
  is_active: '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"';
  page:      number;
  perPage:   number;
}
'

# =============================================================================
# 6. SCHEMAS — Categories
# =============================================================================

echo ""
echo "📦 [6/7] Creating src/schemas/categories.ts..."

write_file "$SRC/schemas/categories.ts" \
'/**
 * Zod schemas for category filters and forms.
 */

import { z } from '"'"'zod'"'"';

// ── URL filter schema (validated from nuqs params) ────────────────────────

export const CategoryFiltersSchema = z.object({
  is_active: z.enum(['"'"'all'"'"', '"'"'true'"'"', '"'"'false'"'"']).default('"'"'all'"'"'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type CategoryFilters = z.infer<typeof CategoryFiltersSchema>;

// ── Translation entry schema ──────────────────────────────────────────────

export const CategoryTranslationSchema = z.object({
  locale: z.enum(['"'"'en'"'"', '"'"'ar'"'"']),
  name:   z.string().min(1, '"'"'Name is required'"'"').max(255),
  slug:   z
    .string()
    .min(1, '"'"'Slug is required'"'"')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '"'"'Slug must be lowercase letters, numbers and hyphens only'"'"'
    ),
});

// ── Create / Update form schema ───────────────────────────────────────────

export const CategoryFormSchema = z.object({
  slug: z
    .string()
    .min(1, '"'"'Slug is required'"'"')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '"'"'Slug must be lowercase letters, numbers and hyphens only'"'"'
    ),
  parent_id:    z.number().nullable().default(null),
  sort_order:   z.coerce.number().min(0).default(0),
  is_active:    z.boolean().default(true),
  translations: z
    .array(CategoryTranslationSchema)
    .min(1, '"'"'At least one translation is required'"'"'),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
'

# =============================================================================
# 7. SCHEMAS — Brands
# =============================================================================

echo ""
echo "📦 [7/7] Creating src/schemas/brands.ts..."

write_file "$SRC/schemas/brands.ts" \
'/**
 * Zod schemas for brand filters and forms.
 */

import { z } from '"'"'zod'"'"';

// ── URL filter schema (validated from nuqs params) ────────────────────────

export const BrandFiltersSchema = z.object({
  is_active: z.enum(['"'"'all'"'"', '"'"'true'"'"', '"'"'false'"'"']).default('"'"'all'"'"'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type BrandFilters = z.infer<typeof BrandFiltersSchema>;

// ── Create / Update form schema ───────────────────────────────────────────

export const BrandFormSchema = z.object({
  name: z
    .string()
    .min(1, '"'"'Name is required'"'"')
    .max(255),
  slug: z
    .string()
    .min(1, '"'"'Slug is required'"'"')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '"'"'Slug must be lowercase letters, numbers and hyphens only'"'"'
    ),
  description: z.string().max(5000).nullable().default(null),
  logo_url:    z
    .string()
    .url('"'"'Must be a valid URL'"'"')
    .max(2048)
    .nullable()
    .default(null)
    .or(z.literal('"'"''"'"').transform(() => null)),
  sort_order: z.coerce.number().min(0).default(0),
  is_active:  z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof BrandFormSchema>;
'

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PART 1 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  ✅ src/config/routes.ts         (updated — categories + brands)"
echo "  ✅ src/config/permissions.ts    (updated — canManageCategories + canManageBrands)"
echo "  ✅ src/lib/queryKeys.ts         (updated — detail keys added)"
echo "  ✅ src/types/category.ts        (new)"
echo "  ✅ src/types/brand.ts           (new)"
echo "  ✅ src/schemas/categories.ts    (new)"
echo "  ✅ src/schemas/brands.ts        (new)"
echo ""
echo "▶  Run Part 2 next: API modules, mappers, hooks"
echo "════════════════════════════════════════════════════════════"