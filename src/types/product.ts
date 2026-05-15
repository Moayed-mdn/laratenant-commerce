/**
 * Product types for the admin dashboard.
 * Aligned with canonical options + semantic variant map architecture.
 */

// ── Primitives ────────────────────────────────────────────────────────────

export type ProductStatus  = 'active' | 'draft';
export type Locale         = string;
export type ProductEntityId = number;
export type WeightUnit     = 'kg' | 'g' | 'lb' | 'oz';

// ── Images ────────────────────────────────────────────────────────────────

export interface ProductImage {
  id:       number;
  url:      string;
  alt:      string | null;
  position: number;
}

// ── Translations ──────────────────────────────────────────────────────────

export interface ProductTranslation {
  locale:          Locale;
  name:            string;
  slug:            string;
  description:     string | null;
  seo_title:       string | null;
  seo_description: string | null;
  is_complete?:    boolean;
}

// ── Options ───────────────────────────────────────────────────────────────

export interface ProductOptionValue {
  id?:   ProductEntityId | null;
  value: string;
}

export interface ProductOption {
  id?:      ProductEntityId | null;
  name:     string;
  position: number;
  values:   ProductOptionValue[];
}

export interface AdminProductOption {
  id?:       ProductEntityId | null;
  name?:     string | null;
  position?: number | null;
  values?:   Array<{
    id?:    ProductEntityId | null;
    value?: string | null;
  }> | null;
}

// ── Variants ──────────────────────────────────────────────────────────────

export interface ProductVariantOption {
  option_name:  string;
  option_value: string;
}

/**
 * Raw admin variant shape returned by the backend.
 * media[] is optional — not all variants have custom images.
 */
export interface AdminProductVariant {
  id:                   number;
  sku:                  string | null;
  barcode?:             string | null;
  price:                number;
  compare_at_price?:    number | null;
  cost_price?:          number | null;
  quantity:             number;
  low_stock_threshold?: number | null;
  track_inventory?:     boolean;
  weight?:              number | null;
  weight_unit?:         WeightUnit | null;
  is_active:            boolean;
  manufacture_date?:    string | null;
  expiry_date?:         string | null;
  batch_number?:        string | null;
  options:              ProductVariantOption[];
  /** Variant-specific images. Falls back to product-level media when empty. */
  media?:               ProductImage[];
}

/**
 * Client-side variant — mirrors AdminProductVariant but with
 * negative IDs allowed for unsaved records.
 * media[] is always present (normalised to [] when absent).
 */
export interface ProductVariant {
  id:                   number;
  sku:                  string | null;
  barcode?:             string | null;
  price:                number;
  compare_at_price?:    number | null;
  cost_price?:          number | null;
  quantity:             number;
  low_stock_threshold?: number | null;
  track_inventory?:     boolean;
  weight?:              number | null;
  weight_unit?:         WeightUnit | null;
  is_active:            boolean;
  manufacture_date?:    string | null;
  expiry_date?:         string | null;
  batch_number?:        string | null;
  options:              ProductVariantOption[];
  /** Variant-specific images. Empty array = use product media as fallback. */
  media:                ProductImage[];
}

// ── Admin API Response Types ──────────────────────────────────────────────

export interface AdminProduct {
  id:               number;
  store_id:         number;
  name:             string;
  slug:             string;
  description:      string | null;
  price:            number;
  compare_at_price: number | null;
  cost_per_item:    number | null;
  sku:              string | null;
  barcode:          string | null;
  quantity:         number;
  track_quantity:   boolean;
  weight:           number | null;
  weight_unit:      WeightUnit | null;
  status:           ProductStatus;
  is_featured?:     boolean;
  media:            ProductImage[];
  variants:         AdminProductVariant[];
  options?:         AdminProductOption[] | null;
  category_id:      number | null;
  brand_id:         number | null;
  /** Backend returns tag stubs — mapper extracts IDs. */
  tags?:            Array<{ id: number }>;
  available_locales?: Locale[];
  translations?:    Record<Locale, ProductTranslation>;
  created_at:       string;
  updated_at:       string;
}

// ── View Types (post-mapper) ──────────────────────────────────────────────

export interface ProductListItemView {
  id:             number;
  name:           string;
  slug:           string;
  status:         ProductStatus;
  price:          string;
  compareAtPrice: string | null;
  quantity:       number;
  sku:            string | null;
  firstImage:     string | null;
  category:       string | null;
  createdAt:      string;
}

export interface ProductDetailView {
  id:              number;
  storeId:         number;
  categoryId:      number | null;
  brandId:         number | null;
  name:            string;
  slug:            string;
  description:     string;
  price:           number;
  compareAtPrice:  number | null;
  costPerItem:     number | null;
  sku:             string | null;
  barcode:         string | null;
  quantity:        number;
  trackQuantity:   boolean;
  weight:          number | null;
  weightUnit:      WeightUnit | null;
  status:          ProductStatus;
  isFeatured:      boolean;
  tags:            number[];
  media:           ProductImage[];
  createdAt:       string;
  updatedAt:       string;
  variants:        ProductVariant[];
  options:         ProductOption[];
  availableLocales: Locale[];
  translations:    Record<Locale, ProductTranslation>;
}

// ── API Payload Types ─────────────────────────────────────────────────────

export interface ProductUpdatePayload {
  category_id?:  number | null;
  brand_id?:     number | null;
  is_active?:    boolean | null;
  is_featured?:  boolean | null;
  translations?: Array<{
    locale:          string;
    name:            string;
    slug:            string;
    description?:    string | null;
    seo_title?:      string | null;
    seo_description?: string | null;
  }>;
  sync_variants?: boolean;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants?: Array<{
    id?:                  number | null;
    sku:                  string | null;
    barcode?:             string | null;
    price:                number;
    compare_at_price?:    number | null;
    cost_price?:          number | null;
    quantity:             number;
    low_stock_threshold?: number | null;
    track_inventory?:     boolean | null;
    is_active?:           boolean | null;
    weight?:              number | null;
    weight_unit?:         string | null;
    manufacture_date?:    string | null;
    expiry_date?:         string | null;
    batch_number?:        string | null;
    options?:             Record<string, string>;
    /** Variant-level media. Omitted = no change. Empty = clear. */
    media?: Array<{
      id?:       number;
      url:       string;
      alt?:      string | null;
      position?: number;
    }>;
  }>;
  tags?: number[];
  media?: Array<{
    id?:       number;
    url:       string;
    alt?:      string | null;
    position?: number;
  }>;
}

export interface ProductCreatePayload {
  status:        ProductStatus;
  category_id?:  number | null;
  brand_id?:     number | null;
  is_featured?:  boolean;
  translations: Array<{
    locale:           string;
    name:             string;
    slug:             string;
    description?:     string | null;
    seo_title?:       string | null;
    seo_description?: string | null;
  }>;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants: Array<{
    id?:                  number;
    sku:                  string | null;
    barcode?:             string | null;
    price:                number;
    compare_at_price?:    number | null;
    cost_price?:          number | null;
    quantity:             number;
    low_stock_threshold?: number | null;
    track_inventory?:     boolean | null;
    is_active:            boolean;
    weight?:              number | null;
    weight_unit?:         string | null;
    manufacture_date?:    string | null;
    expiry_date?:         string | null;
    batch_number?:        string | null;
    options?:             Record<string, string>;
    /** Variant-level media. Optional — backend accepts nullable array. */
    media?: Array<{
      url:       string;
      alt?:      string | null;
      position?: number;
    }>;
  }>;
  media?: Array<{
    url:       string;
    alt?:      string | null;
    position?: number;
  }>;
  tags?: number[];
}
