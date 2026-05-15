import type { ProductUpdatePayload } from '@/types/product';
import type { ProductStructureState } from '@/features/products/editor/types/product-editor';

type BuildStructurePayloadInput = {
  structure: ProductStructureState;
};

/**
 * Builds the API payload for saving the structure tab.
 *
 * Sends:
 * - sync_variants: true
 * - options[]              (canonical product options)
 * - variants[]             (semantic options map + variant media)
 *
 * Variant ID handling:
 *   Positive  → sent as-is  (existing server record)
 *   Negative  → omitted     (backend creates new record)
 *
 * Variant media:
 *   Images with no URL are filtered.
 *   Positive image IDs → sent (backend updates alt/position).
 *   Negative image IDs → omitted (backend creates new record).
 *   Empty array        → sent explicitly (clears existing media).
 */
export function buildStructurePayload(
  input: BuildStructurePayloadInput
): ProductUpdatePayload & { sync_variants: true } {
  const { structure } = input;

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
  const variants = (structure.variants ?? []).map((v) => {
    // Semantic option map
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name  = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) optionsMap[name] = value;
    }

    // Variant-level media
    const variantMedia = (v.media ?? [])
      .filter((img) => img.url?.trim() !== '')
      .map((img) => ({
        // Only send real server IDs; negative IDs = unsaved
        ...(typeof img.id === 'number' && img.id > 0 ? { id: img.id } : {}),
        url:      img.url.trim(),
        alt:      img.alt ?? null,
        position: img.position,
      }));

    return {
      ...(typeof v.id === 'number' && v.id > 0 ? { id: v.id } : {}),
      sku:                  v.sku              ?? null,
      barcode:              v.barcode          ?? null,
      price:                v.price,
      compare_at_price:     v.compare_at_price ?? null,
      cost_price:           v.cost_price       ?? null,
      quantity:             v.quantity,
      low_stock_threshold:  v.low_stock_threshold ?? null,
      track_inventory:      v.track_inventory  ?? null,
      is_active:            v.is_active,
      weight:               v.weight           ?? null,
      weight_unit:          v.weight_unit      ?? null,
      manufacture_date:     v.manufacture_date ?? null,
      expiry_date:          v.expiry_date      ?? null,
      batch_number:         v.batch_number     ?? null,
      options:              optionsMap,
      media:                variantMedia,
    };
  });

  return {
    sync_variants: true,
    options,
    variants,
  };
}
