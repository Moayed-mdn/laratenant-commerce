import { generateVariants, getNextNegativeId } from '@/features/products/editor/utils/generateVariants';
import type { ProductOption, ProductVariant } from '@/types/product';

const options: ProductOption[] = [
  {
    id: 1,
    name: 'Color',
    position: 1,
    values: [
      { id: 10, value: 'Red' },
      { id: 11, value: 'Blue' },
    ],
  },
  {
    id: 2,
    name: 'Size',
    position: 2,
    values: [
      { id: 20, value: 'S' },
      { id: 21, value: 'M' },
    ],
  },
];

describe('generateVariants', () => {
  it('generates all combinations when no existing variants', () => {
    const variants = generateVariants(options, []);
    expect(variants).toHaveLength(4);
    expect(variants.every((v) => v.id < 0)).toBe(true);
  });

  it('each generated variant has correct options assignments', () => {
    const variants = generateVariants(options, []);
    const signatures = variants.map((v) =>
      v.options
        .slice()
        .sort((a, b) => a.option_name.localeCompare(b.option_name))
        .map((o) => `${o.option_name}:${o.option_value}`)
        .join('|')
    );
    expect(signatures).toContain('Color:Red|Size:S');
    expect(signatures).toContain('Color:Red|Size:M');
    expect(signatures).toContain('Color:Blue|Size:S');
    expect(signatures).toContain('Color:Blue|Size:M');
  });

  it('preserves existing variants by signature', () => {
    const existing: ProductVariant[] = [
      {
        id: 100,
        sku: 'RED-S',
        price: 50,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
        media: [],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);

    const preserved = variants.find((v) => v.id === 100);
    expect(preserved).toBeDefined();
    expect(preserved?.sku).toBe('RED-S');
    expect(preserved?.price).toBe(50);
  });

  it('removes stale variants not matching any current combination', () => {
    const existing: ProductVariant[] = [
      {
        id: 101,
        sku: 'OLD-VARIANT',
        price: 50,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Ghost' },
        ],
        media: [],
      },
    ];

    const variants = generateVariants(options, existing);
    expect(variants).toHaveLength(4);
    expect(variants.find((v) => v.id === 101)).toBeUndefined();
  });

  it('assigns stable negative IDs that do not collide', () => {
    const existing = [{ id: -1 } as ProductVariant, { id: 100 } as ProductVariant];
    const nextId = getNextNegativeId(existing);
    expect(nextId).toBe(-2);
  });

  it('handles empty options by returning empty array', () => {
    expect(generateVariants([], [])).toEqual([]);
  });

  it('handles repeated generation cycles without duplication', () => {
    let variants = generateVariants(options, []);
    const firstCycleLength = variants.length;

    variants = generateVariants(options, variants);
    expect(variants).toHaveLength(firstCycleLength);
    // All should be preserved — no new IDs allocated
    expect(variants.every((v) => v.id < 0)).toBe(true);
  });

  it('guards against duplicate signatures from malformed option states', () => {
    const malformedOptions: ProductOption[] = [
      {
        id: 1,
        name: 'Color',
        position: 1,
        values: [
          { id: 10, value: 'Red' },
          { id: 10, value: 'Red' }, // duplicate
        ],
      },
      {
        id: 2,
        name: 'Size',
        position: 2,
        values: [
          { id: 20, value: 'S' },
          { id: 20, value: 'S' }, // duplicate
        ],
      },
    ];

    const variants = generateVariants(malformedOptions, []);
    expect(variants).toHaveLength(1);
    expect(variants[0]?.options).toEqual(
      expect.arrayContaining([
        { option_name: 'Color', option_value: 'Red' },
        { option_name: 'Size', option_value: 'S' },
      ])
    );
  });

  it('new variants inherit price from first existing variant', () => {
    const existing: ProductVariant[] = [
      {
        id: 100,
        sku: 'RED-S',
        price: 75,
        quantity: 3,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
        media: [],
      },
    ];

    const variants = generateVariants(options, existing);
    const newVariants = variants.filter((v) => v.id < 0);
    expect(newVariants.every((v) => v.price === 75)).toBe(true);
  });
});
