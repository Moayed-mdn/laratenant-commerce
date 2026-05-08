'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { ProductVariantInput } from '@/types/product';

interface Props {
  variant: ProductVariantInput;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function VariantCard({ variant, onEdit, onDuplicate, onDelete }: Props) {
  const t = useTranslations('products');
  return (
    <div className="rounded-md border p-3 space-y-2">
      <p className="font-medium">{variant.label}</p>
      <p className="text-sm text-muted-foreground">
        {t('variantEditor.variants.sku')}: {variant.sku || '—'}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('variantEditor.variants.quantity')}: {variant.quantity}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>{t('edit')}</Button>
        <Button size="sm" variant="outline" onClick={onDuplicate}>{t('variantEditor.shared.duplicate')}</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>{t('delete')}</Button>
      </div>
    </div>
  );
}
