import { buildStructurePayload } from '../buildStructurePayload';
import type { ProductStructureState } from '@/types/product-editor';

describe('buildStructurePayload', () => {
  it('should build a valid payload and filter out invalid attribute IDs', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1,
          sku: 'SKU1',
          price: 100,
          quantity: 10,
          is_active: true,
          attributes: [
            { attribute_id: 1, attribute_value_id: 10, name: 'Color', value: 'Red' },
            { attribute_id: null, attribute_value_id: 20, name: 'Size', value: 'S' } as any,
          ],
        } as any,
      ],
    };

    const payload = buildStructurePayload({ structure });
    
    expect(payload.sync_variants).toBe(true);
    expect(payload.variants).toHaveLength(1);
    expect(payload.variants?.[0].attributes).toHaveLength(1);
    expect(payload.variants?.[0].attributes?.[0]).toEqual({
      attribute_id: 1,
      attribute_value_id: 10,
    });
  });

  it('should handle empty variants', () => {
    const payload = buildStructurePayload({ structure: { options: [], variants: [] } });
    expect(payload.variants).toEqual([]);
  });
});
