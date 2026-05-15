import type { ProductUpdatePayload }      from '@/types/product';
import type { ProductContentFormValues }  from '@/features/products/editor/types/product-editor';

interface BuildContentPayloadInput {
  content: ProductContentFormValues;
  /** When provided, tag assignments are updated in the same PATCH call.
   *  Absence = no change to existing assignments (backend contract).
   *  Empty array = detach all tags from this product. */
  tags?: number[];
}

/**
 * Builds the API payload for saving the content tab.
 *
 * Sends:
 * - is_active    (derived from status === 'active')
 * - is_featured
 * - category_id
 * - brand_id
 * - translations[]
 * - tags[]        (only when caller provides the argument)
 *
 * Does NOT send variants or options — content tab is isolated
 * from structure changes by design.
 */
export function buildContentPayload(
  input: BuildContentPayloadInput
): ProductUpdatePayload {
  const { content, tags } = input;

  return {
    is_active:   content.status === 'active',
    is_featured: content.isFeatured,
    category_id: content.categoryId,
    brand_id:    content.brandId,
    translations: Object.values(content.translations ?? {}).map((t) => ({
      locale:          t.locale,
      name:            t.name,
      slug:            t.slug,
      description:     t.description     ?? null,
      seo_title:       t.seo_title       ?? null,
      seo_description: t.seo_description ?? null,
    })),
    // Only include the tags key when the caller passes it explicitly.
    ...(tags !== undefined ? { tags } : {}),
  };
}
