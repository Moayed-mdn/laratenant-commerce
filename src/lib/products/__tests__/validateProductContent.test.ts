import { validateProductContent } from '../validateProductContent';
import type { ProductContentFormValues } from '@/types/product-editor';

describe('validateProductContent', () => {
  it('should detect missing translations', () => {
    const values: ProductContentFormValues = {
      status: 'active',
      categoryId: null,
      brandId: null,
      translations: {},
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'translations')).toBeDefined();
  });

  it('should detect missing name and slug in translations', () => {
    const values: ProductContentFormValues = {
      status: 'active',
      categoryId: null,
      brandId: null,
      translations: {
        en: { locale: 'en', name: '', slug: '', description: null, seo_title: null, seo_description: null },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'translations.en.name')).toBeDefined();
    expect(result.errors.find(e => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should detect invalid slug format', () => {
    const values: ProductContentFormValues = {
      status: 'active',
      categoryId: null,
      brandId: null,
      translations: {
        en: { locale: 'en', name: 'Test', slug: 'Invalid Slug!', description: null, seo_title: null, seo_description: null },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.field === 'translations.en.slug')).toBeDefined();
  });

  it('should pass for valid content', () => {
    const values: ProductContentFormValues = {
      status: 'active',
      categoryId: 1,
      brandId: 1,
      translations: {
        en: { locale: 'en', name: 'Product', slug: 'product-slug', description: 'Desc', seo_title: 'SEO', seo_description: 'SEO Desc' },
      },
    };
    const result = validateProductContent(values);
    expect(result.isValid).toBe(true);
  });
});
