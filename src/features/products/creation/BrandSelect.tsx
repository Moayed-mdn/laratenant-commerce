'use client';

/**
 * BrandSelect
 *
 * Dropdown for selecting a product brand.
 * Fetches active brands for the given store.
 * Includes a "No brand" option to clear the selection.
 *
 * onNameChange (optional): called whenever the resolved display name of the
 * selected brand changes. Used by the create wizard to capture the name for
 * the review step without a second network fetch. Purely additive — existing
 * usages without this prop continue to work unchanged.
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
  onChange: (change: { id: number | null; name: string | null }) => void;
}

const NO_BRAND = '__none__';

export function BrandSelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');

  const { data, isLoading } = useBrands(storeId);
  const brands = data?.data ?? [];

  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_BRAND) {
      onChange({ id: null, name: null });
      return;
    }
    const parsed = parseInt(raw, 10);
    const id = Number.isFinite(parsed) ? parsed : null;
    const name = brands.find((b) => b.id === id)?.name ?? null;
    onChange({ id, name });
  };

  const selectValue = value !== null ? String(value) : NO_BRAND;
  const selectedBrandName = brands.find((b) => b.id === value)?.name;

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
          >
            {selectedBrandName}
          </SelectValue>
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