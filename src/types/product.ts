/**
 * Product types for the admin dashboard.
 * Aligned with new canonical options + semantic variant map architecture.
 */

// ── Primitives ─────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft';
export type Locale = string;
export type ProductEntityId = number;
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

// ── Images ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  position: number;
}

// ── Translations ───────────────────────────────────────────────────────────

export interface ProductTranslation {
  locale: Locale;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_complete?: boolean;
}

// ── Options (new canonical system) ─────────────────────────────────────────

/**
 * A single option value belonging to a ProductOption.
 * 'value' is the display string (e.g. "Red", "XL").
 * 'id' is present for server-persisted values, null for unsaved ones.
 */
export interface ProductOptionValue {
  id?: ProductEntityId | null;
  value: string;
}

/**
 * A canonical product option (e.g. "Color", "Size").
 * Owned by a product, not global.
 * 'position' controls display order.
 */
export interface ProductOption {
  id?: ProductEntityId | null;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

/**
 * Raw admin product option shape as returned by the backend.
 * Used only in AdminProduct before normalization.
 */
export interface AdminProductOption {
  id?: ProductEntityId | null;
  name?: string | null;
  position?: number | null;
  values?: Array<{
    id?: ProductEntityId | null;
    value?: string | null;
  }> | null;
}

// ── Variants (new semantic map system) ─────────────────────────────────────

/**
 * A single option assignment on a variant.
 * Replaces the old ProductVariantAttribute.
 * e.g. { option_name: "Color", option_value: "Red" }
 */
export interface ProductVariantOption {
  option_name: string;
  option_value: string;
}

/**
 * Raw admin variant shape as returned by the backend resource.
 * Used only in AdminProduct before normalization.
 */
export interface AdminProductVariant {
  id: number;
  sku: string | null;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  quantity: number;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  options: ProductVariantOption[];
}

/**
 * Product variant — the core purchasable entity.
 * 'options' is the semantic map of option assignments.
 * Negative 'id' values indicate unsaved (client-only) variants.
 */
export interface ProductVariant {
  id: number;
  sku: string | null;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  quantity: number;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  options: ProductVariantOption[];
}

// ── Admin API Response Types ────────────────────────────────────────────────

/**
 * Full admin product shape as returned by the backend.
 * This is the raw API response type — map it before use in UI.
 */
export interface AdminProduct {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  sku: string | null;
  barcode: string | null;
  quantity: number;
  track_quantity: boolean;
  weight: number | null;
  weight_unit: WeightUnit | null;
  status: ProductStatus;
  is_featured?: boolean;
  images: ProductImage[];
  variants: AdminProductVariant[];
  options?: AdminProductOption[] | null;
  category_id: number | null;
  brand_id: number | null;
  available_locales?: Locale[];
  translations?: Record<Locale, ProductTranslation>;
  created_at: string;
  updated_at: string;
}

// ── View Types (post-mapper) ────────────────────────────────────────────────

/**
 * Shaped product list item for UI table rendering.
 */
export interface ProductListItemView {
  id: number;
  name: string;
  slug: string;
  status: ProductStatus;
  price: string;
  compareAtPrice: string | null;
  quantity: number;
  sku: string | null;
  firstImage: string | null;
  category: string | null;
  createdAt: string;
}

/**
 * Shaped product detail for the admin editor.
 * All fields are camelCase and ready for UI consumption.
 */
export interface ProductDetailView {
  id: number;
  storeId: number;
  categoryId: number | null;
  brandId: number | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string | null;
  barcode: string | null;
  quantity: number;
  trackQuantity: boolean;
  weight: number | null;
  weightUnit: WeightUnit | null;
  status: ProductStatus;
  isFeatured: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}

// ── API Payload Types ───────────────────────────────────────────────────────

/**
 * Payload for updating an existing product.
 * All fields are optional — send only what changed.
 */
export interface ProductUpdatePayload {
  category_id?: number | null;
  brand_id?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  translations?: Array<{
    locale: string;
    name: string;
    slug: string;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  }>;
  sync_variants?: boolean;
  options?: Array<{
    name: string;
    position: number;
    values: string[];
  }>;
  variants?: Array<{
    id?: number | null;
    sku: string | null;
    barcode?: string | null;
    price: number;
    compare_at_price?: number | null;
    cost_price?: number | null;
    quantity: number;
    low_stock_threshold?: number | null;
    track_inventory?: boolean | null;
    is_active?: boolean | null;
    weight?: number | null;
    weight_unit?: string | null;
    manufacture_date?: string | null;
    expiry_date?: string | null;
    batch_number?: string | null;
    options?: Record<string, string>;
  }>;
  tags?: string[];
}

/**
 * Payload for creating a new product.
 * Follows the new backend contract with translations + options + variants.
 */
export interface ProductCreatePayload {
  status:       ProductStatus;
  category_id?: number | null;
  brand_id?:    number | null;
  is_featured?: boolean;
  translations: Array<{
    locale:          string;
    name:            string;
    slug:            string;
    description?:    string | null;
    seo_title?:      string | null;
    seo_description?: string | null;
  }>;
  options?: Array<{
    name:     string;
    position: number;
    values:   string[];
  }>;
  variants: Array<{
    id?:              number;
    sku:              string | null;
    barcode?:         string | null;
    price:            number;
    compare_at_price?: number | null;
    cost_price?:      number | null;
    quantity:         number;
    low_stock_threshold?: number | null;
    track_inventory?: boolean | null;
    is_active:        boolean;
    weight?:          number | null;
    weight_unit?:     string | null;
    manufacture_date?: string | null;
    expiry_date?:     string | null;
    batch_number?:    string | null;
    options?:         Record<string, string>;
  }>;
  images?: Array<{
    url:      string;
    alt?:     string | null;
    position?: number;
  }>;
  tags?: string[];
}