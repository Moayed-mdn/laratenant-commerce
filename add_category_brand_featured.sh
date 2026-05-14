#!/usr/bin/env bash

# =============================================================================
# Add category, brand, and is_featured to the Create Product Wizard
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Add Category / Brand / isFeatured to Wizard"
echo "============================================="

# =============================================================================
# PHASE 1 — TYPES
# =============================================================================

echo ""
echo "→ Phase 1: Writing category and brand types..."

mkdir -p "$SRC/types"

cat > "$SRC/types/category.ts" << 'EOF'
/**
 * Category types for the admin dashboard.
 */

export interface AdminCategoryTranslation {
  locale: string;
  name:   string;
  slug:   string;
}

export interface AdminCategory {
  id:          number;
  slug:        string;
  sort_order:  number;
  is_active:   boolean;
  store_id:    number;
  parent_id:   number | null;
  translation: AdminCategoryTranslation | null;
  created_at:  string | null;
  updated_at:  string | null;
  deleted_at:  string | null;
}

/** Flat select option derived from AdminCategory — used in dropdowns. */
export interface CategorySelectOption {
  value: number;
  label: string;
}
EOF

cat > "$SRC/types/brand.ts" << 'EOF'
/**
 * Brand types for the admin dashboard.
 */

export interface AdminBrand {
  id:          number;
  store_id:    number;
  name:        string;
  slug:        string;
  description: string | null;
  logo_url:    string | null;
  sort_order:  number;
  is_active:   boolean;
  created_at:  string | null;
  updated_at:  string | null;
  deleted_at:  string | null;
}

/** Flat select option derived from AdminBrand — used in dropdowns. */
export interface BrandSelectOption {
  value: number;
  label: string;
}
EOF

echo "   ✓ types/category.ts and types/brand.ts written"

# =============================================================================
# PHASE 2 — ROUTES
# =============================================================================

echo ""
echo "→ Phase 2: Adding category and brand routes to config/routes.ts..."

cat > "$SRC/config/routes.ts" << 'EOF'
/**
 * Route configuration.
 *
 * IMPORTANT RULE: ROUTES never include locale prefix.
 * next-intl router adds locale automatically.
 * These are used with next-intl's useRouter() and Link components.
 *
 * For hard redirects (redirect() from next/navigation in server components),
 * you must prepend the locale manually.
 */

export const ROUTES = {
  auth: {
    login:  () => '/login' as const,
    logout: () => '/logout' as const,
  },
  stores: {
    new: () => '/stores/new' as const,
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
  }),
} as const;

export const API_ROUTES = {
  home: () => '/' as const,
  auth: {
    csrfCookie: () => '/sanctum/csrf-cookie',
    login:      () => '/api/v1/users/auth/login',
    logout:     () => '/api/v1/users/auth/logout',
    me:         () => '/api/v1/users/auth/me',
    register:   () => '/api/v1/users/auth/register',
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
      list:   () => `/api/v1/admin/stores/${storeId}/categories`,
      detail: (categoryId: string) =>
        `/api/v1/admin/stores/${storeId}/categories/${categoryId}`,
    }),
    brands: () => ({
      list:   () => `/api/v1/admin/stores/${storeId}/brands`,
      detail: (brandId: string) =>
        `/api/v1/admin/stores/${storeId}/brands/${brandId}`,
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
EOF

echo "   ✓ config/routes.ts updated"

# =============================================================================
# PHASE 3 — API FUNCTIONS
# =============================================================================

echo ""
echo "→ Phase 3: Writing API functions for categories and brands..."

mkdir -p "$SRC/lib/api"

cat > "$SRC/lib/api/categories.ts" << 'EOF'
/**
 * Categories API functions (client-side).
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { AdminCategory } from '@/types/category';
import type { PaginatedResponse } from '@/types/api';

export interface CategoryListFilters {
  is_active?: boolean;
  per_page?:  number;
}

/**
 * Fetch the flat category list for a store.
 * Used to populate category dropdowns.
 */
export async function getCategories(
  storeId: string,
  filters: CategoryListFilters = {}
): Promise<PaginatedResponse<AdminCategory>> {
  const params: Record<string, string | number | boolean> = {};

  if (filters.is_active !== undefined) {
    params.is_active = filters.is_active;
  }
  if (filters.per_page !== undefined) {
    params.per_page = filters.per_page;
  }

  return clientApi.get<PaginatedResponse<AdminCategory>>(
    API_ROUTES.store(storeId).categories().list(),
    { params }
  );
}
EOF

cat > "$SRC/lib/api/brands.ts" << 'EOF'
/**
 * Brands API functions (client-side).
 */

import { clientApi } from '@/lib/api/client';
import { API_ROUTES } from '@/config/routes';
import type { AdminBrand } from '@/types/brand';
import type { PaginatedResponse } from '@/types/api';

export interface BrandListFilters {
  is_active?: boolean;
  per_page?:  number;
}

/**
 * Fetch the brand list for a store.
 * Used to populate brand dropdowns.
 */
export async function getBrands(
  storeId: string,
  filters: BrandListFilters = {}
): Promise<PaginatedResponse<AdminBrand>> {
  const params: Record<string, string | number | boolean> = {};

  if (filters.is_active !== undefined) {
    params.is_active = filters.is_active;
  }
  if (filters.per_page !== undefined) {
    params.per_page = filters.per_page;
  }

  return clientApi.get<PaginatedResponse<AdminBrand>>(
    API_ROUTES.store(storeId).brands().list(),
    { params }
  );
}
EOF

echo "   ✓ lib/api/categories.ts and lib/api/brands.ts written"

# =============================================================================
# PHASE 4 — QUERY KEYS
# =============================================================================

echo ""
echo "→ Phase 4: Adding category and brand query keys..."

cat > "$SRC/lib/queryKeys.ts" << 'EOF'
/**
 * Centralized TanStack Query key factory.
 * All query keys must be defined here — never inline.
 */

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────
  me: () => ['me'] as const,

  // ── Products ──────────────────────────────────────────────────
  products: (storeId: string) => ({
    all:    () => ['products', storeId] as const,
    lists:  () => ['products', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['products', storeId, 'list', filters] as const,
    detail: (productId: string) =>
      ['products', storeId, 'detail', productId] as const,
  }),

  // ── Categories ────────────────────────────────────────────────
  categories: (storeId: string) => ({
    all:   () => ['categories', storeId] as const,
    lists: () => ['categories', storeId, 'list'] as const,
    list:  (filters: Record<string, unknown> = {}) =>
      ['categories', storeId, 'list', filters] as const,
  }),

  // ── Brands ────────────────────────────────────────────────────
  brands: (storeId: string) => ({
    all:   () => ['brands', storeId] as const,
    lists: () => ['brands', storeId, 'list'] as const,
    list:  (filters: Record<string, unknown> = {}) =>
      ['brands', storeId, 'list', filters] as const,
  }),

  // ── Orders ────────────────────────────────────────────────────
  orders: (storeId: string) => ({
    all:    () => ['orders', storeId] as const,
    lists:  () => ['orders', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['orders', storeId, 'list', filters] as const,
    detail: (orderId: string) =>
      ['orders', storeId, 'detail', orderId] as const,
  }),

  // ── Users ─────────────────────────────────────────────────────
  users: (storeId: string) => ({
    all:    () => ['users', storeId] as const,
    lists:  () => ['users', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['users', storeId, 'list', filters] as const,
    detail: (userId: string) =>
      ['users', storeId, 'detail', userId] as const,
  }),

  // ── Dashboard ─────────────────────────────────────────────────
  dashboard: (storeId: string) => ({
    stats:        () => ['dashboard', storeId, 'stats'] as const,
    recentOrders: () => ['dashboard', storeId, 'recent-orders'] as const,
    topProducts:  () => ['dashboard', storeId, 'top-products'] as const,
  }),
};
EOF

echo "   ✓ lib/queryKeys.ts updated"

# =============================================================================
# PHASE 5 — HOOKS
# =============================================================================

echo ""
echo "→ Phase 5: Writing useCategories and useBrands hooks..."

mkdir -p "$SRC/hooks/categories"
mkdir -p "$SRC/hooks/brands"

cat > "$SRC/hooks/categories/useCategories.ts" << 'EOF'
'use client';

/**
 * Hook for fetching the category list for a store.
 * Fetches only active categories with a high per_page limit
 * so the dropdown is fully populated without pagination.
 */

import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';
import type { AdminCategory } from '@/types/category';
import type { ApiError } from '@/types/api';

export function useCategories(storeId: string) {
  return useQuery<AdminCategory[], ApiError>({
    queryKey: queryKeys.categories(storeId).list({ is_active: true }),
    queryFn: async () => {
      const response = await getCategories(storeId, {
        is_active: true,
        per_page:  100,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — categories change infrequently
  });
}
EOF

cat > "$SRC/hooks/brands/useBrands.ts" << 'EOF'
'use client';

/**
 * Hook for fetching the brand list for a store.
 * Fetches only active brands with a high per_page limit
 * so the dropdown is fully populated without pagination.
 */

import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/lib/api/brands';
import { queryKeys } from '@/lib/queryKeys';
import type { AdminBrand } from '@/types/brand';
import type { ApiError } from '@/types/api';

export function useBrands(storeId: string) {
  return useQuery<AdminBrand[], ApiError>({
    queryKey: queryKeys.brands(storeId).list({ is_active: true }),
    queryFn: async () => {
      const response = await getBrands(storeId, {
        is_active: true,
        per_page:  100,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — brands change infrequently
  });
}
EOF

echo "   ✓ useCategories.ts and useBrands.ts written"

# =============================================================================
# PHASE 6 — LOCALE KEYS
# =============================================================================

echo ""
echo "→ Phase 6: Adding category/brand/isFeatured locale keys..."

python3 - << 'PYEOF'
import json, os

src = os.environ.get('SRC', 'src')

en_keys = {
    "category":            "Category",
    "categoryPlaceholder": "Select a category",
    "noCategoryOption":    "No category",
    "brand":               "Brand",
    "brandPlaceholder":    "Select a brand",
    "noBrandOption":       "No brand",
    "isFeatured":          "Featured product",
    "isFeaturedHint":      "Featured products are highlighted in the storefront.",
    "loading":             "Loading...",
}

ar_keys = {
    "category":            "الفئة",
    "categoryPlaceholder": "اختر فئة",
    "noCategoryOption":    "بدون فئة",
    "brand":               "العلامة التجارية",
    "brandPlaceholder":    "اختر علامة تجارية",
    "noBrandOption":       "بدون علامة تجارية",
    "isFeatured":          "منتج مميز",
    "isFeaturedHint":      "تُعرض المنتجات المميزة بشكل بارز في الواجهة.",
    "loading":             "جارٍ التحميل...",
}

for lang, new_keys in [('en', en_keys), ('ar', ar_keys)]:
    path = os.path.join(src, 'locales', lang, 'common.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if 'products' not in data:
        data['products'] = {}

    # Inject under products.form.fields
    if 'form' not in data['products']:
        data['products']['form'] = {}
    if 'fields' not in data['products']['form']:
        data['products']['form']['fields'] = {}

    data['products']['form']['fields'].update(new_keys)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'  ✓ {lang}/common.json updated')
PYEOF

echo "   ✓ Locale files updated"

# =============================================================================
# PHASE 7 — SCHEMA UPDATE
# =============================================================================

echo ""
echo "→ Phase 7: Adding categoryId, brandId, isFeatured to content schema..."

cat > "$SRC/schemas/products.ts" << 'EOF'
/**
 * Zod schemas for product filters and create wizard validation.
 *
 * Design note — two-type-system rule:
 * Zod schemas are used for RUNTIME VALIDATION only.
 * Wizard STATE types use the canonical domain types from types/product.ts
 * (ProductVariant, ProductOption) directly.
 */

import { z } from 'zod';
import type { ProductOption, ProductVariant } from '@/types/product';

// ── List filters ────────────────────────────────────────────────────────────

export const ProductFiltersSchema = z.object({
  search:  z.string().optional().default(''),
  status:  z.enum(['all', 'active', 'draft']).default('all'),
  page:    z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

// ── Create wizard — Step 1: Content ────────────────────────────────────────

export const ProductTranslationSchema = z.object({
  locale:          z.string().min(1),
  name:            z.string().min(1, 'Name is required').max(255),
  slug:            z.string().min(1, 'Slug is required').max(255),
  description:     z.string().nullable().default(null),
  seo_title:       z.string().max(255).nullable().default(null),
  seo_description: z.string().max(1000).nullable().default(null),
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),
  categoryId:   z.number().int().nullable().default(null),
  brandId:      z.number().int().nullable().default(null),
  isFeatured:   z.boolean().default(false),
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────

// Runtime-only validation schemas (not used as state types).
export const CreateProductVariantValidationSchema = z.object({
  id:       z.number(),
  price:    z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

export const CreateProductOptionValidationSchema = z.object({
  name:   z.string().min(1, 'Option name is required'),
  values: z.array(z.object({ value: z.string().min(1) })).min(1),
});

/**
 * Wizard Step 2 state type.
 * Uses canonical domain types directly — NOT Zod-inferred types.
 */
export interface CreateProductStructureData {
  options:  ProductOption[];
  variants: ProductVariant[];
}

// ── Full wizard state ───────────────────────────────────────────────────────

export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
}
EOF

echo "   ✓ schemas/products.ts updated"

# =============================================================================
# PHASE 8 — CATEGORY SELECT COMPONENT
# =============================================================================

echo ""
echo "→ Phase 8: Writing CategorySelect and BrandSelect components..."

mkdir -p "$SRC/components/shared/create-product"

cat > "$SRC/components/shared/create-product/CategorySelect.tsx" << 'EOF'
'use client';

/**
 * CategorySelect
 *
 * Dropdown for selecting a product category.
 * Fetches active categories for the given store.
 * Includes a "No category" option to clear the selection.
 */

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/categories/useCategories';

interface Props {
  storeId:  string;
  value:    number | null;
  onChange: (next: number | null) => void;
}

const NO_CATEGORY = '__none__';

export function CategorySelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');
  const { data: categories, isLoading } = useCategories(storeId);

  const handleChange = (raw: string) => {
    onChange(raw === NO_CATEGORY ? null : parseInt(raw, 10));
  };

  const selectValue = value !== null ? String(value) : NO_CATEGORY;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.category')}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? t('form.fields.loading')
                : t('form.fields.categoryPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          {/* Clear selection option */}
          <SelectItem value={NO_CATEGORY}>
            {t('form.fields.noCategoryOption')}
          </SelectItem>

          {(categories ?? []).map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {cat.translation?.name ?? cat.slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

# =============================================================================
# PHASE 9 — BRAND SELECT COMPONENT
# =============================================================================

cat > "$SRC/components/shared/create-product/BrandSelect.tsx" << 'EOF'
'use client';

/**
 * BrandSelect
 *
 * Dropdown for selecting a product brand.
 * Fetches active brands for the given store.
 * Includes a "No brand" option to clear the selection.
 */

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrands } from '@/hooks/brands/useBrands';

interface Props {
  storeId:  string;
  value:    number | null;
  onChange: (next: number | null) => void;
}

const NO_BRAND = '__none__';

export function BrandSelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');
  const { data: brands, isLoading } = useBrands(storeId);

  const handleChange = (raw: string) => {
    onChange(raw === NO_BRAND ? null : parseInt(raw, 10));
  };

  const selectValue = value !== null ? String(value) : NO_BRAND;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.brand')}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? t('form.fields.loading')
                : t('form.fields.brandPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          {/* Clear selection option */}
          <SelectItem value={NO_BRAND}>
            {t('form.fields.noBrandOption')}
          </SelectItem>

          {(brands ?? []).map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

echo "   ✓ CategorySelect.tsx and BrandSelect.tsx written"

# =============================================================================
# PHASE 10 — UPDATE CreateProductContentStep
# Add category, brand, isFeatured below the status selector
# =============================================================================

echo ""
echo "→ Phase 10: Updating CreateProductContentStep..."

cat > "$SRC/components/shared/create-product/CreateProductContentStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 1 — Content
 *
 * Collects:
 * - Product status (active / draft)
 * - Category assignment (nullable)
 * - Brand assignment (nullable)
 * - isFeatured toggle
 * - Locale-keyed translations (name, slug, description, SEO fields)
 *
 * Reuses the existing StatusSelect and ProductContentTab components
 * from the edit editor for UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { StatusSelect } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/StatusSelect';
import { ProductContentTab } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductContentTab';
import { CategorySelect } from './CategorySelect';
import { BrandSelect }    from './BrandSelect';

import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
import type { CreateProductContentData } from '@/schemas/products';

interface Props {
  storeId:          string;
  availableLocales: Locale[];
  content:          CreateProductContentData;
  onChange:         (next: CreateProductContentData) => void;
}

export function CreateProductContentStep({
  storeId,
  availableLocales,
  content,
  onChange,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">

      {/* ── Status + Category + Brand + isFeatured ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Status */}
          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onChange({ ...content, status })
            }
          />

          {/* Category */}
          <CategorySelect
            storeId={storeId}
            value={content.categoryId}
            onChange={(categoryId) =>
              onChange({ ...content, categoryId })
            }
          />

          {/* Brand */}
          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={(brandId) =>
              onChange({ ...content, brandId })
            }
          />

          {/* isFeatured */}
          <div className="flex items-start gap-3">
            <Switch
              id="is-featured"
              checked={content.isFeatured}
              onCheckedChange={(checked) =>
                onChange({ ...content, isFeatured: checked })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="is-featured" className="cursor-pointer">
                {t('form.fields.isFeatured')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('form.fields.isFeaturedHint')}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Translations ── */}
      <ProductContentTab
        availableLocales={availableLocales}
        translations={content.translations as Record<Locale, ProductTranslation>}
        onChange={(translations) =>
          onChange({
            ...content,
            translations: translations as CreateProductContentData['translations'],
          })
        }
      />

    </div>
  );
}
EOF

echo "   ✓ CreateProductContentStep.tsx updated"

# =============================================================================
# PHASE 11 — UPDATE CreateProductWizard (pass storeId to content step)
# =============================================================================

echo ""
echo "→ Phase 11: Updating CreateProductWizard..."

cat > "$SRC/components/shared/create-product/CreateProductWizard.tsx" << 'EOF'
'use client';

/**
 * CreateProductWizard
 *
 * Three-step wizard for creating a product:
 *   Step 1: Content  (status + category + brand + isFeatured + translations)
 *   Step 2: Structure (options + variants)
 *   Step 3: Review   (summary + submit)
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/navigation';

import { CreateProductContentStep }   from './CreateProductContentStep';
import { CreateProductStructureStep } from './CreateProductStructureStep';
import { CreateProductReviewStep }    from './CreateProductReviewStep';

import { buildCreatePayload } from '@/lib/products/buildCreatePayload';
import { useCreateProduct }   from '@/hooks/products/useCreateProduct';

import type { Locale, ProductTranslation } from '@/types/product';
import type {
  CreateProductContentData,
  CreateProductStructureData,
  CreateProductWizardState,
} from '@/schemas/products';
import { ROUTES } from '@/config/routes';

// ── Step definitions ────────────────────────────────────────────────────────

type WizardStep = 'content' | 'structure' | 'review';

const STEPS: WizardStep[] = ['content', 'structure', 'review'];

// ── Default state builders ──────────────────────────────────────────────────

function buildDefaultTranslations(
  locales: Locale[]
): Record<Locale, ProductTranslation> {
  return locales.reduce<Record<Locale, ProductTranslation>>((acc, locale) => {
    acc[locale] = {
      locale,
      name:            '',
      slug:            '',
      description:     null,
      seo_title:       null,
      seo_description: null,
      is_complete:     false,
    };
    return acc;
  }, {});
}

function buildDefaultContent(locales: Locale[]): CreateProductContentData {
  return {
    status:       'draft',
    categoryId:   null,
    brandId:      null,
    isFeatured:   false,
    translations: buildDefaultTranslations(locales),
  };
}

function buildDefaultStructure(): CreateProductStructureData {
  return { options: [], variants: [] };
}

// ── Step validation ─────────────────────────────────────────────────────────

function validateContent(
  content: CreateProductContentData,
  t: (key: string) => string
): string | null {
  const translations = Object.values(content.translations);
  const hasValid = translations.some(
    (tr) => tr.name.trim() !== '' && tr.slug.trim() !== ''
  );
  if (!hasValid) {
    return t('form.validation.translationMissingRequired');
  }
  return null;
}

function validateStructure(
  structure: CreateProductStructureData,
  t: (key: string) => string
): string | null {
  for (const variant of structure.variants) {
    if (variant.price < 0) return t('form.validation.variantPriceInvalid');
    if (variant.quantity < 0) return t('form.validation.variantQuantityInvalid');
  }
  return null;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  storeId:           string;
  availableLocales?: Locale[];
  onSuccess:         (productId: number) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export function CreateProductWizard({
  storeId,
  availableLocales = ['en'],
  onSuccess,
}: Props) {
  const t = useTranslations('products');

  const [step, setStep]           = useState<WizardStep>('content');
  const [content, setContent]     = useState<CreateProductContentData>(
    () => buildDefaultContent(availableLocales)
  );
  const [structure, setStructure] = useState<CreateProductStructureData>(
    buildDefaultStructure
  );

  const stepIndex   = STEPS.indexOf(step);
  const isFirstStep = stepIndex === 0;
  const isLastStep  = stepIndex === STEPS.length - 1;

  const mutation = useCreateProduct(storeId, {
    onSuccess: (product) => {
      toast.success(t('form.createSuccess'));
      onSuccess(product.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 'content') {
      const error = validateContent(content, t);
      if (error) { toast.error(error); return; }
    }
    if (step === 'structure') {
      const error = validateStructure(structure, t);
      if (error) { toast.error(error); return; }
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const state: CreateProductWizardState = { content, structure };
    const payload = buildCreatePayload(state);
    mutation.mutate(payload);
  };

  // ── Step labels ───────────────────────────────────────────────────────────

  const stepLabels: Record<WizardStep, string> = {
    content:   t('create.steps.content'),
    structure: t('create.steps.structure'),
    review:    t('create.steps.review'),
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.store(storeId).products.list()}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : i < stepIndex
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {i + 1}
            </div>
            <span
              className={[
                'text-sm',
                s === step ? 'font-medium text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              {stepLabels[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 'content' && (
        <CreateProductContentStep
          storeId={storeId}
          availableLocales={availableLocales}
          content={content}
          onChange={setContent}
        />
      )}

      {step === 'structure' && (
        <CreateProductStructureStep
          structure={structure}
          onChange={setStructure}
        />
      )}

      {step === 'review' && (
        <CreateProductReviewStep state={{ content, structure }} />
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={mutation.isPending}
            >
              {t('create.back')}
            </Button>
          )}
        </div>
        <div>
          {!isLastStep ? (
            <Button type="button" onClick={handleNext}>
              {t('create.next')}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t('form.submit.creating')
                : t('form.submit.create')}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
EOF

echo "   ✓ CreateProductWizard.tsx updated"

# =============================================================================
# PHASE 12 — UPDATE buildCreatePayload (add categoryId, brandId, isFeatured)
# =============================================================================

echo ""
echo "→ Phase 12: Updating buildCreatePayload.ts..."

cat > "$SRC/lib/products/buildCreatePayload.ts" << 'EOF'
import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Mapping:
 * - content.status      → status
 * - content.categoryId  → category_id
 * - content.brandId     → brand_id
 * - content.isFeatured  → is_featured
 * - content.translations → translations[]
 * - structure.options   → options[]
 * - structure.variants  → variants[] with semantic options map
 *
 * Negative variant IDs are client-only — omitted from payload.
 * Empty translations (no name + slug) are filtered out.
 * Options with empty names or no values are filtered out.
 */
export function buildCreatePayload(
  state: CreateProductWizardState
): ProductCreatePayload {
  const { content, structure } = state;

  // ── Translations ───────────────────────────────────────────────
  const translations = Object.values(content.translations)
    .filter((t) => t.name.trim() !== '' && t.slug.trim() !== '')
    .map((t) => ({
      locale:          t.locale,
      name:            t.name.trim(),
      slug:            t.slug.trim(),
      description:     t.description     ?? null,
      seo_title:       t.seo_title       ?? null,
      seo_description: t.seo_description ?? null,
    }));

  // ── Canonical options ──────────────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name:     o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values:   o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variants ───────────────────────────────────────────────────
  let variants = (structure.variants ?? []).map((v) => {
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) optionsMap[name] = value;
    }

    return {
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:              v.sku              ?? null,
      price:            v.price,
      quantity:         v.quantity,
      is_active:        v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date:      v.expiry_date      ?? null,
      batch_number:     v.batch_number     ?? null,
      options:          optionsMap,
    };
  });

  // ── Default variant fallback ───────────────────────────────────
  if (variants.length === 0) {
    variants = [{
      sku:              null,
      price:            0,
      quantity:         0,
      is_active:        true,
      manufacture_date: null,
      expiry_date:      null,
      batch_number:     null,
      options:          {},
    }];
  }

  return {
    status:      content.status,
    category_id: content.categoryId  ?? null,
    brand_id:    content.brandId     ?? null,
    is_featured: content.isFeatured  ?? false,
    translations,
    options,
    variants,
  };
}
EOF

echo "   ✓ buildCreatePayload.ts updated"

# =============================================================================
# PHASE 13 — UPDATE ProductCreatePayload type
# =============================================================================

echo ""
echo "→ Phase 13: Adding category_id, brand_id, is_featured to ProductCreatePayload..."

python3 - << 'PYEOF'
import re, os

src = os.environ.get('SRC', 'src')
path = os.path.join(src, 'types', 'product.ts')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''export interface ProductCreatePayload {
  status: ProductStatus;
  is_featured?: boolean;'''

new = '''export interface ProductCreatePayload {
  status:      ProductStatus;
  category_id?: number | null;
  brand_id?:    number | null;
  is_featured?: boolean;'''

if old in content:
    content = content.replace(old, new)
    print('  ✓ ProductCreatePayload updated (category_id, brand_id added)')
elif 'category_id?' in content:
    print('  ✓ ProductCreatePayload already has category_id — skipped')
else:
    print('  ⚠ ProductCreatePayload pattern not found — check manually')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
PYEOF

echo "   ✓ types/product.ts updated"

# =============================================================================
# PHASE 14 — UPDATE Review step to show category/brand/isFeatured
# =============================================================================

echo ""
echo "→ Phase 14: Updating CreateProductReviewStep..."

cat > "$SRC/components/shared/create-product/CreateProductReviewStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 3 — Review & Create
 *
 * Displays a summary of what will be sent to the backend:
 * - Status and isFeatured flag
 * - Category and Brand IDs (if selected)
 * - Number of translations (with locale + name)
 * - Number of options and variants
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CreateProductWizardState } from '@/schemas/products';

interface Props {
  state: CreateProductWizardState;
}

export function CreateProductReviewStep({ state }: Props) {
  const t = useTranslations('products');

  const { content, structure } = state;

  const translationEntries = Object.values(content.translations).filter(
    (tr) => tr.name.trim() !== '' || tr.slug.trim() !== ''
  );

  const optionCount  = structure.options.length;
  const variantCount = structure.variants.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('create.review.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('create.review.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Status + isFeatured */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.review.status')}
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant={content.status === 'active' ? 'default' : 'outline'}
              >
                {content.status}
              </Badge>
              {content.isFeatured && (
                <Badge variant="secondary">
                  {t('form.fields.isFeatured')}
                </Badge>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.category')}
            </span>
            <span className="text-sm text-muted-foreground">
              {content.categoryId !== null
                ? `#${content.categoryId}`
                : t('form.fields.noCategoryOption')}
            </span>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('form.fields.brand')}
            </span>
            <span className="text-sm text-muted-foreground">
              {content.brandId !== null
                ? `#${content.brandId}`
                : t('form.fields.noBrandOption')}
            </span>
          </div>

          {/* Translations */}
          <div className="flex items-start justify-between border-b pb-3">
            <span className="text-sm font-medium">
              {t('create.steps.content')}
            </span>
            {translationEntries.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                {translationEntries.map((tr) => (
                  <Badge key={tr.locale} variant="secondary">
                    {tr.locale}: {tr.name || '—'}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('create.review.noTranslations')}
              </span>
            )}
          </div>

          {/* Structure */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('create.steps.structure')}
            </span>
            <div className="flex flex-col items-end gap-1">
              {optionCount > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.optionsCount', { count: optionCount })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.noOptions')}
                </span>
              )}
              {variantCount > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.variantsCount', { count: variantCount })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('create.review.noVariants')}
                </span>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
EOF

echo "   ✓ CreateProductReviewStep.tsx updated"

# =============================================================================
# PHASE 15 — UPDATE buildCreatePayload test
# =============================================================================

echo ""
echo "→ Phase 15: Updating buildCreatePayload.test.ts..."

mkdir -p "$SRC/lib/products/__tests__"

cat > "$SRC/lib/products/__tests__/buildCreatePayload.test.ts" << 'EOF'
import { buildCreatePayload } from '../buildCreatePayload';
import type { CreateProductWizardState } from '@/schemas/products';
import type { ProductVariant } from '@/types/product';

// ── Fixture helpers ─────────────────────────────────────────────────────────

function makeVariant(
  overrides: Partial<ProductVariant> & { id: number }
): ProductVariant {
  return {
    sku:              null,
    price:            29.99,
    quantity:         0,
    is_active:        true,
    manufacture_date: null,
    expiry_date:      null,
    batch_number:     null,
    options:          [],
    ...overrides,
  };
}

function makeState(
  overrides: Partial<CreateProductWizardState> = {}
): CreateProductWizardState {
  return {
    content: {
      status:     'draft',
      categoryId: null,
      brandId:    null,
      isFeatured: false,
      translations: {
        en: {
          locale:          'en',
          name:            'Test Product',
          slug:            'test-product',
          description:     'A description',
          seo_title:       null,
          seo_description: null,
        },
      },
    },
    structure: {
      options: [
        {
          id:       1,
          name:     'Color',
          position: 1,
          values: [
            { id: 10, value: 'Red' },
            { id: 11, value: 'Blue' },
          ],
        },
      ],
      variants: [
        makeVariant({
          id:       -1,
          sku:      'RED-DEFAULT',
          price:    29.99,
          quantity: 5,
          options:  [{ option_name: 'Color', option_value: 'Red' }],
        }),
        makeVariant({
          id:       -2,
          sku:      null,
          price:    29.99,
          quantity: 0,
          options:  [{ option_name: 'Color', option_value: 'Blue' }],
        }),
      ],
    },
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('buildCreatePayload', () => {
  it('maps status from content', () => {
    expect(buildCreatePayload(makeState()).status).toBe('draft');
  });

  it('maps category_id from content.categoryId', () => {
    const state = makeState();
    state.content.categoryId = 5;
    expect(buildCreatePayload(state).category_id).toBe(5);
  });

  it('maps category_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).category_id).toBeNull();
  });

  it('maps brand_id from content.brandId', () => {
    const state = makeState();
    state.content.brandId = 3;
    expect(buildCreatePayload(state).brand_id).toBe(3);
  });

  it('maps brand_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).brand_id).toBeNull();
  });

  it('maps is_featured from content.isFeatured', () => {
    const state = makeState();
    state.content.isFeatured = true;
    expect(buildCreatePayload(state).is_featured).toBe(true);
  });

  it('defaults is_featured to false', () => {
    expect(buildCreatePayload(makeState()).is_featured).toBe(false);
  });

  it('maps translations array from locale-keyed record', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0]).toMatchObject({
      locale: 'en',
      name:   'Test Product',
      slug:   'test-product',
    });
  });

  it('maps canonical options with name, position, values[]', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0]).toEqual({
      name:     'Color',
      position: 1,
      values:   ['Red', 'Blue'],
    });
  });

  it('maps variants with semantic options map', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants).toHaveLength(2);
    expect(payload.variants[0].options).toEqual({ Color: 'Red' });
    expect(payload.variants[1].options).toEqual({ Color: 'Blue' });
  });

  it('omits id for negative (unsaved) variants', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants[0]).not.toHaveProperty('id');
    expect(payload.variants[1]).not.toHaveProperty('id');
  });

  it('includes id for positive (existing) variants', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id: 999,
    });
    expect(buildCreatePayload(state).variants[0]).toHaveProperty('id', 999);
  });

  it('injects a default variant when no variants defined', () => {
    const state = makeState();
    state.structure.variants = [];
    state.structure.options  = [];
    const payload = buildCreatePayload(state);
    expect(payload.variants).toHaveLength(1);
    expect(payload.variants[0]).toMatchObject({
      sku:       null,
      price:     0,
      quantity:  0,
      is_active: true,
      options:   {},
    });
  });

  it('filters translations with empty name and slug', () => {
    const state = makeState();
    state.content.translations['ar'] = {
      locale:          'ar',
      name:            '',
      slug:            '',
      description:     null,
      seo_title:       null,
      seo_description: null,
    };
    const payload = buildCreatePayload(state);
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0].locale).toBe('en');
  });

  it('filters options with empty name or no values', () => {
    const state = makeState();
    state.structure.options.push(
      { id: null, name: '',         position: 2, values: [{ id: null, value: 'X' }] },
      { id: null, name: 'Material', position: 3, values: [] },
    );
    const payload = buildCreatePayload(state);
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters empty option_name/option_value from variant map', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:      -1,
      options: [
        { option_name: 'Color', option_value: 'Red' },
        { option_name: '',      option_value: 'X'   },
        { option_name: 'Size',  option_value: ''    },
      ],
    });
    expect(buildCreatePayload(state).variants[0].options).toEqual({ Color: 'Red' });
  });

  it('passes manufacture and expiry dates through', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:               100,
      manufacture_date: '2026-01-01',
      expiry_date:      '2027-01-01',
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].manufacture_date).toBe('2026-01-01');
    expect(payload.variants[0].expiry_date).toBe('2027-01-01');
  });
});
EOF

echo "   ✓ buildCreatePayload.test.ts updated"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "============================================="
echo " ✅ Category / Brand / isFeatured complete"
echo "============================================="
echo ""
echo " New files:"
echo "   src/types/category.ts"
echo "   src/types/brand.ts"
echo "   src/lib/api/categories.ts"
echo "   src/lib/api/brands.ts"
echo "   src/hooks/categories/useCategories.ts"
echo "   src/hooks/brands/useBrands.ts"
echo "   src/components/shared/create-product/CategorySelect.tsx"
echo "   src/components/shared/create-product/BrandSelect.tsx"
echo ""
echo " Updated files:"
echo "   src/config/routes.ts            (categories + brands routes)"
echo "   src/lib/queryKeys.ts            (categories + brands keys)"
echo "   src/schemas/products.ts         (categoryId, brandId, isFeatured)"
echo "   src/lib/products/buildCreatePayload.ts"
echo "   src/components/shared/create-product/CreateProductContentStep.tsx"
echo "   src/components/shared/create-product/CreateProductWizard.tsx"
echo "   src/components/shared/create-product/CreateProductReviewStep.tsx"
echo "   src/types/product.ts            (ProductCreatePayload)"
echo "   src/lib/products/__tests__/buildCreatePayload.test.ts"
echo ""
echo " Run:"
echo "   npx tsc --noEmit"
echo ""