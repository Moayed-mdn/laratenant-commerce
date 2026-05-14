import type { ProductUpdatePayload } from '@/types/product';
import type { ProductContentFormValues } from '@/types/product-editor';

type BuildContentPayloadInput = {
  content: ProductContentFormValues;
};

/**
 * Builds the API payload for saving the content tab.
 *
 * Sends:
 * - is_active    (derived from status === 'active')
 * - is_featured  (optional)
 * - category_id
 * - brand_id
 * - translations[]
 *
 * Does NOT send variants or options — content tab is isolated
 * from structure changes by design.
 */
export function buildContentPayload(
  input: BuildContentPayloadInput
): ProductUpdatePayload {
  const { content } = input;

  return {
    is_active: content.status === 'active',
    is_featured: content.isFeatured ?? undefined,
    category_id: content.categoryId,
    brand_id: content.brandId,
    translations: Object.values(content.translations ?? {}).map((t) => ({
      locale: t.locale,
      name: t.name,
      slug: t.slug,
      description: t.description ?? null,
      seo_title: t.seo_title ?? null,
      seo_description: t.seo_description ?? null,
    })),
  };
}
