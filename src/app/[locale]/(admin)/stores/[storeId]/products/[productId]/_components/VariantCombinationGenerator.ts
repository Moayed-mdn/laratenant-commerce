'use client';

import type { ProductAttribute, ProductVariantInput } from '@/types/product';

function cartesian(values: string[][]): string[][] {
  if (values.length === 0) return [];
  return values.reduce<string[][]>(
    (acc, current) =>
      acc.flatMap((prefix) => current.map((value) => [...prefix, value])),
    [[]]
  );
}

export function generateVariantCombinations(
  attributes: ProductAttribute[],
  currentVariants: ProductVariantInput[]
): ProductVariantInput[] {
  const validAttributes = attributes
    .map((attr) => ({
      name: attr.name.trim(),
      values: attr.values.map((v) => v.value.trim()).filter(Boolean),
    }))
    .filter((attr) => attr.name && attr.values.length > 0);

  if (validAttributes.length === 0) {
    if (currentVariants.length > 0) return currentVariants;
    return [
      {
        key: 'default',
        label: 'Default',
        sku: null,
        barcode: null,
        price: 0,
        compare_at_price: null,
        cost_price: null,
        quantity: 0,
        low_stock_threshold: null,
        track_inventory: true,
        is_active: true,
        weight: null,
        weight_unit: null,
        attributes: [],
      },
    ];
  }

  const combinations = cartesian(validAttributes.map((attr) => attr.values));
  const byKey = new Map(currentVariants.map((variant) => [variant.key, variant]));

  return combinations.map((combination) => {
    const attrs = combination.map((value, index) => ({
      name: validAttributes[index].name,
      value,
    }));
    const key = attrs.map((attr) => `${attr.name}:${attr.value}`).join('|');
    const label = combination.join(' / ');
    const existing = byKey.get(key);

    if (existing) {
      return {
        ...existing,
        label,
        attributes: attrs,
      };
    }

    const base = currentVariants[0];
    return {
      key,
      label,
      sku: null,
      barcode: null,
      price: base?.price ?? 0,
      compare_at_price: base?.compare_at_price ?? null,
      cost_price: base?.cost_price ?? null,
      quantity: base?.quantity ?? 0,
      low_stock_threshold: base?.low_stock_threshold ?? null,
      track_inventory: base?.track_inventory ?? true,
      is_active: true,
      weight: base?.weight ?? null,
      weight_unit: base?.weight_unit ?? null,
      attributes: attrs,
    };
  });
}
