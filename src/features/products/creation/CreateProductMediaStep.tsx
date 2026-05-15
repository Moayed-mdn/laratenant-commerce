'use client';

/**
 * Wizard Step 3 — Media
 *
 * Bridges CreateProductMediaData (key: 'media') to MediaTab (prop: images).
 * Reuses the edit flow's MediaTab for UX consistency.
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaTab } from '@/features/products/editor/tabs/MediaTab';
import type { ProductImage }           from '@/types/product';
import type { CreateProductMediaData } from '@/schemas/products';

interface Props {
  media:    CreateProductMediaData;
  onChange: (next: CreateProductMediaData) => void;
}

export function CreateProductMediaStep({ media, onChange }: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.tabs.media')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <MediaTab
            images={media.media}
            onChange={(next: ProductImage[]) => onChange({ media: next })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
