import { generateVariants, getNextNegativeId } from '../generateVariants';
import type { ProductOption, ProductVariant } from '@/types/product';

describe('generateVariants', () => {
  const options: ProductOption[] = [
    {
      id: 1,
      name: 'Color',
      code: 'color',
      values: [
        { id: 10, label: 'Red' },
        { id: 11, label: 'Blue' },
      ],
    },
    {
      id: 2,
      name: 'Size',
      code: 'size',
      values: [
        { id: 20, label: 'S' },
        { id: 21, label: 'M' },
      ],
    },
  ];

  it('should generate all combinations when no existing variants', () => {
    const variants = generateVariants(options, []);
    expect(variants).toHaveLength(4);
    expect(variants.every(v => v.id < 0)).toBe(true);
  });

  it('should preserve existing variants by signature', () => {
    const existing: ProductVariant[] = [
      {
        id: 100,
        sku: 'RED-S',
        price: 50,
        quantity: 5,
        is_active: true,
        attributes: [
          { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
          { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'S' },
        ],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);
    const preserved = variants.find(v => v.id === 100);
    expect(preserved).toBeDefined();
    expect(preserved?.sku).toBe('RED-S');
    expect(preserved?.price).toBe(50);
  });

  it('should remove stale variants', () => {
    const existing: ProductVariant[] = [
      {
        id: 101,
        sku: 'OLD-VARIANT',
        price: 50,
        quantity: 5,
        is_active: true,
        attributes: [
          { attribute_id: 1, attribute_value_id: 99, name: 'Color', value: 'Ghost' },
        ],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);
    expect(variants.find(v => v.id === 101)).toBeUndefined();
  });

  it('should assign stable negative IDs that do not collide', () => {
    const existing: ProductVariant[] = [{ id: -1 } as any, { id: 100 } as any];
    const nextId = getNextNegativeId(existing);
    expect(nextId).toBe(-2);
  });

  it('should handle empty options by returning empty array', () => {
    expect(generateVariants([], [])).toEqual([]);
  });

  it('should handle repeated generation cycles without duplication', () => {
    let variants = generateVariants(options, []);
    const firstCycleLength = variants.length;
    
    variants = generateVariants(options, variants);
    expect(variants).toHaveLength(firstCycleLength);
    
    // All should be preserved (none are new, none are stale)
    expect(variants.every(v => v.id < 0)).toBe(true);
  });
});
