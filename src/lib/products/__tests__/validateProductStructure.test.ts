import { validateProductStructure } from '../validateProductStructure';
import type { ProductStructureState } from '@/types/product-editor';

describe('validateProductStructure', () => {
  it('should detect duplicate SKUs', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        { id: 1, sku: 'DUP', price: 10, quantity: 1, attributes: [] } as any,
        { id: 2, sku: 'dup', price: 20, quantity: 2, attributes: [] } as any,
      ],
    };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'variants.1.sku')).toBeDefined();
  });

  it('should detect negative prices and quantities', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        { id: 1, sku: 'S1', price: -10, quantity: -5, attributes: [] } as any,
      ],
    };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('should detect invalid date consistency', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        { 
          id: 1, 
          sku: 'S1', 
          price: 10, 
          quantity: 1, 
          manufacture_date: '2026-05-11',
          expiry_date: '2025-05-11',
          attributes: [] 
        } as any,
      ],
    };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'variants.0.expiry_date')).toBeDefined();
  });

  it('should validate attribute integrity when options exist', () => {
    const state: ProductStructureState = {
      options: [{ id: 1, name: 'Color', values: [] }],
      variants: [
        { id: 1, sku: 'S1', price: 10, quantity: 1, attributes: [] } as any,
      ],
    };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'variants.0.attributes')).toBeDefined();
  });

  it('should pass for valid structure', () => {
    const state: ProductStructureState = {
      options: [],
      variants: [
        { id: 1, sku: 'S1', price: 10, quantity: 1, attributes: [] } as any,
      ],
    };
    const result = validateProductStructure(state);
    expect(result.isValid).toBe(true);
  });
});
