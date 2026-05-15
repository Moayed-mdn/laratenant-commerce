'use client';

import { useState }        from 'react';
import { useTranslations } from 'next-intl';
import { ImageIcon }       from 'lucide-react';

import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Switch }   from '@/components/ui/switch';
import { Badge }    from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import { VariantMediaDialog } from '@/features/products/editor/components/VariantMediaDialog';
import { getVariantLabel }    from '@/features/products/editor/utils/getVariantLabel';

import type { ProductImage, ProductVariant } from '@/types/product';

interface Props {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}

function parseNumericInput(value: string): number {
  const normalized = value.trim();
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function VariantsTable({ variants, onChange }: Props) {
  const t = useTranslations('products');
  const [numericDrafts, setNumericDrafts] = useState<Record<string, string>>({});

  const patch = (id: ProductVariant['id'], next: Partial<ProductVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...next } : v)));

  const patchMedia = (id: ProductVariant['id'], media: ProductImage[]) =>
    patch(id, { media });

  const updateDraft = (key: string, value: string) =>
    setNumericDrafts((prev) => ({ ...prev, [key]: value }));

  const clearDraft = (key: string) =>
    setNumericDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleNumericChange = (
    id:       ProductVariant['id'],
    field:    'price' | 'quantity',
    rawValue: string
  ) => {
    const draftKey = `${id}:${field}`;
    updateDraft(draftKey, rawValue);
    if (rawValue.trim() === '') return;
    const parsed = Number(rawValue.trim());
    if (!Number.isFinite(parsed)) return;
    patch(id, { [field]: parsed } as Pick<ProductVariant, 'price' | 'quantity'>);
  };

  const handleNumericBlur = (
    id:    ProductVariant['id'],
    field: 'price' | 'quantity'
  ) => {
    const draftKey   = `${id}:${field}`;
    const draftValue = numericDrafts[draftKey];
    if (draftValue === undefined) return;
    patch(id, { [field]: parseNumericInput(draftValue) } as Pick<ProductVariant, 'price' | 'quantity'>);
    clearDraft(draftKey);
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('variantEditor.variants.variant')}</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>{t('variantEditor.variants.price')}</TableHead>
            <TableHead>{t('variantEditor.variants.quantity')}</TableHead>
            <TableHead>{t('variantEditor.media.column')}</TableHead>
            <TableHead className="text-right">
              {t('variantEditor.variants.active')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            const label      = getVariantLabel(variant.options);
            const mediaCount = (variant.media ?? []).length;

            return (
              <TableRow key={variant.id}>

                {/* Variant label */}
                <TableCell className="min-w-32 text-sm font-medium">
                  {label}
                </TableCell>

                {/* SKU */}
                <TableCell className="min-w-40">
                  <Input
                    value={variant.sku ?? ''}
                    onChange={(e) => patch(variant.id, { sku: e.target.value })}
                  />
                </TableCell>

                {/* Price */}
                <TableCell className="min-w-28">
                  <Input
                    inputMode="decimal"
                    value={
                      numericDrafts[`${variant.id}:price`] ??
                      String(variant.price ?? 0)
                    }
                    onChange={(e) =>
                      handleNumericChange(variant.id, 'price', e.target.value)
                    }
                    onBlur={() => handleNumericBlur(variant.id, 'price')}
                  />
                </TableCell>

                {/* Quantity */}
                <TableCell className="min-w-28">
                  <Input
                    inputMode="numeric"
                    value={
                      numericDrafts[`${variant.id}:quantity`] ??
                      String(variant.quantity ?? 0)
                    }
                    onChange={(e) =>
                      handleNumericChange(variant.id, 'quantity', e.target.value)
                    }
                    onBlur={() => handleNumericBlur(variant.id, 'quantity')}
                  />
                </TableCell>

                {/* Variant media */}
                <TableCell className="min-w-28">
                  <VariantMediaDialog
                    variantLabel={label}
                    images={variant.media ?? []}
                    onChange={(media) => patchMedia(variant.id, media)}
                    trigger={
                      /*
                       * Base UI render prop receives this element and merges
                       * its own event handlers onto it. Must be a single
                       * React element — not a fragment or string.
                       */
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {mediaCount > 0 ? (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-xs"
                          >
                            {mediaCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {t('variantEditor.media.add')}
                          </span>
                        )}
                      </Button>
                    }
                  />
                </TableCell>

                {/* Active toggle */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Switch
                      checked={variant.is_active}
                      onCheckedChange={(checked) =>
                        patch(variant.id, { is_active: checked })
                      }
                    />
                  </div>
                </TableCell>

              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
