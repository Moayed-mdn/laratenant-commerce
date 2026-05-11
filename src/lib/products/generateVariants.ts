import type {
  ProductOption,
  ProductVariant,
} from '@/types/product';

import { buildVariantSignature } from './variant-signatures';

type OptionValueRef = {
  option: ProductOption;
  value: ProductOption['values'][number];
};

function buildCombinations(options: ProductOption[]): OptionValueRef[][] {
  const validOptions = (options ?? []).filter((opt) => (opt.values ?? []).length > 0);

  if (validOptions.length === 0) return [];

  return validOptions.reduce<OptionValueRef[][]>((acc, option) => {
    const refs = option.values.map((value) => ({ option, value }));

    if (acc.length === 0) {
      return refs.map((r) => [r]);
    }

    const next: OptionValueRef[][] = [];
    for (const existing of acc) {
      for (const r of refs) {
        next.push([...existing, r]);
      }
    }
    return next;
  }, []);
}

/**
 * Calculates the next safe negative ID for a new variant.
 * Negative IDs are used for variants that haven't been saved to the backend yet.
 */
export function getNextNegativeId(existing: { id: number }[]): number {
  const minId = (existing ?? []).reduce<number>((min, v) => Math.min(min, v.id), 0);
  return minId <= 0 ? minId - 1 : -1;
}

/**
 * Generates the full set of variants based on provided options.
 * 
 * Logic:
 * 1. Build all possible attribute combinations.
 * 2. If no combinations exist, return empty (sync behavior).
 * 3. Preserve existing variants if their attribute signature matches a required combination.
 * 4. Create new variants with negative IDs for missing combinations.
 * 5. Stale variants (no longer matching any combination) are naturally omitted.
 */
export function generateVariants(
  options: ProductOption[],
  existingVariants: ProductVariant[]
): ProductVariant[] {
  const existing = existingVariants ?? [];

  const combos = buildCombinations(options);

  if (combos.length === 0) {
    return [];
  }

  let nextNewId = getNextNegativeId(existing);
  const defaultPrice = existing[0]?.price ?? 0;

  const validSignatures: string[] = [];
  const signatureToAttributes = new Map<string, ProductVariant['attributes']>();

  for (const combo of combos) {
    const attributes: ProductVariant['attributes'] = combo.map(({ option, value }) => ({
      attribute_id: option.id ?? null,
      attribute_value_id: value.id ?? null,
      name: option.name,
      value: value.label,
      label: value.label,
      code: option.code,
    }));

    const signature = buildVariantSignature(attributes);

    validSignatures.push(signature);
    signatureToAttributes.set(signature, attributes);
  }

  const kept: ProductVariant[] = [];
  const validSet = new Set(validSignatures);

  /**
   * Preservation Logic:
   * We identify variants by their attribute combination signature.
   * If an existing variant's signature matches a required combination, we keep it
   * (preserving its ID, SKU, price, etc.) even if the options were rearranged.
   */
  for (const v of existing) {
    const signature = buildVariantSignature(v.attributes);
    if (validSet.has(signature)) {
      kept.push(v);
    }
  }

  // Append any missing combinations as new variants.
  const keptBySignature = new Set(kept.map((v) => buildVariantSignature(v.attributes)));
  for (const signature of validSignatures) {
    if (keptBySignature.has(signature)) continue;

    const attributes = signatureToAttributes.get(signature);
    if (!attributes) continue;

    kept.push({
      id: nextNewId,
      sku: null,
      price: defaultPrice,
      quantity: 0,
      is_active: true,
      attributes,
    });
    nextNewId -= 1;
  }

  return kept;
}
