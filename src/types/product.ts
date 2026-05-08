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

/** Weight unit type */
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

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
  manufacture_date: string | null;
  expiry_date: string | null;
  attributes: { name: string; value: string }[];
}

/**
 * Lightweight product shape — returned by list endpoint.
 * GET /api/v1/admin/stores/{store}/products
 */
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

/**
 * Full product shape — returned by detail endpoint.
 * GET /api/v1/admin/stores/{store}/products/{id}
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
  images: ProductImage[];
  variants: ProductVariant[];
  category_id: number | null;
  brand_id: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * List item view — mapped for product list UI.
 */
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

/** Product detail view (mapped for edit form) */
export interface ProductDetailView {
  id: number;
  storeId: number;
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
}

export interface ProductAttributeValue {
  value: string;
}

export interface ProductAttribute {
  name: string;
  values: ProductAttributeValue[];
}

export interface ProductVariantInput {
  id?: number;
  key: string;
  label: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  quantity: number;
  low_stock_threshold: number | null;
  track_inventory: boolean;
  is_active: boolean;
  weight: number | null;
  weight_unit: WeightUnit | null;
  attributes: { name: string; value: string }[];
}

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
  attributes: ProductAttribute[];
}

/** Product create payload */
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

/** Product update payload */
export type ProductUpdatePayload = Partial<ProductCreatePayload>;
