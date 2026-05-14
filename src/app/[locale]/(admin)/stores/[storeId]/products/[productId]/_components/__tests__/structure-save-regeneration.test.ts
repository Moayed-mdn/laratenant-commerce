/// <reference types="jest" />

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), message: jest.fn() },
}));

jest.mock('@/lib/navigation', () => ({
  Link: () => null,
  redirect: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  getPathname: jest.fn(),
}));

jest.mock('@/lib/products/generateVariants', () => ({
  generateVariants: jest.fn(),
}));

import { generateVariants } from '@/lib/products/generateVariants';
import { buildNextStructureForSave } from '../EditProductForm';
import type { ProductStructureState } from '@/types/product-editor';

describe('structure save regeneration', () => {
  it('regenerates variants from current options before save serialization', () => {
    const structure: ProductStructureState = {
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
          id: 101,
          sku: 'SKU-OLD',
          price: 10,
          quantity: 5,
          is_active: true,
          options: [],
        },
      ],
    };

    const regenerated = [
      {
        id: 102,
        sku: 'SKU-NEW',
        price: 10,
        quantity: 5,
        is_active: true,
        options: [{ option_name: 'Color', option_value: 'Red' }],
      },
    ];

    (generateVariants as jest.Mock).mockReturnValue(regenerated);

    const nextStructure = buildNextStructureForSave(structure);

    expect(generateVariants).toHaveBeenCalledTimes(1);
    expect(generateVariants).toHaveBeenCalledWith(
      structure.options,
      structure.variants
    );
    expect(nextStructure.variants).toBe(regenerated);
  });
});
