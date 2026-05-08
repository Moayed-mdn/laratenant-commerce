'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProductOption, ProductVariantInput } from '@/types/product';
import { ProductOptionsSection } from './ProductOptionsSection';
import { ProductVariantsTable } from './ProductVariantsTable';
import { generateVariantCombinations } from './VariantCombinationGenerator';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ProductStructureBasicsForm, type ProductStructureBasicsValue } from './ProductStructureBasicsForm';

export interface ProductStructureState {
  basics: ProductStructureBasicsValue;
  variants: ProductVariantInput[];
  options: ProductOption[];
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
        <CardHeader>
          <CardTitle>{t('editor.tabs.options')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ProductOptionsSection
            options={value.options}
            onChange={(options) => {
              onChange({
                ...value,
                options,
                variants: generateVariantCombinations(options, value.variants),
              });
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onChange({
                ...value,
                variants: generateVariantCombinations(value.options, value.variants),
              })
            }
          >
            {t('variantEditor.attributes.generateCombinations')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('variantEditor.tabs.variants')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ProductVariantsTable
            variants={value.variants}
            onChange={(variants) => onChange({ ...value, variants })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
