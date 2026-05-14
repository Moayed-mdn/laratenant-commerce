'use client';

/**
 * BrandSelect
 *
 * Dropdown for selecting a product brand.
 * Fetches active brands for the given store.
 * Includes a "No brand" option to clear the selection.
 */

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrands } from '@/hooks/brands/useBrands';

interface Props {
  storeId:  string;
  value:    number | null;
  onChange: (next: number | null) => void;
}

const NO_BRAND = '__none__';

export function BrandSelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');

  // No filters arg → uses default (active brands, perPage 100)
  const { data, isLoading } = useBrands(storeId);

  // data is PaginatedResponse<BrandListItemView> — extract the list
  const brands = data?.data ?? [];

  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_BRAND) {
      onChange(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    onChange(Number.isFinite(parsed) ? parsed : null);
  };

  const selectValue = value !== null ? String(value) : NO_BRAND;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.brand')}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? t('form.fields.loading')
                : t('form.fields.brandPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_BRAND}>
            {t('form.fields.noBrandOption')}
          </SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}