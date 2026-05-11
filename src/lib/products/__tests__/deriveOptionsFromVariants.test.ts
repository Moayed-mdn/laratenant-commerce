import { deriveOptionsFromVariants } from '../deriveOptionsFromVariants';
import type { ProductVariant } from '@/types/product';

describe('deriveOptionsFromVariants', () => {
  it('should derive options and values from variants correctly', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        attributes: [
          { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red', label: 'Red', code: 'color' },
          { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'S', label: 'S', code: 'size' },
        ],
      } as any,
      {
        id: 2,
        attributes: [
          { attribute_id: 1, attribute_value_id: 11, name: 'Color', value: 'Blue', label: 'Blue', code: 'color' },
          { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'S', label: 'S', code: 'size' },
        ],
      } as any,
    ];

    const options = deriveOptionsFromVariants(variants);
    
    expect(options).toHaveLength(2);
    
    const colorOption = options.find(o => o.id === 1);
    expect(colorOption?.name).toBe('Color');
    expect(colorOption?.values).toHaveLength(2);
    expect(colorOption?.values.map(v => v.id)).toContain(10);
    expect(colorOption?.values.map(v => v.id)).toContain(11);

    const sizeOption = options.find(o => o.id === 2);
    expect(sizeOption?.name).toBe('Size');
    expect(sizeOption?.values).toHaveLength(1);
    expect(sizeOption?.values[0].id).toBe(20);
  });

  it('should return empty array if no variants', () => {
    expect(deriveOptionsFromVariants([])).toEqual([]);
  });

  it('should skip attributes with null IDs', () => {
    const variants: ProductVariant[] = [
      {
        id: 1,
        attributes: [
          { attribute_id: null, attribute_value_id: 10, name: 'Color', value: 'Red' },
        ],
      } as any,
    ];
    expect(deriveOptionsFromVariants(variants)).toEqual([]);
  });
});
