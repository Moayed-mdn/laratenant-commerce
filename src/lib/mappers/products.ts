/**
 * Product data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  AdminProduct,
  AdminProductOption,
  Locale,
  ProductDetailView,
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
  VariantFormItem,
} from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils/date';

function normalizeOptionValue(
  raw: { id?: unknown; label?: string | null },
  fallbackIndex: number
): ProductOptionValue | null {
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (!label) return null;
  
  const id = typeof raw.id === 'number' ? raw.id : null;
  return { id, label };
}

export function normalizeProductOptions(
  rawOptions: AdminProductOption[] | null | undefined
): ProductOption[] {
  return (rawOptions ?? []).reduce<ProductOption[]>((acc, option, index) => {
      const name = typeof option.name === 'string' ? option.name.trim() : '';
      const code = typeof option.code === 'string' ? option.code.trim() : '';
      const values = (option.values ?? [])
        .map((value, valueIndex) => normalizeOptionValue(value, valueIndex))
        .filter((value): value is ProductOptionValue => value !== null);

      if (!name || values.length === 0) {
        return acc;
      }

      const id = typeof option.id === 'number' ? option.id : null;

      acc.push({
        id,
        code,
        name,
        values,
      });

      return acc;
    }, []);
}

export function mapVariantToFormItem(
  variant: AdminProduct['variants'][number],
  index: number
): VariantFormItem {
  const attrKey = variant.attributes
    .map((a) => `${a.name}:${a.value}`)
    .join('|');

  return {
    key: attrKey || `variant-${variant.id}-${index}`,
    id: variant.id,
    sku: variant.sku ?? '',
    price: variant.price ?? 0,
    quantity: variant.quantity ?? 0,
    is_active: variant.is_active,
    manufacture_date: variant.manufacture_date ?? null,
    expiry_date: variant.expiry_date ?? null,
    batch_number: variant.batch_number ?? null,
    attributes: (variant.attributes ?? []).map((a) => ({
      attribute_id: a.attribute_id ?? null,
      attribute_value_id: a.attribute_value_id ?? null,
      name: a.name,
      value: a.value,
      label: a.label ?? null,
      code: a.code ?? null,
    })),
  };
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

import { deriveOptionsFromVariants } from '../products/deriveOptionsFromVariants';

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

  const variants = raw.variants ?? [];
  let options = normalizeProductOptions(raw.options);

  // Fallback: If options are missing but variants exist, derive them to ensure editor integrity.
  if (options.length === 0 && variants.length > 0) {
    options = deriveOptionsFromVariants(variants);
  }

  return {
    id: raw.id,
    storeId: raw.store_id,
    categoryId: raw.category_id,
    brandId: raw.brand_id,
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
    variants,
    options,
    availableLocales,
    translations,
  };
}
