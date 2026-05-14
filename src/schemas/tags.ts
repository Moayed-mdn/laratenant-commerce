/**
 * Zod schemas for tag filters and forms.
 */

import { z } from 'zod';

// ── Filter schema ─────────────────────────────────────────────────────────────

export const TagFiltersSchema = z.object({
  search:    z.string().default(''),
  type:      z.string().default(''),
  is_active: z.enum(['all', 'true', 'false']).default('all'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type TagFilters = z.infer<typeof TagFiltersSchema>;

// ── Translation entry schema ──────────────────────────────────────────────────

export const TagTranslationSchema = z.object({
  locale: z.enum(['en', 'ar']),
  name:   z.string().min(1, 'Name is required').max(100),
  slug:   z.string().max(100).nullable().optional(),
});

// ── Form schema ───────────────────────────────────────────────────────────────

export const TagFormSchema = z.object({
  type:         z.string().max(50).nullable().optional(),
  color:        z.string().max(50).nullable().optional(),
  is_active:    z.boolean().default(true),
  translations: z
    .array(TagTranslationSchema)
    .min(1, 'At least one translation is required'),
});

export type TagFormValues = z.output<typeof TagFormSchema>;
export type TagFormInput  = z.input<typeof TagFormSchema>;
