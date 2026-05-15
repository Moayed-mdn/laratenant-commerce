import type { ProductOption, ProductVariant } from '@/types/product';

/**
 * Rebuilds the canonical options list from the semantic option assignments
 * on existing variants.
 *
 * Used as a fallback when the API does not return top-level options,
 * or to ensure editor integrity when the options list is empty.
 *
 * Logic:
 * 1. Collect all unique option_name values across all variants.
 * 2. For each option name, collect all unique option_value strings.
 * 3. Return a ProductOption[] sorted by first appearance.
 *
 * Note: Derived options have no DB IDs (id: null) because the mapping
 * from name → DB record is not available client-side.
 */
export function deriveOptionsFromVariants(
  variants: ProductVariant[]
): ProductOption[] {
  if (!variants || variants.length === 0) {
    return [];
  }

  // Preserve insertion order for option names
  const optionOrder: string[] = [];
  const optionMap = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    (variant.options ?? []).forEach((opt) => {
      const name = opt.option_name?.trim();
      const value = opt.option_value?.trim();

      if (!name || !value) return;

      if (!optionMap.has(name)) {
        optionOrder.push(name);
        optionMap.set(name, new Set());
      }

      optionMap.get(name)!.add(value);
    });
  });

  return optionOrder.map((name, index) => ({
    id: null,
    name,
    position: index + 1,
    values: Array.from(optionMap.get(name)!).map((val) => ({
      id: null,
      value: val,
    })),
  }));
}
