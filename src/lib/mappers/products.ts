/**
 * Product data mappers.
 * Transforms raw API types to view/editor types for UI consumption.
 */

import type {
  AdminProduct,
  AdminProductOption,
  AdminProductVariant,
  Locale,
  ProductDetailView,
  ProductImage,
  ProductListItemView,
  ProductOption,
  ProductOptionValue,
  ProductTranslation,
  ProductVariant,
} from '@/types/product';

import { formatDate, formatCurrency } from '@/lib/utils/date';
import { deriveOptionsFromVariants }  from '@/features/products/editor/utils/deriveOptionsFromVariants';

// ── Option normalization ──────────────────────────────────────────────────

function normalizeOptionValue(
  raw: { id?: unknown; value?: string | null }
): ProductOptionValue | null {
  const value = typeof raw.value === 'string' ? raw.value.trim() : '';
  if (!value) return null;
  const id = typeof raw.id === 'number' ? raw.id : null;
  return { id, value };
}

export function normalizeProductOptions(
  rawOptions: AdminProductOption[] | null | undefined
): ProductOption[] {
  return (rawOptions ?? []).reduce<ProductOption[]>((acc, option, index) => {
    const name =
      typeof option.name === 'string' ? option.name.trim() : '';
    const position =
      typeof option.position === 'number' ? option.position : index + 1;

    const values = (option.values ?? [])
      .map((v) => normalizeOptionValue(v))
      .filter((v): v is ProductOptionValue => v !== null);

    if (!name || values.length === 0) return acc;

    const id = typeof option.id === 'number' ? option.id : null;
    acc.push({ id, name, position, values });
    return acc;
  }, []);
}

// ── Variant normalization ─────────────────────────────────────────────────

/**
 * Normalises a raw AdminProductVariant to the client-side ProductVariant.
 * Variant media is always normalised to ProductImage[] (never undefined).
 * Images with no URL are filtered as a safety guard.
 */
function normalizeVariant(raw: AdminProductVariant): ProductVariant {
  const media: ProductImage[] = (raw.media ?? [])
    .filter((img) => typeof img.url === 'string' && img.url.trim() !== '')
    .map((img) => ({
      id:       typeof img.id === 'number' ? img.id : 0,
      url:      img.url,
      alt:      img.alt ?? null,
      position: typeof img.position === 'number' ? img.position : 0,
    }));

  return {
    id:                  raw.id,
    sku:                 raw.sku ?? null,
    barcode:             raw.barcode ?? null,
    price:               raw.price ?? 0,
    compare_at_price:    raw.compare_at_price ?? null,
    cost_price:          raw.cost_price ?? null,
    quantity:            raw.quantity ?? 0,
    low_stock_threshold: raw.low_stock_threshold ?? null,
    track_inventory:     raw.track_inventory ?? true,
    weight:              raw.weight ?? null,
    weight_unit:         raw.weight_unit ?? null,
    is_active:           raw.is_active ?? true,
    manufacture_date:    raw.manufacture_date ?? null,
    expiry_date:         raw.expiry_date ?? null,
    batch_number:        raw.batch_number ?? null,
    options: (raw.options ?? []).filter(
      (o) =>
        typeof o.option_name  === 'string' && o.option_name.trim()  !== '' &&
        typeof o.option_value === 'string' && o.option_value.trim() !== ''
    ),
    media,
  };
}

// ── List item mapper ──────────────────────────────────────────────────────

export function mapProductListItem(
  raw:      AdminProduct,
  currency: string = 'USD'
): ProductListItemView {
  return {
    id:             raw.id,
    name:           raw.name,
    slug:           raw.slug,
    status:         raw.status,
    price:          formatCurrency(raw.price, currency),
    compareAtPrice: raw.compare_at_price
      ? formatCurrency(raw.compare_at_price, currency)
      : null,
    quantity:   raw.quantity,
    sku:        raw.sku,
    firstImage: raw.media?.[0]?.url ?? null,
    category:   null,
    createdAt:  formatDate(raw.created_at),
  };
}

// ── Detail mapper ─────────────────────────────────────────────────────────

export function mapProductDetail(raw: AdminProduct): ProductDetailView {
  const rawTranslations: Record<Locale, ProductTranslation> =
    raw.translations ?? {};

  const availableLocales: Locale[] =
    raw.available_locales && raw.available_locales.length > 0
      ? raw.available_locales
      : (Object.keys(rawTranslations) as Locale[]);

  const translations = availableLocales.reduce<Record<Locale, ProductTranslation>>(
    (acc, locale) => {
      const existing = rawTranslations[locale];
      acc[locale] =
        existing ??
        ({
          locale,
          name:            '',
          slug:            '',
          description:     null,
          seo_title:       null,
          seo_description: null,
          is_complete:     false,
        } satisfies ProductTranslation);
      return acc;
    },
    {}
  );

  const variants: ProductVariant[] = (raw.variants ?? []).map(normalizeVariant);

  let options = normalizeProductOptions(raw.options);
  if (options.length === 0 && variants.length > 0) {
    options = deriveOptionsFromVariants(variants);
  }

  return {
    id:             raw.id,
    storeId:        raw.store_id,
    categoryId:     raw.category_id,
    brandId:        raw.brand_id,
    name:           raw.name,
    slug:           raw.slug,
    description:    raw.description ?? '',
    price:          raw.price,
    compareAtPrice: raw.compare_at_price,
    costPerItem:    raw.cost_per_item,
    sku:            raw.sku,
    barcode:        raw.barcode,
    quantity:       raw.quantity,
    trackQuantity:  raw.track_quantity,
    weight:         raw.weight,
    weightUnit:     raw.weight_unit,
    status:         raw.status,
    isFeatured:     raw.is_featured ?? false,
    tags:           (raw.tags ?? []).map((t) => t.id),
    media:          raw.media ?? [],
    createdAt:      formatDate(raw.created_at),
    updatedAt:      formatDate(raw.updated_at),
    variants,
    options,
    availableLocales,
    translations,
  };
}
