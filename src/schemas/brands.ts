/**
 * Zod schemas for brand filters and forms.
 */

import { z } from 'zod';

// ── URL filter schema ─────────────────────────────────────────────────────

export const BrandFiltersSchema = z.object({
  is_active: z.enum(['all', 'true', 'false']).default('all'),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(15),
});

export type BrandFilters = z.infer<typeof BrandFiltersSchema>;

// ── Create / Update form schema ───────────────────────────────────────────

export const BrandFormSchema = z.object({
  name:        z.string().min(1, 'Name is required').max(255),
  slug:        z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers and hyphens only',
    ),
  description: z.string().max(5000).nullable().default(null),
  logo_url:    z
    .union([
      z.string().url('Must be a valid URL').max(2048),
      z.literal(''),
    ])
    .nullable()
    .default(null)
    .transform((v) => (v === '' ? null : v)),
  sort_order:  z.coerce.number().min(0).default(0),
  is_active:   z.boolean().default(true),
});

// Derive the output type (after transforms) for use in form handlers
export type BrandFormValues = z.output<typeof BrandFormSchema>;

// Input type (before transforms) for useForm generics
export type BrandFormInput = z.input<typeof BrandFormSchema>;