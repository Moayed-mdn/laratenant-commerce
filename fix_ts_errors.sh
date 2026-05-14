#!/usr/bin/env bash

# =============================================================================
# Fix TypeScript errors after frontend product architecture migration
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Fixing TypeScript errors (3 files)"
echo "============================================="

# =============================================================================
# Fix 1 — ProductStatusBadge.tsx
# 'inactive' does not exist in ProductStatus ('active' | 'draft')
# =============================================================================

echo ""
echo "→ Fix 1: ProductStatusBadge.tsx (inactive → draft)"

cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/_components/ProductStatusBadge.tsx" << 'EOF'
'use client';

import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/types/product';

interface Props {
  status: ProductStatus;
}

const variantMap: Record<ProductStatus, 'default' | 'outline' | 'secondary'> = {
  active: 'default',
  draft: 'outline',
};

export function ProductStatusBadge({ status }: Props) {
  return (
    <Badge variant={variantMap[status] ?? 'secondary'}>
      {status}
    </Badge>
  );
}
EOF

echo "   ✓ ProductStatusBadge.tsx fixed"

# =============================================================================
# Fix 2 — CreateProductForm.tsx
# Still sends old flat ProductCreatePayload shape.
# Align with new backend contract: translations + variants required.
# The old flat form (ProductForm) cannot build the new payload,
# so we scaffold a minimal valid payload that satisfies the type
# and leaves a clear TODO for the full create-flow migration.
# =============================================================================

echo ""
echo "→ Fix 2: CreateProductForm.tsx (align payload to new ProductCreatePayload)"

mkdir -p "$SRC/app/[locale]/(admin)/stores/[storeId]/products/new/_components"

cat > "$SRC/app/[locale]/(admin)/stores/[storeId]/products/new/_components/CreateProductForm.tsx" << 'EOF'
'use client';
// Reason: form with RHF + mutations

/**
 * Create product form component.
 *
 * ⚠️  MIGRATION NOTE:
 * The backend now requires the new canonical payload:
 *   { status, translations[], variants[], options[] }
 *
 * The current UI (ProductForm + ProductFormSchema) was built for the
 * old flat payload and cannot yet build the new shape.
 *
 * This file builds a minimal valid payload from the flat form values
 * so the type system is satisfied and the page compiles.
 *
 * TODO: Replace ProductForm with the new multi-locale create wizard
 *       that collects translations[], options[], and variants[] properly.
 *       Tracked as out-of-scope in the migration plan (Part 15).
 */

import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCreateProduct } from '@/hooks/products/useCreateProduct';
import { ROUTES } from '@/config/routes';
import ProductForm from '@/components/shared/ProductForm';
import type { ProductFormData } from '@/schemas/products';
import type { ProductCreatePayload } from '@/types/product';

interface Props {
  storeId: string;
}

export default function CreateProductForm({ storeId }: Props) {
  const t = useTranslations('products');
  const router = useRouter();

  const mutation = useCreateProduct(storeId, {
    onSuccess: (product) => {
      toast.success(t('form.createSuccess'));
      router.push(ROUTES.store(storeId).products.edit(String(product.id)));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    /**
     * Build a minimal new-format payload from the flat form values.
     *
     * - translations: wraps the single name/description in the app
     *   default locale so the backend receives a valid translations[].
     * - variants: wraps the flat price/sku/quantity as one default variant.
     * - options: empty (no variant composition at this stage).
     *
     * This is a stopgap. The full create flow (multi-locale, multi-variant)
     * will replace this once the new CreateProductWizard is built.
     */
    const defaultLocale =
      (typeof window !== 'undefined' &&
        document.documentElement.lang) ||
      'en';

    const payload: ProductCreatePayload = {
      status: data.status,
      translations: [
        {
          locale: defaultLocale,
          name: data.name,
          slug: data.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
          description: data.description ?? null,
          seo_title: null,
          seo_description: null,
        },
      ],
      options: [],
      variants: [
        {
          sku: data.sku ?? null,
          barcode: data.barcode ?? null,
          price: data.price ?? 0,
          compare_at_price: data.compare_at_price ?? null,
          cost_price: data.cost_per_item ?? null,
          quantity: data.quantity ?? 0,
          track_inventory: data.track_quantity ?? true,
          is_active: data.status === 'active',
          weight: data.weight ?? null,
          weight_unit: data.weight_unit ?? null,
          options: {},
        },
      ],
    };

    mutation.mutate(payload);
  };

  return (
    <ProductForm
      mode="create"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      storeId={storeId}
    />
  );
}
EOF

echo "   ✓ CreateProductForm.tsx fixed"

# =============================================================================
# Fix 3 — validateProductStructure.test.ts
# ProductOption now requires 'position: number' — test fixture missing it.
# =============================================================================

echo ""
echo "→ Fix 3: validateProductStructure.test.ts (add position to fixtures)"

mkdir -p "$SRC/lib/products/__tests__"

cat > "$SRC/lib/products/__tests__/validateProductStructure.test.ts" << 'EOF'
import { validateProductStructure } from '../validateProductStructure';
import type { ProductStructureState } from '@/types/product-editor';

describe('validateProductStructure', () => {
  // ── Valid states ─────────────────────────────────────────────────────────

  it('passes for a valid structure with no options', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'SKU-A',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes when all variants have correct option assignments', () => {
    const state: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: 10, value: 'Red' }],
        },
      ],
      variants: [
        {
          id: 1,
          sku: 'SKU-A',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [{ option_name: 'Color', option_value: 'Red' }],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // ── SKU uniqueness ────────────────────────────────────────────────────────

  it('fails for duplicate SKUs', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'DUPE',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
        {
          id: 2,
          sku: 'DUPE',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('sku'))).toBe(true);
  });

  it('treats SKU comparison as case-insensitive', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'sku-abc',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
        {
          id: 2,
          sku: 'SKU-ABC',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
  });

  // ── Price ─────────────────────────────────────────────────────────────────

  it('fails for negative price', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: -1,
          quantity: 0,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('price'))).toBe(true);
  });

  // ── Quantity ──────────────────────────────────────────────────────────────

  it('fails for negative quantity', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: -5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('quantity'))).toBe(true);
  });

  // ── Date consistency ──────────────────────────────────────────────────────

  it('fails when expiry_date is before manufacture_date', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          manufacture_date: '2026-06-01',
          expiry_date: '2026-01-01',
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.field.includes('expiry_date'))
    ).toBe(true);
  });

  it('passes when expiry_date is after manufacture_date', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          manufacture_date: '2026-01-01',
          expiry_date: '2026-12-31',
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });

  // ── Option coverage ───────────────────────────────────────────────────────

  it('fails when a variant is missing an option assignment', () => {
    const state: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: 10, value: 'Red' }],
        },
        {
          id: 2,
          name: 'Size',
          position: 2,
          values: [{ id: 20, value: 'S' }],
        },
      ],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          // Only Color assigned, Size missing
          options: [{ option_name: 'Color', option_value: 'Red' }],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.field.includes('options'))
    ).toBe(true);
    expect(result.errors[0].message).toContain('Size');
  });

  it('ignores option coverage check when no options defined', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('passes for empty variants array', () => {
    const state: ProductStructureState = { options: [], variants: [] };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });
});
EOF

echo "   ✓ validateProductStructure.test.ts fixed"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "============================================="
echo " ✅ All 3 TypeScript errors fixed"
echo "============================================="
echo ""
echo " Fixed files:"
echo "   src/app/[locale]/(admin)/stores/[storeId]/products/_components/ProductStatusBadge.tsx"
echo "   src/app/[locale]/(admin)/stores/[storeId]/products/new/_components/CreateProductForm.tsx"
echo "   src/lib/products/__tests__/validateProductStructure.test.ts"
echo ""
echo " Run to verify:"
echo "   npx tsc --noEmit"
echo ""
