/**
 * Product data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  AdminProduct,
  Locale,
  ProductDetailView,
  ProductListItemView,
  ProductTranslation,
} from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils/date';

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
    availableLocales,
    translations,
  };
}
