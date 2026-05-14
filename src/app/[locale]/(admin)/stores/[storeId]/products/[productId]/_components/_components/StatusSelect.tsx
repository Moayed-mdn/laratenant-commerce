'use client';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { ProductStatus } from '@/types/product';

interface Props {
  value: ProductStatus;
  onChange: (next: ProductStatus) => void;
}

export function StatusSelect({ value, onChange }: Props) {
  const t = useTranslations('products');
  const dashboardT = useTranslations('dashboard');

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.status')}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductStatus)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">{dashboardT('productStatus.active')}</SelectItem>
          <SelectItem value="draft">{dashboardT('productStatus.draft')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
