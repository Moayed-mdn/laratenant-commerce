import type { ProductVariantOption } from '@/types/product';

/**
 * Builds a deterministic, order-independent signature for a variant
 * based on its semantic option assignments.
 *
 * Logic:
 * 1. Filter out any entries with empty option_name or option_value.
 * 2. Sort entries alphabetically by option_name.
 * 3. Join as "name:value" pairs separated by "|".
 *
 * Example: [{ option_name: "Size", option_value: "XL" },
 *           { option_name: "Color", option_value: "Red" }]
 *       → "Color:Red|Size:XL"
 *
 * This replaces the old ID-based signature ("1:10|2:20").
 * String-based signatures are stable across re-generation cycles
 * because option names and values are unique per product (DB constraint).
 */
export function buildVariantSignature(
  options: ProductVariantOption[]
): string {
  return [...(options ?? [])]
    .filter(
      (o) =>
        typeof o.option_name === 'string' &&
        o.option_name.trim() !== '' &&
        typeof o.option_value === 'string' &&
        o.option_value.trim() !== ''
    )
    .sort((a, b) =>
      a.option_name.trim().localeCompare(b.option_name.trim())
    )
    .map((o) => `${o.option_name.trim()}:${o.option_value.trim()}`)
    .join('|');
}
