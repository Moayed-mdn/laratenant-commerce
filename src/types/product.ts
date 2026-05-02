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
  created_at: string;
  updated_at: string;
}
