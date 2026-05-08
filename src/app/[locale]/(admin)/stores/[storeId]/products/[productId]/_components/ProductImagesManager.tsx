'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductImage } from '@/types/product';

interface Props {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
}

export function ProductImagesManager({ images, onChange }: Props) {
  const t = useTranslations('products');

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, idx) => ({ ...img, position: idx })));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('editor.media.imagesTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('editor.media.imagesHint')}</p>
      </div>

      <div className="space-y-3">
        {images.map((img, idx) => (
          <div key={img.id} className="rounded-md border p-3 space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={img.url}
                alt={img.alt ?? ''}
                className="h-16 w-16 rounded object-cover border"
              />
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label>{t('editor.media.altText')}</Label>
                  <Input
                    value={img.alt ?? ''}
                    onChange={(e) =>
                      onChange(images.map((x) => (x.id === img.id ? { ...x, alt: e.target.value } : x)))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => move(idx, idx - 1)}>
                {t('editor.media.moveUp')}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => move(idx, idx + 1)}>
                {t('editor.media.moveDown')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
