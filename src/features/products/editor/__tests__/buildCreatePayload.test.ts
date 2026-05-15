import { buildCreatePayload } from '@/features/products/editor/payloads/buildCreatePayload';
import type { CreateProductWizardState } from '@/schemas/products';
import type { ProductVariant } from '@/types/product';

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeVariant(
  overrides: Partial<ProductVariant> & { id: number }
): ProductVariant {
  return {
    sku:              null,
    price:            29.99,
    quantity:         0,
    is_active:        true,
    manufacture_date: null,
    expiry_date:      null,
    batch_number:     null,
    options:          [],
    media:            [],
    ...overrides,
  };
}

function makeState(
  overrides: Partial<CreateProductWizardState> = {}
): CreateProductWizardState {
  return {
    content: {
      status:       'draft',
      categoryId:   null,
      categoryName: null,
      brandId:      null,
      brandName:    null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            'Test Product',
          slug:            'test-product',
          description:     'A description',
          seo_title:       null,
          seo_description: null,
        },
      },
    },
    structure: {
      options: [
        {
          id: 1, name: 'Color', position: 1,
          values: [{ id: 10, value: 'Red' }, { id: 11, value: 'Blue' }],
        },
      ],
      variants: [
        makeVariant({
          id:       -1,
          sku:      'RED-DEFAULT',
          price:    29.99,
          quantity: 5,
          options:  [{ option_name: 'Color', option_value: 'Red' }],
        }),
        makeVariant({
          id:       -2,
          sku:      null,
          price:    29.99,
          quantity: 0,
          options:  [{ option_name: 'Color', option_value: 'Blue' }],
        }),
      ],
    },
    media: { media: [] },
    tags:  [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('buildCreatePayload', () => {
  it('maps status from content', () => {
    expect(buildCreatePayload(makeState()).status).toBe('draft');
  });

  it('maps category_id from content.categoryId', () => {
    const state = makeState();
    state.content.categoryId = 5;
    expect(buildCreatePayload(state).category_id).toBe(5);
  });

  it('maps category_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).category_id).toBeNull();
  });

  it('maps brand_id from content.brandId', () => {
    const state = makeState();
    state.content.brandId = 3;
    expect(buildCreatePayload(state).brand_id).toBe(3);
  });

  it('maps brand_id as null when not selected', () => {
    expect(buildCreatePayload(makeState()).brand_id).toBeNull();
  });

  it('maps is_featured from content.isFeatured', () => {
    const state = makeState();
    state.content.isFeatured = true;
    expect(buildCreatePayload(state).is_featured).toBe(true);
  });

  it('defaults is_featured to false', () => {
    expect(buildCreatePayload(makeState()).is_featured).toBe(false);
  });

  it('maps translations array from locale-keyed record', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0]).toMatchObject({
      locale: 'en',
      name:   'Test Product',
      slug:   'test-product',
    });
  });

  it('maps canonical options with name, position, values[]', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0]).toEqual({
      name: 'Color', position: 1, values: ['Red', 'Blue'],
    });
  });

  it('maps variants with semantic options map', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants).toHaveLength(2);
    expect(payload.variants[0].options).toEqual({ Color: 'Red' });
    expect(payload.variants[1].options).toEqual({ Color: 'Blue' });
  });

  it('omits id for negative (unsaved) variants', () => {
    const payload = buildCreatePayload(makeState());
    expect(payload.variants[0]).not.toHaveProperty('id');
    expect(payload.variants[1]).not.toHaveProperty('id');
  });

  it('includes id for positive (existing) variants', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id: 999,
    });
    expect(buildCreatePayload(state).variants[0]).toHaveProperty('id', 999);
  });

  it('injects a default variant when no variants defined', () => {
    const state = makeState();
    state.structure.variants = [];
    state.structure.options  = [];
    const payload = buildCreatePayload(state);
    expect(payload.variants).toHaveLength(1);
    expect(payload.variants[0]).toMatchObject({
      sku: null, price: 0, quantity: 0, is_active: true, options: {},
    });
  });

  it('filters translations with empty name and slug', () => {
    const state = makeState();
    state.content.translations['ar'] = {
      locale: 'ar', name: '', slug: '',
      description: null, seo_title: null, seo_description: null,
    };
    const payload = buildCreatePayload(state);
    expect(payload.translations).toHaveLength(1);
    expect(payload.translations[0].locale).toBe('en');
  });

  it('filters options with empty name or no values', () => {
    const state = makeState();
    state.structure.options.push(
      { id: null, name: '',         position: 2, values: [{ id: null, value: 'X' }] },
      { id: null, name: 'Material', position: 3, values: [] }
    );
    const payload = buildCreatePayload(state);
    expect(payload.options).toHaveLength(1);
    expect(payload.options?.[0].name).toBe('Color');
  });

  it('filters empty option_name/option_value from variant map', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:      -1,
      options: [
        { option_name: 'Color', option_value: 'Red' },
        { option_name: '',      option_value: 'X'   },
        { option_name: 'Size',  option_value: ''    },
      ],
    });
    expect(buildCreatePayload(state).variants[0].options).toEqual({ Color: 'Red' });
  });

  it('passes manufacture and expiry dates through', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:               100,
      manufacture_date: '2026-01-01',
      expiry_date:      '2027-01-01',
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].manufacture_date).toBe('2026-01-01');
    expect(payload.variants[0].expiry_date).toBe('2027-01-01');
  });

  it('includes tag ids in payload when tags are set', () => {
    const state = makeState({ tags: [1, 2, 3] });
    expect(buildCreatePayload(state).tags).toEqual([1, 2, 3]);
  });

  it('omits tags from payload when tags array is empty', () => {
    const state = makeState({ tags: [] });
    expect(buildCreatePayload(state)).not.toHaveProperty('tags');
  });

  // ── Variant media ──────────────────────────────────────────────

  it('includes variant media in payload when images are present', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:    -1,
      media: [
        { id: -10, url: 'https://cdn.example.com/red.jpg', alt: 'Red', position: 0 },
      ],
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].media).toHaveLength(1);
    expect(payload.variants[0].media?.[0]).toMatchObject({
      url: 'https://cdn.example.com/red.jpg',
      alt: 'Red',
    });
  });

  it('omits variant media key when variant has no images', () => {
    const payload = buildCreatePayload(makeState());
    // All variants have media:[] → key should be absent
    expect(payload.variants[0]).not.toHaveProperty('media');
    expect(payload.variants[1]).not.toHaveProperty('media');
  });

  it('filters variant media images with empty URLs', () => {
    const state = makeState();
    state.structure.variants[0] = makeVariant({
      ...state.structure.variants[0],
      id:    -1,
      media: [
        { id: -10, url: '',                               alt: null, position: 0 },
        { id: -11, url: 'https://cdn.example.com/ok.jpg', alt: null, position: 1 },
      ],
    });
    const payload = buildCreatePayload(state);
    expect(payload.variants[0].media).toHaveLength(1);
    expect(payload.variants[0].media?.[0].url).toBe('https://cdn.example.com/ok.jpg');
  });
});
