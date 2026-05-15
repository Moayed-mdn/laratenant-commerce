#!/usr/bin/env bash
# =============================================================================
# fix-dialog-triggers.sh
# Base UI DialogTrigger uses render prop, NOT asChild.
# Fixes VariantMediaDialog and DeleteProductButton.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/src"
EDIT_COMP="$SRC/app/[locale]/(admin)/stores/[storeId]/products/[productId]/_components"

echo "==> Fixing Base UI DialogTrigger usage..."

# =============================================================================
# 1. VariantMediaDialog
#    Problem: <DialogTrigger asChild>{trigger}</DialogTrigger>
#    Fix:     <DialogTrigger render={trigger} />
#
#    Base UI DialogTrigger.render receives the trigger element and merges
#    its event handlers onto that element — equivalent to Radix asChild.
#    The trigger prop (ReactNode) must be a single element, not a string.
#
#    IMPORTANT: The nested <button> error occurs because:
#    - DialogTrigger renders its own <button>
#    - asChild (unsupported) passes props down BUT also keeps outer button
#    - render prop REPLACES the outer button entirely — no nesting
# =============================================================================
cat > "$EDIT_COMP/VariantMediaDialog.tsx" << 'TYPESCRIPT'
'use client';

/**
 * VariantMediaDialog
 *
 * Reusable dialog for managing variant-specific images.
 * Used in VariantsTable (edit flow) and CreateProductStructureStep (create wizard).
 *
 * Base UI Dialog pattern:
 *   <DialogTrigger render={<YourButton />} />
 *
 * This replaces the trigger element entirely — no nested <button> issue.
 * Event handlers are merged onto the rendered element by Base UI.
 */

import { useState }        from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X }         from 'lucide-react';

import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { ProductImage } from '@/types/product';

interface Props {
  variantLabel: string;
  images:       ProductImage[];
  onChange:     (next: ProductImage[]) => void;
  /** A single React element rendered as the dialog trigger button. */
  trigger:      React.ReactElement;
}

function nextNegativeId(images: ProductImage[]): number {
  const min = images.reduce((acc, img) => Math.min(acc, img.id), 0);
  return min <= 0 ? min - 1 : -1;
}

export function VariantMediaDialog({
  variantLabel,
  images,
  onChange,
  trigger,
}: Props) {
  const t = useTranslations('products');
  const [urlDraft, setUrlDraft] = useState('');

  // ── Add ──────────────────────────────────────────────────────

  const handleAdd = () => {
    const url = urlDraft.trim();
    if (!url) return;
    onChange([
      ...images,
      {
        id:       nextNegativeId(images),
        url,
        alt:      null,
        position: images.length,
      },
    ]);
    setUrlDraft('');
  };

  // ── Remove ────────────────────────────────────────────────────

  const handleRemove = (id: number) =>
    onChange(
      images
        .filter((img) => img.id !== id)
        .map((img, idx) => ({ ...img, position: idx }))
    );

  // ── Alt text ──────────────────────────────────────────────────

  const handleAlt = (id: number, alt: string) =>
    onChange(images.map((img) => (img.id === id ? { ...img, alt } : img)));

  // ── Reorder ───────────────────────────────────────────────────

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, idx) => ({ ...img, position: idx })));
  };

  return (
    <Dialog>
      {/*
       * Base UI pattern: render prop REPLACES the trigger element.
       * Event handlers are merged by Base UI — no nested <button>.
       * trigger must be a React element (not a string/fragment).
       */}
      <DialogTrigger render={trigger} />

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('variantEditor.media.dialogTitle', { variant: variantLabel })}
          </DialogTitle>
        </DialogHeader>

        {/* URL input */}
        <div className="space-y-2">
          <Label>{t('editor.media.imageUrl')}</Label>
          <div className="flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
              }}
              placeholder={t('editor.media.imageUrlPlaceholder')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={!urlDraft.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('editor.media.addImage')}
            </Button>
          </div>
        </div>

        {/* Image list */}
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('variantEditor.media.noImages')}
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {images.map((img, idx) => (
              <div key={img.id} className="rounded-md border p-3 space-y-3">
                <div className="flex items-start gap-3">

                  {/* Preview */}
                  <img
                    src={img.url}
                    alt={img.alt ?? ''}
                    className="h-14 w-14 rounded object-cover border shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Alt + URL */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <Label className="text-xs">{t('editor.media.altText')}</Label>
                    <Input
                      value={img.alt ?? ''}
                      onChange={(e) => handleAlt(img.id, e.target.value)}
                      className="h-7 text-sm"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {img.url}
                    </p>
                  </div>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(img.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">{t('editor.media.removeImage')}</span>
                  </Button>

                </div>

                {/* Reorder */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                  >
                    {t('editor.media.moveUp')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1}
                  >
                    {t('editor.media.moveDown')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
TYPESCRIPT
echo "  ✓ VariantMediaDialog.tsx"

# =============================================================================
# 2. VariantsTable
#    trigger prop type: ReactNode → ReactElement (required by render prop)
#    Pass trigger as React element directly — no wrapper needed.
# =============================================================================
cat > "$EDIT_COMP/_components/VariantsTable.tsx" << 'TYPESCRIPT'
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

import { VariantMediaDialog } from '../VariantMediaDialog';
import { getVariantLabel }    from '@/lib/products/getVariantLabel';

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
TYPESCRIPT
echo "  ✓ VariantsTable.tsx"

# =============================================================================
# 3. DeleteProductButton
#    Replace <DialogTrigger asChild><Button /></DialogTrigger>
#    with    <DialogTrigger render={<Button />} />
# =============================================================================
cat > "$EDIT_COMP/DeleteProductButton.tsx" << 'TYPESCRIPT'
'use client';

import { useState }        from 'react';
import { useRouter }       from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { toast }           from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useDeleteProduct } from '@/hooks/products/useDeleteProduct';
import { useCan }           from '@/stores/authStore';
import { ROUTES }           from '@/config/routes';

interface Props {
  storeId:     string;
  productId:   string;
  productName: string;
}

export default function DeleteProductButton({
  storeId,
  productId,
  productName,
}: Props) {
  const t      = useTranslations('products');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const canManageProducts = useCan('canManageProducts');

  const mutation = useDeleteProduct(storeId, productId, {
    onSuccess: () => {
      toast.success(t('form.deleteSuccess'));
      setOpen(false);
      router.push(ROUTES.store(storeId).products.list());
    },
    onError: () => {
      toast.error(t('form.deleteError'));
    },
  });

  if (!canManageProducts) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/*
       * Base UI DialogTrigger does not support asChild.
       * Use render prop to replace the trigger element entirely.
       * Base UI merges its click/keyboard handlers onto the rendered element.
       */}
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            {t('form.delete')}
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('form.delete')}</DialogTitle>
          <DialogDescription>{t('form.deleteConfirm')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('loading') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
TYPESCRIPT
echo "  ✓ DeleteProductButton.tsx"

echo ""
echo "==> Done. Run: npx tsc --noEmit"