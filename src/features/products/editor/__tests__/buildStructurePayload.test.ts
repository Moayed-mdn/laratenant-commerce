import { buildStructurePayload } from '@/features/products/editor/payloads/buildStructurePayload';
import type { ProductStructureState } from '@/features/products/editor/types/product-editor';

describe('buildStructurePayload', () => {
  it('builds sync_variants flag, options, and variant semantic maps', () => {
    const structure: ProductStructureState = {
      options: [
        {
          id: 1, name: 'Color', position: 1,
          values: [{ id: 10, value: 'Red' }, { id: 11, value: 'Blue' }],
        },
        {
          id: 2, name: 'Size', position: 2,
          values: [{ id: 20, value: 'S' }],
        },
      ],
      variants: [
        {
          id: 100, sku: 'RED-S', price: 29.99, quantity: 5,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: 'Size',  option_value: 'S'   },
          ],
        },
        {
          id: -1, sku: null, price: 29.99, quantity: 0,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Blue' },
            { option_name: 'Size',  option_value: 'S'    },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.sync_variants).toBe(true);

    expect(payload.options).toHaveLength(2);
    expect(payload.options?.[0]).toEqual({ name: 'Color', position: 1, values: ['Red', 'Blue'] });
    expect(payload.options?.[1]).toEqual({ name: 'Size',  position: 2, values: ['S'] });

    expect(payload.variants).toHaveLength(2);

    const v1 = payload.variants?.[0];
    expect(v1?.id).toBe(100);
    expect(v1?.sku).toBe('RED-S');
    expect(v1?.options).toEqual({ Color: 'Red', Size: 'S' });
    expect(v1?.media).toEqual([]);

    const v2 = payload.variants?.[1];
    expect(v2?.id).toBeUndefined();
    expect(v2?.options).toEqual({ Color: 'Blue', Size: 'S' });
  });

  it('includes variant media images in payload', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id:        1,
          sku:       'SKU-A',
          price:     10,
          quantity:  5,
          is_active: true,
          options:   [],
          media: [
            { id: 50, url: 'https://cdn.example.com/red.jpg', alt: 'Red shirt', position: 0 },
            { id: 51, url: 'https://cdn.example.com/red2.jpg', alt: null,       position: 1 },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].media).toHaveLength(2);
    expect(payload.variants?.[0].media?.[0]).toMatchObject({
      id:  50,
      url: 'https://cdn.example.com/red.jpg',
      alt: 'Red shirt',
    });
    expect(payload.variants?.[0].media?.[1]).toMatchObject({
      id:  51,
      url: 'https://cdn.example.com/red2.jpg',
      alt: null,
    });
  });

  it('omits negative image IDs (unsaved) from variant media payload', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id:        1,
          sku:       'SKU-B',
          price:     10,
          quantity:  0,
          is_active: true,
          options:   [],
          media: [
            { id: -1, url: 'https://cdn.example.com/new.jpg', alt: null, position: 0 },
          ],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    const mediaItem = payload.variants?.[0].media?.[0];
    expect(mediaItem).toBeDefined();
    expect(mediaItem).not.toHaveProperty('id');
    expect(mediaItem?.url).toBe('https://cdn.example.com/new.jpg');
  });

  it('sends empty media array when variant has no images (clears existing)', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1, sku: null, price: 10, quantity: 0,
          is_active: true, options: [], media: [],
        },
      ],
    };

    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].media).toEqual([]);
  });

  it('filters options with empty names', () => {
    const structure: ProductStructureState = {
      options: [
        { id: null, name: '',      position: 1, values: [{ id: null, value: 'Red' }] },
        { id: 1,    name: 'Color', position: 2, values: [{ id: 10,   value: 'Red' }] },
      ],
      variants: [],
    };
    const payload = buildStructurePayload({ structure });
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters options with no valid values', () => {
    const structure: ProductStructureState = {
      options: [
        { id: 1, name: 'Color', position: 1, values: [{ id: null, value: '  ' }] },
      ],
      variants: [],
    };
    const payload = buildStructurePayload({ structure });
    expect(payload.options).toHaveLength(0);
  });

  it('filters out empty option_name/option_value from variant map', () => {
    const structure: ProductStructureState = {
      options: [],
      variants: [
        {
          id: 1, sku: 'SKU1', price: 10, quantity: 0,
          is_active: true, media: [],
          options: [
            { option_name: 'Color', option_value: 'Red' },
            { option_name: '',      option_value: 'Large' },
            { option_name: 'Size',  option_value: '' },
          ],
        },
      ],
    };
    const payload = buildStructurePayload({ structure });
    expect(payload.variants?.[0].options).toEqual({ Color: 'Red' });
  });

  it('handles empty variants', () => {
    const payload = buildStructurePayload({ structure: { options: [], variants: [] } });
    expect(payload.variants).toEqual([]);
    expect(payload.options).toEqual([]);
  });
});
