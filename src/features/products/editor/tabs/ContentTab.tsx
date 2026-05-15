'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label }             from '@/components/ui/label';
import { Switch }            from '@/components/ui/switch';

import type { Locale, ProductStatus, ProductTranslation } from '@/types/product';
import type { ProductContentFormValues }                  from '@/features/products/editor/types/product-editor';

import { ProductContentTab } from '@/features/products/editor/components/ProductContentTab';
import { StatusSelect }      from '@/features/products/editor/components/StatusSelect';
import { CategorySelect }    from '@/features/products/creation/CategorySelect';
import { BrandSelect }       from '@/features/products/creation/BrandSelect';
import { TagSelect }         from '@/features/products/creation/TagSelect';

interface Props {
  storeId:         string;
  availableLocales: Locale[];
  content:         ProductContentFormValues;
  tags:            number[];
  onContentChange: (next: ProductContentFormValues) => void;
  onTagsChange:    (next: number[]) => void;
}

export function ContentTab({
  storeId,
  availableLocales,
  content,
  tags,
  onContentChange,
  onTagsChange,
}: Props) {
  const t = useTranslations('products');

  return (
    <div className="space-y-6">

      {/* ── Status + Category + Brand + Tags + isFeatured ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">

          <StatusSelect
            value={content.status}
            onChange={(status: ProductStatus) =>
              onContentChange({ ...content, status })
            }
          />

          <CategorySelect
            storeId={storeId}
            value={content.categoryId}
            onChange={({ id }) =>
              onContentChange({ ...content, categoryId: id })
            }
          />

          <BrandSelect
            storeId={storeId}
            value={content.brandId}
            onChange={({ id }) =>
              onContentChange({ ...content, brandId: id })
            }
          />

          <TagSelect
            storeId={storeId}
            value={tags}
            onChange={onTagsChange}
          />

          <div className="flex items-start gap-3">
            <Switch
              id="edit-is-featured"
              checked={content.isFeatured}
              onCheckedChange={(checked) =>
                onContentChange({ ...content, isFeatured: checked })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="edit-is-featured" className="cursor-pointer">
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
        translations={content.translations}
        onChange={(translations) =>
          onContentChange({ ...content, translations })
        }
      />

    </div>
  );
}
