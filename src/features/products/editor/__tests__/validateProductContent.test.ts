import { validateProductContent } from '@/features/products/editor/validators/validateProductContent';
import type { ProductContentFormValues } from '@/features/products/editor/types/product-editor';

describe('validateProductContent', () => {
  it('should detect missing translations', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {},
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations')).toBeDefined();
  });

  it('should detect missing name and slug in translations', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            '',
          slug:            '',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations.en.name')).toBeDefined();
    expect(result.errors.find((e) => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should detect invalid slug format', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        en: {
          locale:          'en',
          name:            'Test',
          slug:            'Invalid Slug!',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should allow unicode slugs (e.g. Arabic) with hyphens', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   null,
      brandId:      null,
      isFeatured:   false,
      translations: {
        ar: {
          locale:          'ar',
          name:            'ساعة',
          slug:            'ساعة-حائط-عصرية',
          description:     null,
          seo_title:       null,
          seo_description: null,
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(true);
  });

  it('should pass for valid content', () => {
    const values: ProductContentFormValues = {
      status:       'active',
      categoryId:   1,
      brandId:      1,
      isFeatured:   true,
      translations: {
        en: {
          locale:          'en',
          name:            'Product',
          slug:            'product-slug',
          description:     'Desc',
          seo_title:       'SEO',
          seo_description: 'SEO Desc',
        },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(true);
  });
});
