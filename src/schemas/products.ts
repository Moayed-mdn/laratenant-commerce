/**
 * Zod schemas for product filters and create wizard validation.
 *
 * Design note — two-type-system rule:
 * Zod schemas are used for RUNTIME VALIDATION only.
 * Wizard STATE types use the canonical domain types from types/product.ts
 * (ProductVariant, ProductOption) directly.
 */

import { z } from 'zod';
import type { ProductOption, ProductVariant } from '@/types/product';

// ── List filters ────────────────────────────────────────────────────────────

export const ProductFiltersSchema = z.object({
  search:  z.string().optional().default(''),
  status:  z.enum(['all', 'active', 'draft']).default('all'),
  page:    z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

// ── Create wizard — Step 1: Content ────────────────────────────────────────

export const ProductTranslationSchema = z.object({
  locale:          z.string().min(1),
  name:            z.string().min(1, 'Name is required').max(255),
  slug:            z.string().min(1, 'Slug is required').max(255),
  description:     z.string().nullable().default(null),
  seo_title:       z.string().max(255).nullable().default(null),
  seo_description: z.string().max(1000).nullable().default(null),
});

export type ProductTranslationFormData = z.infer<typeof ProductTranslationSchema>;

export const CreateProductContentSchema = z.object({
  status:       z.enum(['active', 'draft']).default('draft'),
  categoryId:   z.number().int().nullable().default(null),
  brandId:      z.number().int().nullable().default(null),
  isFeatured:   z.boolean().default(false),
  translations: z.record(z.string(), ProductTranslationSchema),
});

export type CreateProductContentData = z.infer<typeof CreateProductContentSchema>;

// ── Create wizard — Step 2: Structure ──────────────────────────────────────

// Runtime-only validation schemas (not used as state types).
export const CreateProductVariantValidationSchema = z.object({
  id:       z.number(),
  price:    z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

export const CreateProductOptionValidationSchema = z.object({
  name:   z.string().min(1, 'Option name is required'),
  values: z.array(z.object({ value: z.string().min(1) })).min(1),
});

/**
 * Wizard Step 2 state type.
 * Uses canonical domain types directly — NOT Zod-inferred types.
 */
export interface CreateProductStructureData {
  options:  ProductOption[];
  variants: ProductVariant[];
}

// ── Full wizard state ───────────────────────────────────────────────────────

export interface CreateProductWizardState {
  content:   CreateProductContentData;
  structure: CreateProductStructureData;
}
