import { validateProductStructure } from '../validateProductStructure';
import type { ProductStructureState } from '@/types/product-editor';

describe('validateProductStructure', () => {
  // ── Valid states ─────────────────────────────────────────────────────────

  it('passes for a valid structure with no options', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'SKU-A',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes when all variants have correct option assignments', () => {
    const state: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: 10, value: 'Red' }],
        },
      ],
      variants: [
        {
          id: 1,
          sku: 'SKU-A',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [{ option_name: 'Color', option_value: 'Red' }],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // ── SKU uniqueness ────────────────────────────────────────────────────────

  it('fails for duplicate SKUs', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'DUPE',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
        {
          id: 2,
          sku: 'DUPE',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('sku'))).toBe(true);
  });

  it('treats SKU comparison as case-insensitive', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'sku-abc',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
        {
          id: 2,
          sku: 'SKU-ABC',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
  });

  // ── Price ─────────────────────────────────────────────────────────────────

  it('fails for negative price', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: -1,
          quantity: 0,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('price'))).toBe(true);
  });

  // ── Quantity ──────────────────────────────────────────────────────────────

  it('fails for negative quantity', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: -5,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.includes('quantity'))).toBe(true);
  });

  // ── Date consistency ──────────────────────────────────────────────────────

  it('fails when expiry_date is before manufacture_date', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          manufacture_date: '2026-06-01',
          expiry_date: '2026-01-01',
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.field.includes('expiry_date'))
    ).toBe(true);
  });

  it('passes when expiry_date is after manufacture_date', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          manufacture_date: '2026-01-01',
          expiry_date: '2026-12-31',
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });

  // ── Option coverage ───────────────────────────────────────────────────────

  it('fails when a variant is missing an option assignment', () => {
    const state: ProductStructureState = {
      options: [
        {
          id: 1,
          name: 'Color',
          position: 1,
          values: [{ id: 10, value: 'Red' }],
        },
        {
          id: 2,
          name: 'Size',
          position: 2,
          values: [{ id: 20, value: 'S' }],
        },
      ],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          // Only Color assigned, Size missing
          options: [{ option_name: 'Color', option_value: 'Red' }],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.field.includes('options'))
    ).toBe(true);
    expect(result.errors[0].message).toContain('Size');
  });

  it('ignores option coverage check when no options defined', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: null,
          price: 10,
          quantity: 0,
          is_active: true,
          options: [],
        },
      ],
    };

    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('passes for empty variants array', () => {
    const state: ProductStructureState = { options: [], variants: [] };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });
});
