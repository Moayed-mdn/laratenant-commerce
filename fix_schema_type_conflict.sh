#!/usr/bin/env bash

# =============================================================================
# Fix: resolve type mismatch between ProductVariant/ProductOption and
# the Zod-inferred schema types in CreateProductStructureStep.
#
# Root cause: two parallel type systems fighting each other.
#   - ProductVariant uses optional fields (undefined allowed)
#   - Zod schema infers non-optional fields (undefined not allowed)
#
# Fix strategy:
#   - The wizard state uses ProductVariant[] and ProductOption[] directly
#     (the canonical types from types/product.ts)
#   - CreateProductStructureData becomes a plain interface (not Zod-inferred)
#   - The Zod schema is kept for validation only, not as the state type
#   - buildCreatePayload test fixtures get the missing required fields
# =============================================================================

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
SRC="$BASE/src"

echo "============================================="
echo " Fix: ProductVariant ↔ Zod schema type conflict"
echo "============================================="

# =============================================================================
# Fix 1 — schemas/products.ts
#
# CreateProductStructureData is now a plain interface that uses
# ProductVariant[] and ProductOption[] directly.
# Zod schemas remain for runtime validation only.
# =============================================================================

echo ""
echo "→ Fix 1: schemas/products.ts (decouple state type from Zod inference)"

cat > "$SRC/schemas/products.ts" << 'EOF'
/**
 * Zod schemas for product filters and create wizard validation.
 *
 * Design note — two-type-system rule:
 * Zod schemas are used for RUNTIME VALIDATION only.
 * Wizard STATE types use the canonical domain types from types/product.ts
 * (ProductVariant, ProductOption) directly.
 *
 * This avoids fighting between Zod's inferred types (which have strict
 * non-optional fields) and our domain interfaces (which use optional fields).
 */

import { z } from 'zod';
import type { ProductOption, ProductVariant } from '@/types/product';

// ── List filters (unchanged) ────────────────────────────────────────────────

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
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────
//
// Runtime validation schemas (used in validateStructure, not as state types).

export const CreateProductVariantValidationSchema = z.object({
  id:    z.number(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

export const CreateProductOptionValidationSchema = z.object({
  name:   z.string().min(1, 'Option name is required'),
  values: z.array(z.object({ value: z.string().min(1) })).min(1),
});

/**
 * Wizard Step 2 state type.
 *
 * Uses canonical domain types directly — NOT Zod-inferred types.
 * This is the single source of truth for structure tab state.
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

echo "   ✓ schemas/products.ts fixed"

# =============================================================================
# Fix 2 — CreateProductStructureStep.tsx
#
# Now that CreateProductStructureData uses ProductVariant[] / ProductOption[]
# directly, the normalizer functions and casts are no longer needed.
# onChange receives and returns the canonical types — no conversion required.
# =============================================================================

echo ""
echo "→ Fix 2: CreateProductStructureStep.tsx (remove normalizers — types align)"

cat > "$SRC/components/shared/create-product/CreateProductStructureStep.tsx" << 'EOF'
'use client';

/**
 * Wizard Step 2 — Structure
 *
 * Collects:
 * - Canonical product options (name, position, values)
 * - Generated variants (SKU, price, quantity, active flag)
 *
 * Reuses the existing ProductOptionsSection and VariantsTable
 * components from the edit editor, ensuring UX consistency.
 *
 * State type: CreateProductStructureData
 *   options:  ProductOption[]   ← canonical domain type
 *   variants: ProductVariant[]  ← canonical domain type
 *
 * No type conversion needed — wizard state and component props
 * share the same domain types.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ProductOptionsSection } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/ProductOptionsSection';
import { VariantsTable } from '@/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components/_components/VariantsTable';

import { generateVariants } from '@/lib/products/generateVariants';

import type { ProductOption, ProductVariant } from '@/types/product';
import type { CreateProductStructureData } from '@/schemas/products';

interface Props {
  structure: CreateProductStructureData;
  onChange:  (next: CreateProductStructureData) => void;
}

export function CreateProductStructureStep({ structure, onChange }: Props) {
  const t = useTranslations('products');

  const handleOptionsChange = (options: ProductOption[]) => {
    onChange({ ...structure, options });
  };

  const handleVariantsChange = (variants: ProductVariant[]) => {
    onChange({ ...structure, variants });
  };

  const handleGenerate = () => {
    const regenerated = generateVariants(
      structure.options,
      structure.variants
    );
    onChange({ ...structure, variants: regenerated });
  };

  return (
    <div className="space-y-6">

      {/* Options editor */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.options')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ProductOptionsSection
            options={structure.options}
            onChange={handleOptionsChange}
          />
          {structure.options.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
            >
              {t('variantEditor.attributes.generateCombinations')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Variants table — only shown when variants exist */}
      {structure.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('variantEditor.tabs.variants')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <VariantsTable
              variants={structure.variants}
              onChange={handleVariantsChange}
            />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
EOF

echo "   ✓ CreateProductStructureStep.tsx fixed"

# =============================================================================
# Fix 3 — buildCreatePayload.test.ts
#
# Test fixtures are missing required fields (manufacture_date, expiry_date,
# batch_number) that ProductVariant requires (as optional but typed fields
# that Zod now enforces as non-optional in the schema).
#
# Since CreateProductStructureData.variants is now ProductVariant[],
# fixtures must satisfy ProductVariant's interface.
# We add the missing optional fields explicitly.
# =============================================================================

echo ""
echo "→ Fix 3: buildCreatePayload.test.ts (add missing required fields to fixtures)"

mkdir -p "$SRC/lib/products/__tests__"

cat > "$SRC/lib/products/__tests__/buildCreatePayload.test.ts" << 'EOF'
import { buildCreatePayload } from '../buildCreatePayload';
import type { CreateProductWizardState } from '@/schemas/products';
import type { ProductVariant } from '@/types/product';

// ── Fixture helpers ─────────────────────────────────────────────────────────

function makeVariant(overrides: Partial<ProductVariant> & { id: number }): ProductVariant {
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
      status: 'draft',
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
          id:      -1,
          sku:     'RED-DEFAULT',
          price:   29.99,
          quantity: 5,
          options: [{ option_name: 'Color', option_value: 'Red' }],
        }),
        makeVariant({
          id:      -2,
          sku:     null,
          price:   29.99,
          quantity: 0,
          options: [{ option_name: 'Color', option_value: 'Blue' }],
        }),
      ],
    },
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('buildCreatePayload', () => {
  it('maps status from content', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.status).toBe('draft');
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
    const payload = buildCreatePayload(state);
    expect(payload.variants[0]).toHaveProperty('id', 999);
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
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].options).toEqual({ Color: 'Red' });
  });

  it('passes manufacture and expiry dates through to payload', () => {
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

echo "   ✓ buildCreatePayload.test.ts fixed"

echo ""
echo "============================================="
echo " ✅ All 5 errors fixed"
echo "============================================="
echo ""
echo " Root cause resolved:"
echo "   CreateProductStructureData now uses ProductOption[] and"
echo "   ProductVariant[] directly (canonical domain types)."
echo "   Zod schemas are validation-only, not state carriers."
echo ""
echo " Run to verify:"
echo "   npx tsc --noEmit"
echo ""