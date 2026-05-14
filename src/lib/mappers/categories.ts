/**
 * Category data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  CategoryListItem,
  CategoryListItemView,
  CategoryDetail,
  CategoryDetailView,
} from '@/types/category';
import { formatDate } from '@/lib/utils/date';

/**
 * Resolve display name from translation or fall back to slug.
 */
function resolveName(
  translation: { name: string } | null | undefined,
  slug: string,
): string {
  return translation?.name ?? slug;
}

/**
 * Map category list item from raw API shape to view shape.
 */
export function mapCategoryListItem(raw: CategoryListItem): CategoryListItemView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    slug:          raw.slug,
    parentId:      raw.parent_id,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    name:          resolveName(raw.translation, raw.slug),
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    deletedAt:     raw.deleted_at,
  };
}

/**
 * Map category detail from raw API shape to view shape.
 */
export function mapCategoryDetail(raw: CategoryDetail): CategoryDetailView {
  return {
    id:            raw.id,
    storeId:       raw.store_id,
    slug:          raw.slug,
    parentId:      raw.parent_id,
    sortOrder:     raw.sort_order,
    isActive:      raw.is_active,
    name:          resolveName(raw.translation, raw.slug),
    productsCount: raw.products_count,
    createdAt:     formatDate(raw.created_at),
    updatedAt:     formatDate(raw.updated_at),
    deletedAt:     raw.deleted_at,
    translations:  raw.translations,
    parent:        raw.parent,
    children:      raw.children.map(mapCategoryListItem),
    breadcrumb:    raw.breadcrumb,
  };
}
