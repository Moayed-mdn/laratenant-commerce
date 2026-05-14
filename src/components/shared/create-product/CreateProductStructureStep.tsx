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
