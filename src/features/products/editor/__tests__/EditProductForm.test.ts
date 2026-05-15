/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), message: jest.fn() },
}));

jest.mock('@/hooks/products/useSaveProductContent', () => ({
  useSaveProductContent: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/products/useSaveProductStructure', () => ({
  useSaveProductStructure: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: () => ({ bypassNextNavigation: jest.fn() }),
}));

jest.mock('@/components/ui/button',   () => ({ Button: () => null }));
jest.mock('@/components/ui/tabs',     () => ({
  Tabs: () => null, TabsContent: () => null,
  TabsList: () => null, TabsTrigger: () => null,
}));
jest.mock('@/features/products/editor/tabs/ContentTab',   () => ({ ContentTab: () => null }));
jest.mock('@/features/products/editor/tabs/StructureTab', () => ({ StructureTab: () => null }));
jest.mock('@/features/products/editor/tabs/MediaTab',     () => ({ MediaTab: () => null }));
jest.mock('../components/DeleteProductButton', () => ({ __esModule: true, default: () => null }));

import type { AdminProduct } from '@/types/product';
import {
  buildDiscardState,
  buildRebasedEditorState,
  isEditorSaveBlocked,
} from '@/features/products/editor/components/EditProductForm';

function makeAdminProduct(
  overrides: Partial<AdminProduct> = {}
): AdminProduct {
  return {
    id:               1,
    store_id:         7,
    name:             'Test Product',
    slug:             'test-product',
    description:      'Description',
    price:            99,
    compare_at_price: null,
    cost_per_item:    null,
    sku:              null,
    barcode:          null,
    quantity:         10,
    track_quantity:   true,
    weight:           null,
    weight_unit:      null,
    status:           'draft',
    is_featured:      false,
    media:            [],
    tags:             [],
    variants: [
      {
        id:        101,
        sku:       'SKU-101',
        price:     10,
        quantity:  5,
        is_active: true,
        options:   [{ option_name: 'Color', option_value: 'Red' }],
      },
    ],
    options: [
      {
        id:       1,
        name:     'Color',
        position: 1,
        values:   [{ id: 10, value: 'Red' }],
      },
    ],
    category_id:       11,
    brand_id:          12,
    available_locales: ['en'],
    translations: {
      en: {
        locale:          'en',
        name:            'Test Product',
        slug:            'test-product',
        description:     'Description',
        seo_title:       null,
        seo_description: null,
        is_complete:     true,
      },
    },
    created_at: '2026-05-11T10:00:00.000Z',
    updated_at: '2026-05-11T10:00:00.000Z',
    ...overrides,
  };
}

describe('EditProductForm helpers', () => {
  it('rebases baseline so discard restores the latest saved state', () => {
    const savedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        tags:   [{ id: 5 }, { id: 9 }],
        media:  [{ id: 9, url: '/saved.png', alt: 'saved', position: 1 }],
        variants: [
          {
            id:        201,
            sku:       'SKU-SAVED',
            price:     25,
            quantity:  2,
            is_active: false,
            options:   [{ option_name: 'Color', option_value: 'Blue' }],
          },
        ],
        translations: {
          en: {
            locale:          'en',
            name:            'Saved Product',
            slug:            'saved-product',
            description:     'Saved description',
            seo_title:       null,
            seo_description: null,
            is_complete:     true,
          },
        },
      })
    );

    const discardState = buildDiscardState(savedState);

    expect(discardState.content).toEqual(savedState.content);
    expect(discardState.structure).toEqual(savedState.structure);
    expect(discardState.images).toEqual(savedState.media.images);
    expect(discardState.tags).toEqual([5, 9]);
    expect(discardState.contentDirty).toBe(false);
    expect(discardState.structureDirty).toBe(false);
    expect(discardState.mediaDirty).toBe(false);
    expect(discardState.tagsDirty).toBe(false);
    expect(discardState.validationErrors).toEqual([]);
  });

  it('blocks save after discard clears dirty state', () => {
    const discardState = buildDiscardState(
      buildRebasedEditorState(makeAdminProduct())
    );
    const dirtyAfterDiscard =
      discardState.contentDirty ||
      discardState.structureDirty ||
      discardState.mediaDirty    ||
      discardState.tagsDirty;

    expect(dirtyAfterDiscard).toBe(false);
    expect(
      isEditorSaveBlocked({
        isDirty:      dirtyAfterDiscard,
        isDiscarding: true,
        isPending:    false,
      })
    ).toBe(true);
    expect(
      isEditorSaveBlocked({
        isDirty:      true,
        isDiscarding: false,
        isPending:    false,
      })
    ).toBe(false);
  });

  it('preserves variant active state independently from product status', () => {
    const rebasedState = buildRebasedEditorState(
      makeAdminProduct({
        status: 'active',
        variants: [
          {
            id:        201,
            sku:       null,
            price:     10,
            quantity:  0,
            is_active: false,
            options:   [{ option_name: 'Color', option_value: 'Red' }],
          },
          {
            id:        202,
            sku:       'SKU-202',
            price:     10,
            quantity:  0,
            is_active: true,
            options:   [{ option_name: 'Color', option_value: 'Blue' }],
          },
        ],
        options: [
          {
            id:       1,
            name:     'Color',
            position: 1,
            values: [
              { id: 10, value: 'Red' },
              { id: 11, value: 'Blue' },
            ],
          },
        ],
      })
    );

    expect(rebasedState.content.status).toBe('active');
    expect(rebasedState.structure.variants[0].is_active).toBe(false);
    expect(rebasedState.structure.variants[1].is_active).toBe(true);
  });

  it('extracts tag ids from AdminProduct.tags stubs', () => {
    const rebasedState = buildRebasedEditorState(
      makeAdminProduct({ tags: [{ id: 1 }, { id: 7 }, { id: 42 }] })
    );
    expect(rebasedState.tags).toEqual([1, 7, 42]);
  });
});
