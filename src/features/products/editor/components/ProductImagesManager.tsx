// src/app/[locale]/(dashboard)/stores/[storeId]/products/[productId]/_components/ProductImagesManager.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductImage } from '@/types/product';

interface Props {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}

/**
 * Generates a safe client-only negative ID for a new unsaved image.
 * Follows the same negative-ID convention used for variants.
 * These IDs are never sent to the backend — payload builders must
 * strip or omit them before submission.
 */
function getNextNegativeImageId(images: ProductImage[]): number {
  const min = images.reduce((acc, img) => Math.min(acc, img.id), 0);
  return min <= 0 ? min - 1 : -1;
}

export function ProductImagesManager({ images, onChange }: Props) {
  console.log('the images',{images})
  const t = useTranslations('products');
  const [urlDraft, setUrlDraft] = useState('');

  // ── Add ───────────────────────────────────────────────────────────────────

  const handleAdd = () => {
    const url = urlDraft.trim();
    if (!url) return;

    const newImage: ProductImage = {
      id:       getNextNegativeImageId(images),
      url,
      alt:      null,
      position: images.length,
    };

    onChange([...images, newImage]);
    setUrlDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────

  const handleRemove = (id: number) => {
    onChange(
      images
        .filter((img) => img.id !== id)
        .map((img, idx) => ({ ...img, position: idx }))
    );
  };

  // ── Reorder ───────────────────────────────────────────────────────────────

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, idx) => ({ ...img, position: idx })));
  };

  // ── Alt text ──────────────────────────────────────────────────────────────

  const handleAltChange = (id: number, alt: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, alt } : img)));
  };

  
  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('editor.media.imagesTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('editor.media.imagesHint')}</p>
      </div>

      {/* URL input */}
      <div className="space-y-2">
        <Label>{t('editor.media.imageUrl')}</Label>
        <div className="flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={handleKeyDown}
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
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={img.id} className="rounded-md border p-3 space-y-3">
              <div className="flex items-start gap-3">

                {/* Preview */}
                <img
                  src={img.url}
                  alt={img.alt ?? ''}
                  className="h-16 w-16 rounded object-cover border shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* Alt text */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="space-y-1">
                    <Label>{t('editor.media.altText')}</Label>
                    <Input
                      value={img.alt ?? ''}
                      onChange={(e) => handleAltChange(img.id, e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{img.url}</p>
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

    </div>
  );
}