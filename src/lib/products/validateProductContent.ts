import type { ProductContentFormValues } from '@/types/product-editor';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates product content (translations, slugs, SEO).
 * Returns a structured ValidationResult.
 */
export function validateProductContent(
  values: ProductContentFormValues
): ValidationResult {
  const errors: ValidationError[] = [];

  const translations = Object.values(values.translations ?? {});
  
  if (translations.length === 0) {
    errors.push({ field: 'translations', message: 'At least one translation is required.' });
  }

  translations.forEach((t) => {
    const prefix = `translations.${t.locale}`;
    
    if (!t.name?.trim()) {
      errors.push({ field: `${prefix}.name`, message: 'Product name is required.' });
    }

    if (!t.slug?.trim()) {
      errors.push({ field: `${prefix}.slug`, message: 'Slug is required.' });
    } else if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(t.slug)) {
      errors.push({ field: `${prefix}.slug`, message: 'Slug can only contain letters, numbers, and hyphens.' });
    }

    if (t.seo_title && t.seo_title.length > 70) {
      errors.push({ field: `${prefix}.seo_title`, message: 'SEO title should not exceed 70 characters.' });
    }

    if (t.seo_description && t.seo_description.length > 160) {
      errors.push({ field: `${prefix}.seo_description`, message: 'SEO description should not exceed 160 characters.' });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
