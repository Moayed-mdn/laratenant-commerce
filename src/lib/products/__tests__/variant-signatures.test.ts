import { buildVariantSignature } from '../variant-signatures';
import type { ProductVariantAttribute } from '@/types/product';

describe('buildVariantSignature', () => {
  it('should create a deterministic signature from attributes', () => {
    const attrs: ProductVariantAttribute[] = [
      { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
      { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'Large' },
    ];
    expect(buildVariantSignature(attrs)).toBe('1:10|2:20');
  });

  it('should be attribute order independent', () => {
    const attrs1: ProductVariantAttribute[] = [
      { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
      { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'Large' },
    ];
    const attrs2: ProductVariantAttribute[] = [
      { attribute_id: 2, attribute_value_id: 20, name: 'Size', value: 'Large' },
      { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
    ];
    expect(buildVariantSignature(attrs1)).toBe(buildVariantSignature(attrs2));
  });

  it('should handle null IDs by filtering them out', () => {
    const attrs: ProductVariantAttribute[] = [
      { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
      { attribute_id: null, attribute_value_id: 20, name: 'Size', value: 'Large' } as any,
    ];
    expect(buildVariantSignature(attrs)).toBe('1:10');
  });

  it('should handle empty attributes', () => {
    expect(buildVariantSignature([])).toBe('');
  });
});
