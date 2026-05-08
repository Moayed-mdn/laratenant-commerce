'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ProductAttribute, ProductVariantInput } from '@/types/product';
import { ProductAttributesManager } from './ProductAttributesManager';
import { ProductVariantsTable } from './ProductVariantsTable';
import { generateVariantCombinations } from './VariantCombinationGenerator';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ProductStructureBasicsForm, type ProductStructureBasicsValue } from './ProductStructureBasicsForm';

export interface ProductStructureState {
  basics: ProductStructureBasicsValue;
  variants: ProductVariantInput[];
  attributes: ProductAttribute[];
}

interface Props {
  value: ProductStructureState;
  onChange: (next: ProductStructureState) => void;
}

export function ProductStructureTab({ value, onChange }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <ProductStructureBasicsForm
            value={value.basics}
            onChange={(basics) => onChange({ ...value, basics })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProductAttributesManager
            attributes={value.attributes}
            onChange={(attributes) => {
              onChange({
                ...value,
                attributes,
                variants: generateVariantCombinations(attributes, value.variants),
              });
            }}
          />
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...value,
                  variants: generateVariantCombinations(value.attributes, value.variants),
                })
              }
            >
              {t('variantEditor.attributes.generateCombinations')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProductVariantsTable
            variants={value.variants}
            onChange={(variants) => onChange({ ...value, variants })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
