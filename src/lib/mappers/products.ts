/**
 * Product data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type { AdminProduct, ProductListItemView, ProductDetailView } from '@/types/product';
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
    firstImage: raw.images[0]?.url ?? null,
    createdAt: formatDate(raw.created_at),
  };
}

/**
 * Map product detail from raw API shape to view shape.
 */
export function mapProductDetail(raw: AdminProduct): ProductDetailView {
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
  };
}
