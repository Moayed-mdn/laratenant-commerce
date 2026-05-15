import type { ProductCreatePayload } from '@/types/product';
import type { CreateProductWizardState } from '@/schemas/products';

/**
 * Builds the API payload for creating a new product from wizard state.
 *
 * Variant media is included per-variant when present.
 * Images with no URL are filtered.
 * Negative image IDs (client-only) are omitted — backend creates records.
 */
export function buildCreatePayload(
  state: CreateProductWizardState
): ProductCreatePayload {
  const { content, structure, media, tags } = state;

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
      values:   o.values.map((v) => v.value.trim()).filter((v) => v !== ''),
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

    // Variant-level media — filter empty URLs, strip negative IDs
    const variantMedia = (v.media ?? [])
      .filter((img) => img.url?.trim() !== '')
      .map((img) => ({
        url:      img.url.trim(),
        alt:      img.alt ?? null,
        position: img.position,
      }));

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
      ...(variantMedia.length > 0 ? { media: variantMedia } : {}),
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

  // ── Product-level media ────────────────────────────────────────
  const mediaItems = (media?.media ?? [])
    .filter((img) => img.url?.trim() !== '')
    .map((img) => ({
      url:      img.url,
      alt:      img.alt ?? null,
      position: img.position,
    }));

  // ── Tags ───────────────────────────────────────────────────────
  const tagIds = (tags ?? []).filter((id) => Number.isInteger(id) && id > 0);

  return {
    status:      content.status,
    category_id: content.categoryId  ?? null,
    brand_id:    content.brandId     ?? null,
    is_featured: content.isFeatured  ?? false,
    translations,
    options,
    variants,
    ...(mediaItems.length > 0 ? { media: mediaItems } : {}),
    ...(tagIds.length > 0    ? { tags: tagIds }       : {}),
  };
}
