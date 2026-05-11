/**
 * Product types for the admin dashboard.
 */

/** Product image type */
export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  position: number;
}

/** Product status union type */
export type ProductStatus = 'active' | 'inactive' | 'draft';

export type Locale = string;
export type ProductEntityId = number;

export interface ProductTranslation {
  locale: Locale;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_complete?: boolean;
}

/** Weight unit type */
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

/** Product variant attribute type */
export interface ProductVariantAttribute {
  attribute_id: number | null;
  attribute_value_id: number | null;
  name: string;
  value: string;
  label?: string | null;
  code?: string | null;
}

/** Product variant type */
export interface ProductVariant {
  id: number;
  label?: string | null;
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
  attributes: ProductVariantAttribute[];
}

/** Product option value type */
export interface ProductOptionValue {
  id?: ProductEntityId | null;
  label: string;
}

/** Product option type */
export interface ProductOption {
  id?: ProductEntityId | null;
  code: string;
  name: string;
  values: ProductOptionValue[];
}

/** Admin product option type */
export interface AdminProductOption {
  id?: ProductEntityId | null;
  code?: string | null;
  name?: string | null;
  values?: Array<{ id?: ProductEntityId | null; label?: string | null }> | null;
}

/** Admin product type */
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
  images: ProductImage[];
  variants: ProductVariant[];
  options?: AdminProductOption[] | null;
  category_id: number | null;
  brand_id: number | null;
  available_locales?: Locale[];
  translations?: Record<Locale, ProductTranslation>;
  created_at: string;
  updated_at: string;
}

/** Product list item view type */
export interface ProductListItemView {
  id: number;
  name: string;
  slug: string;
  status: ProductStatus;
  price: string;           // formatted currency
  compareAtPrice: string | null;
  quantity: number;
  sku: string | null;
  firstImage: string | null;
  category: string | null;
  createdAt: string;       // formatted date
}

/** Product detail view type */
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
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  options: ProductOption[];
  availableLocales: Locale[];
  translations: Record<Locale, ProductTranslation>;
}

/** Product attribute value type */
export interface ProductAttributeValue {
  value: string;
}

/** Product attribute type */
export interface ProductAttribute {
  name: string;
  values: ProductAttributeValue[];
}

/**
 * Internal variant representation used by the form.
 * Mirrors ProductVariant but adds a stable `key` for React rendering.
 */
export interface VariantFormItem {
  /** Stable React key — never sent to backend */
  key: string;
  /** Server id — present for existing variants, undefined for new ones */
  id?: number;
  label?: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  attributes: ProductVariantAttribute[];
  barcode?: string | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
}

/** Product variant input type */
export type ProductVariantInput = {
  key: string;
  id?: number;
  label?: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  attributes: ProductVariantAttribute[];
  barcode?: string | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
};

/** Product editor state type */
export interface ProductEditorState {
  product: {
    name: string;
    description: string;
    status: ProductStatus;
    category_id: number | null;
    brand_id: number | null;
    featured: boolean;
    active: boolean;
    media: ProductImage[];
  };
  variants: ProductVariantInput[];
  options: ProductOption[];
}

/** Product form state type */
export interface ProductFormState {
  translations: Record<Locale, ProductTranslation>;
  status: ProductStatus;
  variants: VariantFormItem[];
  options: ProductOption[];
}

/** Product update payload type */
export interface ProductUpdatePayload {
  category_id?: number | null;
  brand_id?: number | null;
  is_active?: boolean | null;
  translations?: Array<{
    locale: string;
    name: string;
    slug: string;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  }>;
  variants?: Array<{
    id?: number | null;
    sku: string;
    price: number;
    quantity: number;
    is_active?: boolean | null;
    manufacture_date?: string | null;
    expiry_date?: string | null;
    batch_number?: string | null;
    attributes?: Array<{
      attribute_id: number;
      attribute_value_id: number;
    }>;
  }>;
  tags?: string[];
}

/** Admin product list item type */
export interface AdminProductListItem {
  id: number;
  name: string;
  status: ProductStatus;
  price: number;
  stock: number;
  thumbnail: string | null;
  category: string | null;
  created_at: string;
}

/** Product create payload type */
export interface ProductCreatePayload {
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  cost_per_item?: number | null;
  sku?: string | null;
  barcode?: string | null;
  quantity: number;
  track_quantity: boolean;
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  status: ProductStatus;
}
