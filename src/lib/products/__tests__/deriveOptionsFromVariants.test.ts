import { deriveOptionsFromVariants } from '../deriveOptionsFromVariants';
import type { ProductVariant } from '@/types/product';

describe('deriveOptionsFromVariants', () => {
  it('derives options and values from variant option assignments', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
      {
        id: 2,
        sku: null,
        price: 10,
        quantity: 5,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Blue' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);

    expect(options).toHaveLength(2);

    const colorOption = options.find((o) => o.name === 'Color');
    expect(colorOption).toBeDefined();
    expect(colorOption?.values.map((v) => v.value)).toContain('Red');
    expect(colorOption?.values.map((v) => v.value)).toContain('Blue');
    expect(colorOption?.id).toBeNull();

    const sizeOption = options.find((o) => o.name === 'Size');
    expect(sizeOption).toBeDefined();
    expect(sizeOption?.values).toHaveLength(1);
    expect(sizeOption?.values[0].value).toBe('S');
  });

  it('returns empty array for empty variants', () => {
    expect(deriveOptionsFromVariants([])).toEqual([]);
  });

  it('skips entries with empty option_name or option_value', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [
          { option_name: '', option_value: 'Red' },
          { option_name: 'Size', option_value: '' },
          { option_name: 'Color', option_value: 'Blue' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options).toHaveLength(1);
    expect(options[0].name).toBe('Color');
  });

  it('deduplicates values for the same option across variants', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [{ option_name: 'Size', option_value: 'S' }],
      },
      {
        id: 2,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [{ option_name: 'Size', option_value: 'S' }],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options[0].values).toHaveLength(1);
  });

  it('assigns positions by insertion order', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        sku: null,
        price: 10,
        quantity: 0,
        is_active: true,
        options: [
          { option_name: 'Color', option_value: 'Red' },
          { option_name: 'Size', option_value: 'S' },
        ],
      },
    ];

    const options = deriveOptionsFromVariants(variants);
    expect(options[0].position).toBe(1);
    expect(options[1].position).toBe(2);
  });
});
