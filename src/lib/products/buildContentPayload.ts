import type { ProductUpdatePayload } from '@/types/product';

import type { ProductContentFormValues } from '@/types/product-editor';

type BuildContentPayloadInput = {
  content: ProductContentFormValues;
};

export function buildContentPayload(
  input: BuildContentPayloadInput
): ProductUpdatePayload {
  const { content } = input;

  return {
    category_id: content.categoryId,
    brand_id: content.brandId,
    is_active: content.status === 'active',
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
