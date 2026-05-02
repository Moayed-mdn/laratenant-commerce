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
export type ProductStatus = 'active' | 'draft' | 'archived';

/** Weight unit type */
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

/** Admin product type (raw API shape) */
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
  created_at: string;
  updated_at: string;
}

/** Product list item view (mapped for UI) */
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
  createdAt: string;
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
