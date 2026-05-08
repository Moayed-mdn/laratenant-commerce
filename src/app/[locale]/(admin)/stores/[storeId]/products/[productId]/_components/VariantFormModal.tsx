'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductVariantInput } from '@/types/product';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ProductVariantInput | null;
  onSave: (value: ProductVariantInput) => void;
}

export function VariantFormModal({ open, onOpenChange, value, onSave }: Props) {
  const t = useTranslations('products');
  const [draft, setDraft] = useState<ProductVariantInput | null>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!value || !draft) return null;

  const set = <K extends keyof ProductVariantInput>(key: K, next: ProductVariantInput[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: next } : prev));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('variantEditor.variants.editVariant')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('variantEditor.variants.label')}</Label>
            <Input value={draft?.label ?? ''} onChange={(e) => set('label', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('variantEditor.variants.sku')}</Label>
            <Input value={draft?.sku ?? ''} onChange={(e) => set('sku', e.target.value || null)} />
          </div>
          <div className="space-y-1">
            <Label>{t('variantEditor.variants.price')}</Label>
            <Input
              type="number"
              min="0"
              value={draft?.price ?? 0}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('variantEditor.variants.quantity')}</Label>
            <Input
              type="number"
              min="0"
              value={draft?.quantity ?? 0}
              onChange={(e) => set('quantity', Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={() => draft && onSave(draft)}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
