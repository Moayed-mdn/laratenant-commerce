#!/usr/bin/env bash

# =============================================================================
# Fix 8 TypeScript errors across 5 files
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Fixing 8 TypeScript errors"
echo "============================================="

# =============================================================================
# Fix 1 & 2 — CategorySelect + BrandSelect
# onValueChange receives string | null — handler must accept that type
# =============================================================================

echo ""
echo "→ Fix 1: CategorySelect.tsx (onValueChange: string | null)"

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

  // onValueChange can receive string | null from the Select component
  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_CATEGORY) {
      onChange(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    onChange(Number.isFinite(parsed) ? parsed : null);
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

echo "   ✓ CategorySelect.tsx fixed"

echo ""
echo "→ Fix 2: BrandSelect.tsx (onValueChange: string | null)"

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

  // onValueChange can receive string | null from the Select component
  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_BRAND) {
      onChange(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    onChange(Number.isFinite(parsed) ? parsed : null);
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

echo "   ✓ BrandSelect.tsx fixed"

# =============================================================================
# Fix 3 & 4 — queryKeys.ts
# Restore queryKeys.auth.me() that useLogin and useMe depend on.
# My previous rewrite removed it — add it back alongside queryKeys.me().
# =============================================================================

echo ""
echo "→ Fix 3 & 4: lib/queryKeys.ts (restore queryKeys.auth.me())"

cat > "$SRC/lib/queryKeys.ts" << 'EOF'
/**
 * Centralized TanStack Query key factory.
 * All query keys must be defined here — never inline.
 */

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────
  // Top-level alias kept for backward compatibility with useMe / useLogin.
  me: () => ['me'] as const,

  auth: {
    me: () => ['me'] as const,
  },

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

echo "   ✓ queryKeys.ts fixed (auth.me restored)"

# =============================================================================
# Fix 5-8 — types/product.ts
# Python patch duplicated category_id and brand_id in ProductCreatePayload.
# Rewrite ProductCreatePayload cleanly — single definition, no duplicates.
# =============================================================================

echo ""
echo "→ Fix 5-8: types/product.ts (deduplicate ProductCreatePayload fields)"

python3 - << 'PYEOF'
import re, os

src = os.environ.get('SRC', 'src')
path = os.path.join(src, 'types', 'product.ts')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the ProductCreatePayload interface and replace it wholesale.
# Pattern: from the interface declaration to the closing brace.
pattern = r'(export interface ProductCreatePayload \{)[^}]*(\})'

clean_payload = '''export interface ProductCreatePayload {
  status:       ProductStatus;
  category_id?: number | null;
  brand_id?:    number | null;
  is_featured?: boolean;
  translations: Array<{
    locale:          string;
    name:            string;
    slug:            string;
    description?:    string | null;
    seo_title?:      string | null;
    seo_description?: string | null;
  }>;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants: Array<{
    id?:              number;
    sku:              string | null;
    barcode?:         string | null;
    price:            number;
    compare_at_price?: number | null;
    cost_price?:      number | null;
    quantity:         number;
    low_stock_threshold?: number | null;
    track_inventory?: boolean | null;
    is_active:        boolean;
    weight?:          number | null;
    weight_unit?:     string | null;
    manufacture_date?: string | null;
    expiry_date?:     string | null;
    batch_number?:    string | null;
    options?:         Record<string, string>;
  }>;
  images?: Array<{
    url:      string;
    alt?:     string | null;
    position?: number;
  }>;
  tags?: string[];
}'''

new_content, count = re.subn(pattern, clean_payload, content, flags=re.DOTALL)

if count == 1:
    print(f'  ✓ ProductCreatePayload replaced cleanly (1 match)')
elif count == 0:
    print('  ⚠ ProductCreatePayload pattern not found — check types/product.ts manually')
else:
    print(f'  ⚠ {count} matches replaced — check types/product.ts for duplicates')

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
PYEOF

echo "   ✓ types/product.ts fixed (ProductCreatePayload deduplicated)"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "============================================="
echo " ✅ All 8 errors fixed"
echo "============================================="
echo ""
echo " Summary:"
echo "   CategorySelect.tsx  — onValueChange accepts string | null"
echo "   BrandSelect.tsx     — onValueChange accepts string | null"
echo "   queryKeys.ts        — auth.me() restored"
echo "   types/product.ts    — ProductCreatePayload deduplicated"
echo ""
echo " Run:"
echo "   npx tsc --noEmit"
echo ""