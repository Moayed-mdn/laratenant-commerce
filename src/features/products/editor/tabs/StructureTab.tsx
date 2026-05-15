'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ProductOption, ProductVariant } from '@/types/product';
import { OptionsEditor } from '@/features/products/editor/components/OptionsEditor';
import { VariantsTable } from '@/features/products/editor/components/VariantsTable';

interface Props {
  options: ProductOption[];
  variants: ProductVariant[];
  onOptionsChange: (options: ProductOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
  onGenerateCombinations: () => void;
}

export function StructureTab({
  options,
  variants,
  onOptionsChange,
  onVariantsChange,
  onGenerateCombinations,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.options')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <OptionsEditor options={options} onChange={onOptionsChange} />
          <Button type="button" variant="outline" onClick={onGenerateCombinations}>
            {t('variantEditor.attributes.generateCombinations')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('variantEditor.tabs.variants')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <VariantsTable variants={variants} onChange={onVariantsChange} />
        </CardContent>
      </Card>
    </div>
  );
}
