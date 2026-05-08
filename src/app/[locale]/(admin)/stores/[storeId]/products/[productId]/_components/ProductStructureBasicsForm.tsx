'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProductStatus } from '@/types/product';

export interface ProductStructureBasicsValue {
  status: ProductStatus;
  featured: boolean;
}

interface Props {
  value: ProductStructureBasicsValue;
  onChange: (next: ProductStructureBasicsValue) => void;
}

export function ProductStructureBasicsForm({ value, onChange }: Props) {
  const t = useTranslations('products');
  const dashboardT = useTranslations('dashboard');

  const set = <K extends keyof ProductStructureBasicsValue>(
    key: K,
    next: ProductStructureBasicsValue[K]
  ) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('form.fields.status')}</Label>
          <Select value={value.status} onValueChange={(v) => set('status', v as ProductStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{dashboardT('productStatus.active')}</SelectItem>
              <SelectItem value="draft">{dashboardT('productStatus.draft')}</SelectItem>
              <SelectItem value="inactive">{dashboardT('productStatus.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('variantEditor.general.featured')}</Label>
          <Select value={value.featured ? 'yes' : 'no'} onValueChange={(v) => set('featured', v === 'yes')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('variantEditor.shared.yes')}</SelectItem>
              <SelectItem value="no">{t('variantEditor.shared.no')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
