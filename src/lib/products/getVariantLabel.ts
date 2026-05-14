import type { ProductVariantOption } from '@/types/product';

/**
 * Builds a human-readable label for a variant from its option assignments.
 *
 * Example:
 *   [{ option_name: "Color", option_value: "Red" },
 *    { option_name: "Size", option_value: "XL" }]
 *   → "Red / XL"
 *
 * Returns "Default Variant" when no options are present.
 */
export function getVariantLabel(
  options: ProductVariantOption[] | null | undefined
): string {
  const parts = (options ?? [])
    .map((o) => o.option_value?.trim() ?? '')
    .filter((x) => x !== '');

  if (parts.length === 0) return 'Default Variant';
  return parts.join(' / ');
}
