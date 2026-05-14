import type { ProductOption, ProductVariant, ProductVariantOption } from '@/types/product';
import { buildVariantSignature } from './variant-signatures';

// ── Internal combination builder ───────────────────────────────────────────

type OptionValueRef = {
  option: ProductOption;
  value: ProductOption['values'][number];
};

/**
 * Builds the cartesian product of all option values.
 * Options with zero values are excluded.
 * Returns an array of combination arrays, each representing
 * one full variant axis assignment.
 */
function buildCombinations(options: ProductOption[]): OptionValueRef[][] {
  const validOptions = (options ?? []).filter(
    (opt) => (opt.values ?? []).length > 0
  );

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

// ── Public helpers ─────────────────────────────────────────────────────────

/**
 * Calculates the next safe negative ID for a new unsaved variant.
 * Negative IDs are client-only and never sent to the backend as-is
 * (buildStructurePayload filters them to undefined).
 */
export function getNextNegativeId(existing: { id: number }[]): number {
  const minId = (existing ?? []).reduce<number>(
    (min, v) => Math.min(min, v.id),
    0
  );
  return minId <= 0 ? minId - 1 : -1;
}

/**
 * Generates the full set of variants from the current options.
 *
 * Logic:
 * 1. Build all possible option value combinations (cartesian product).
 * 2. If no combinations exist, return empty array.
 * 3. Deduplicate combinations by signature to guard against
 *    malformed option states (duplicate values).
 * 4. Preserve existing variants whose option signature matches
 *    a required combination (retains id, sku, price, etc.).
 * 5. Create new variants with negative IDs for missing combinations.
 * 6. Stale variants (signature no longer in required set) are omitted.
 *
 * This function is pure and safe to call multiple times.
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

  const defaultPrice = existing[0]?.price ?? 0;
  let nextNewId = getNextNegativeId(existing);

  // ── Build the required signature set ──────────────────────────
  const validSignatures: string[] = [];
  const signatureToOptions = new Map<string, ProductVariantOption[]>();
  const seenSignatures = new Set<string>();

  for (const combo of combos) {
    const variantOptions: ProductVariantOption[] = combo.map(
      ({ option, value }) => ({
        option_name: option.name,
        option_value: value.value,
      })
    );

    const signature = buildVariantSignature(variantOptions);

    // Guard: skip duplicate combinations from malformed option states
    if (seenSignatures.has(signature)) {
      continue;
    }

    seenSignatures.add(signature);
    validSignatures.push(signature);
    signatureToOptions.set(signature, variantOptions);
  }

  // ── Preserve matching existing variants ────────────────────────
  const kept: ProductVariant[] = [];
  const validSet = new Set(validSignatures);
  const keptSignatures = new Set<string>();

  for (const v of existing) {
    const signature = buildVariantSignature(v.options);
    if (validSet.has(signature) && !keptSignatures.has(signature)) {
      kept.push(v);
      keptSignatures.add(signature);
    }
  }

  // ── Create new variants for missing combinations ───────────────
  for (const signature of validSignatures) {
    if (keptSignatures.has(signature)) continue;

    const variantOptions = signatureToOptions.get(signature);
    if (!variantOptions) continue;

    kept.push({
      id: nextNewId,
      sku: null,
      price: defaultPrice,
      quantity: 0,
      is_active: true,
      options: variantOptions,
    });

    keptSignatures.add(signature);
    nextNewId -= 1;
  }

  return kept;
}
