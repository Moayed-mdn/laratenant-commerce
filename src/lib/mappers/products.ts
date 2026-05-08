/**
 * Product data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  AdminProduct,
  AdminProductOption,
  AdminProductOptionValue,
  Locale,
  ProductDetailView,
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
} from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils/date';

function normalizeProductOptionValue(
  raw: AdminProductOptionValue,
  index: number
): ProductOptionValue | null {
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';

  if (!label) {
    return null;
  }

  return {
    id: raw.id ?? `option-value-${index}`,
    label,
  };
}

export function normalizeProductOptions(
  rawOptions: AdminProductOption[] | null | undefined
): ProductOption[] {
  return (rawOptions ?? []).reduce<ProductOption[]>((acc, option, index) => {
      const name = typeof option.name === 'string' ? option.name.trim() : '';
      const code = typeof option.code === 'string' ? option.code.trim() : '';
      const values = (option.values ?? [])
        .map((value, valueIndex) => normalizeProductOptionValue(value, valueIndex))
        .filter((value): value is ProductOptionValue => value !== null);

      if (!name || values.length === 0) {
        return acc;
      }

      acc.push({
        id: option.id ?? `option-${index}`,
        code,
        name,
        values,
      });

      return acc;
    }, []);
}

/**
 * Map product list item from raw API shape to view shape.
 */
export function mapProductListItem(
  raw: AdminProduct,
  currency: string = 'USD'
): ProductListItemView {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    status: raw.status,
    price: formatCurrency(raw.price, currency),
    compareAtPrice: raw.compare_at_price
      ? formatCurrency(raw.compare_at_price, currency)
      : null,
    quantity: raw.quantity,
    sku: raw.sku,
    firstImage: raw.images?.[0]?.url ?? null,
    category: null, // Category name not available in raw data, only category_id
    createdAt: formatDate(raw.created_at),
  };
}

/**
 * Map product detail from raw API shape to view shape.
 */
export function mapProductDetail(raw: AdminProduct): ProductDetailView {
  const rawTranslations: Record<Locale, ProductTranslation> = raw.translations ?? {};

  const availableLocales: Locale[] =
    raw.available_locales && raw.available_locales.length > 0
      ? raw.available_locales
      : (Object.keys(rawTranslations) as Locale[]);

  const translations = availableLocales.reduce<Record<Locale, ProductTranslation>>((acc, locale) => {
    const existing = rawTranslations[locale];
    acc[locale] =
      existing ??
      ({
        locale,
        name: '',
        slug: '',
        description: null,
        seo_title: null,
        seo_description: null,
        is_complete: false,
      } satisfies ProductTranslation);
    return acc;
  }, {});

  return {
    id: raw.id,
    storeId: raw.store_id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    price: raw.price,
    compareAtPrice: raw.compare_at_price,
    costPerItem: raw.cost_per_item,
    sku: raw.sku,
    barcode: raw.barcode,
    quantity: raw.quantity,
    trackQuantity: raw.track_quantity,
    weight: raw.weight,
    weightUnit: raw.weight_unit,
    status: raw.status,
    images: raw.images,
    createdAt: formatDate(raw.created_at),
    updatedAt: formatDate(raw.updated_at),
    variants: raw.variants ?? [],
    options: normalizeProductOptions(raw.options),
    availableLocales,
    translations,
  };
}
