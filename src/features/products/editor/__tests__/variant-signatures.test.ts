import { buildVariantSignature } from '@/features/products/editor/utils/variant-signatures';
import type { ProductVariantOption } from '@/types/product';

describe('buildVariantSignature', () => {
  it('creates a deterministic signature from option assignments', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: 'Large' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red|Size:Large');
  });

  it('is option-order independent (sorts by name)', () => {
    const opts1: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: 'Large' },
    ];
    const opts2: ProductVariantOption[] = [
      { option_name: 'Size', option_value: 'Large' },
      { option_name: 'Color', option_value: 'Red' },
    ];
    expect(buildVariantSignature(opts1)).toBe(
      buildVariantSignature(opts2)
    );
  });

  it('filters out entries with empty option_name', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: '', option_value: 'Large' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('filters out entries with empty option_value', () => {
    const options: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
      { option_name: 'Size', option_value: '' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('trims whitespace from names and values', () => {
    const options: ProductVariantOption[] = [
      { option_name: '  Color  ', option_value: '  Red  ' },
    ];
    expect(buildVariantSignature(options)).toBe('Color:Red');
  });

  it('returns empty string for empty array', () => {
    expect(buildVariantSignature([])).toBe('');
  });

  it('different values produce different signatures', () => {
    const opts1: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Red' },
    ];
    const opts2: ProductVariantOption[] = [
      { option_name: 'Color', option_value: 'Blue' },
    ];
    expect(buildVariantSignature(opts1)).not.toBe(
      buildVariantSignature(opts2)
    );
  });
});
