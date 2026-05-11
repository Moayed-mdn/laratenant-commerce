import type { ProductUpdatePayload, ProductVariantAttribute } from '@/types/product';

import type { ProductStructureState } from '@/types/product-editor';

type BuildStructurePayloadInput = {
  structure: ProductStructureState;
};

export function buildStructurePayload(
  input: BuildStructurePayloadInput
): ProductUpdatePayload & { sync_variants: true } {
  const { structure } = input;

  const hasNumericAttributeIds = (
    a: ProductVariantAttribute
  ): a is ProductVariantAttribute & { attribute_id: number; attribute_value_id: number } =>
    typeof a.attribute_id === 'number' && 
    typeof a.attribute_value_id === 'number' &&
    !isNaN(a.attribute_id) &&
    !isNaN(a.attribute_value_id);

  return {
    sync_variants: true,
    variants: (structure.variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku ?? '',
      price: v.price,
      quantity: v.quantity,
      is_active: v.is_active,
      manufacture_date: v.manufacture_date ?? null,
      expiry_date: v.expiry_date ?? null,
      batch_number: v.batch_number ?? null,
      attributes: (v.attributes ?? [])
        .filter(hasNumericAttributeIds)
        .map((a) => ({
          attribute_id: a.attribute_id,
          attribute_value_id: a.attribute_value_id,
        })),
    })),
  };
}
