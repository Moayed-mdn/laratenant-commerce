import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Mapping:
 * - content.status      → status
 * - content.categoryId  → category_id
 * - content.brandId     → brand_id
 * - content.isFeatured  → is_featured
 * - content.translations → translations[]
 * - structure.options   → options[]
 * - structure.variants  → variants[] with semantic options map
 *
 * Negative variant IDs are client-only — omitted from payload.
 * Empty translations (no name + slug) are filtered out.
 * Options with empty names or no values are filtered out.
 */
export function buildCreatePayload(
  state: CreateProductWizardState
): ProductCreatePayload {
  const { content, structure } = state;

  // ── Translations ───────────────────────────────────────────────
  const translations = Object.values(content.translations)
    .filter((t) => t.name.trim() !== '' && t.slug.trim() !== '')
    .map((t) => ({
      locale:          t.locale,
      name:            t.name.trim(),
      slug:            t.slug.trim(),
      description:     t.description     ?? null,
      seo_title:       t.seo_title       ?? null,
      seo_description: t.seo_description ?? null,
    }));

  // ── Canonical options ──────────────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name:     o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values:   o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variants ───────────────────────────────────────────────────
  let variants = (structure.variants ?? []).map((v) => {
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) optionsMap[name] = value;
    }

    return {
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:              v.sku              ?? null,
      price:            v.price,
      quantity:         v.quantity,
      is_active:        v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date:      v.expiry_date      ?? null,
      batch_number:     v.batch_number     ?? null,
      options:          optionsMap,
    };
  });

  // ── Default variant fallback ───────────────────────────────────
  if (variants.length === 0) {
    variants = [{
      sku:              null,
      price:            0,
      quantity:         0,
      is_active:        true,
      manufacture_date: null,
      expiry_date:      null,
      batch_number:     null,
      options:          {},
    }];
  }

  return {
    status:      content.status,
    category_id: content.categoryId  ?? null,
    brand_id:    content.brandId     ?? null,
    is_featured: content.isFeatured  ?? false,
    translations,
    options,
    variants,
  };
}
