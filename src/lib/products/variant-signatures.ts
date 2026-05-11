import type { ProductVariantAttribute } from '@/types/product';

/**
 * Builds a deterministic, attribute-order-independent signature for a variant.
 * This signature is used to identify variants across regeneration cycles.
 * 
 * Logic:
 * 1. Sort attributes by attribute_id (numeric).
 * 2. Join as id:value_id pairs.
 */
export function buildVariantSignature(
  attributes: ProductVariantAttribute[]
): string {
  return [...(attributes ?? [])]
    .filter((a) => a.attribute_id !== null && a.attribute_value_id !== null)
    .sort((a, b) => (a.attribute_id as number) - (b.attribute_id as number))
    .map((attr) => `${attr.attribute_id}:${attr.attribute_value_id}`)
    .join('|');
}
