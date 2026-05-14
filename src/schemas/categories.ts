/**
 * Zod schemas for category filters and forms.
 */

import { z } from 'zod';

// ── URL filter schema ─────────────────────────────────────────────────────

export const CategoryFiltersSchema = z.object({
  is_active: z.enum(['all', 'true', 'false']).default('all'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type CategoryFilters = z.infer<typeof CategoryFiltersSchema>;

// ── Translation entry schema ──────────────────────────────────────────────

export const CategoryTranslationSchema = z.object({
  locale: z.enum(['en', 'ar']),
  name:   z.string().min(1, 'Name is required').max(255),
  slug:   z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers and hyphens only',
    ),
});

// ── Create / Update form schema ───────────────────────────────────────────

export const CategoryFormSchema = z.object({
  slug:         z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers and hyphens only',
    ),
  parent_id:    z.number().nullable().default(null),
  sort_order:   z.coerce.number().min(0).default(0),
  is_active:    z.boolean().default(true),
  translations: z
    .array(CategoryTranslationSchema)
    .min(1, 'At least one translation is required'),
});

// Output type (after coercion/transforms)
export type CategoryFormValues = z.output<typeof CategoryFormSchema>;

// Input type (before coercion)
export type CategoryFormInput = z.input<typeof CategoryFormSchema>;