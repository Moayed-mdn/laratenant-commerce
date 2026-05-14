import type { ProductUpdatePayload } from '@/types/product';
import type { ProductStructureState } from '@/types/product-editor';

type BuildStructurePayloadInput = {
  structure: ProductStructureState;
};

/**
 * Builds the API payload for saving the structure tab.
 *
 * Sends:
 * - sync_variants: true  (tells backend to perform full variant sync)
 * - options[]            (canonical product options with allowed values)
 * - variants[]           (each with a semantic options map)
 *
 * Variant ID handling:
 * - Positive IDs → sent as-is (existing server records)
 * - Negative IDs → sent as undefined (backend creates new record)
 *
 * Option map format:
 *   { "Color": "Red", "Size": "XL" }
 *
 * Empty option_name / option_value entries are filtered out.
 * Options with no valid values are excluded from the payload.
 */
export function buildStructurePayload(
  input: BuildStructurePayloadInput
): ProductUpdatePayload & { sync_variants: true } {
  const { structure } = input;

  // ── Canonical options payload ──────────────────────────────────
  const options = (structure.options ?? [])
    .filter((o) => o.name.trim() !== '' && o.values.length > 0)
    .map((o, index) => ({
      name: o.name.trim(),
      position: typeof o.position === 'number' ? o.position : index + 1,
      values: o.values
        .map((v) => v.value.trim())
        .filter((v) => v !== ''),
    }))
    .filter((o) => o.values.length > 0);

  // ── Variant payloads ───────────────────────────────────────────
  const variants = (structure.variants ?? []).map((v) => {
    // Convert options[] → semantic map { "Color": "Red" }
    const optionsMap: Record<string, string> = {};
    for (const opt of v.options ?? []) {
      const name = opt.option_name?.trim();
      const value = opt.option_value?.trim();
      if (name && value) {
        optionsMap[name] = value;
      }
    }

    return {
      // Only send real server IDs — negative = unsaved, omit
      id: typeof v.id === 'number' && v.id > 0 ? v.id : undefined,
      sku: v.sku ?? null,
      barcode: v.barcode ?? null,
      price: v.price,
      compare_at_price: v.compare_at_price ?? null,
      cost_price: v.cost_price ?? null,
      quantity: v.quantity,
      low_stock_threshold: v.low_stock_threshold ?? null,
      track_inventory: v.track_inventory ?? null,
      is_active: v.is_active,
      weight: v.weight ?? null,
      weight_unit: v.weight_unit ?? null,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date: v.expiry_date ?? null,
      batch_number: v.batch_number ?? null,
      options: optionsMap,
    };
  });

  return {
    sync_variants: true,
    options,
    variants,
  };
}
