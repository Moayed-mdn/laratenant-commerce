import type { ProductOption, ProductVariant, ProductOptionValue } from '@/types/product';

/**
 * Rebuilds the list of options and their values from the existing variants.
 * This is used as a deterministic fallback when the API does not provide
 * the options list, or to ensure integrity between variants and options.
 * 
 * Logic:
 * 1. Collect all unique attribute names across all variants.
 * 2. For each attribute name, collect all unique values.
 * 3. Return a list of ProductOption objects.
 */
export function deriveOptionsFromVariants(variants: ProductVariant[]): ProductOption[] {
  if (!variants || variants.length === 0) {
    return [];
  }

  const optionMap = new Map<number, { name: string; code?: string; values: Map<number, string> }>();

  variants.forEach((variant) => {
    (variant.attributes ?? []).forEach((attr) => {
      if (attr.attribute_id === null || attr.attribute_value_id === null) return;

      if (!optionMap.has(attr.attribute_id)) {
        optionMap.set(attr.attribute_id, {
          name: attr.name,
          code: attr.code ?? undefined,
          values: new Map<number, string>(),
        });
      }

      const option = optionMap.get(attr.attribute_id)!;
      if (!option.values.has(attr.attribute_value_id)) {
        option.values.set(attr.attribute_value_id, attr.value);
      }
    });
  });

  return Array.from(optionMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    code: data.code ?? '',
    values: Array.from(data.values.entries()).map(([valId, label]) => ({
      id: valId,
      label,
    } as ProductOptionValue)),
  }));
}
