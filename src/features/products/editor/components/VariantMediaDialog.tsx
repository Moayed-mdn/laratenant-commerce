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
