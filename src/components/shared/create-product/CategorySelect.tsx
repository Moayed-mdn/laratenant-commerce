'use client';

/**
 * CategorySelect
 *
 * Dropdown for selecting a product category.
 * Fetches active categories for the given store.
 * Includes a "No category" option to clear the selection.
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
import { useCategories } from '@/hooks/categories/useCategories';

interface Props {
  storeId:  string;
  value:    number | null;
  onChange: (next: number | null) => void;
}

const NO_CATEGORY = '__none__';

export function CategorySelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');

  // No filters arg → uses default (active categories, perPage 100)
  const { data, isLoading } = useCategories(storeId);

  // data is PaginatedResponse<CategoryListItemView> — extract the list
  const categories = data?.data ?? [];

  const handleChange = (raw: string | null) => {
    if (!raw || raw === NO_CATEGORY) {
      onChange(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    onChange(Number.isFinite(parsed) ? parsed : null);
  };

  const selectValue = value !== null ? String(value) : NO_CATEGORY;

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.category')}</Label>
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
                : t('form.fields.categoryPlaceholder')
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CATEGORY}>
            {t('form.fields.noCategoryOption')}
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}