'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
import { ProductContentTab } from '../ProductContentTab';
import { StatusSelect } from '../_components/StatusSelect';

interface Props {
  availableLocales: Locale[];
  status: ProductStatus;
  translations: Record<Locale, ProductTranslation>;
  onStatusChange: (next: ProductStatus) => void;
  onTranslationsChange: (next: Record<Locale, ProductTranslation>) => void;
}

export function ContentTab({ availableLocales, status, translations, onStatusChange, onTranslationsChange }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <StatusSelect value={status} onChange={onStatusChange} />
        </CardContent>
      </Card>

      <ProductContentTab
        availableLocales={availableLocales}
        translations={translations}
        onChange={onTranslationsChange}
      />
    </div>
  );
}
