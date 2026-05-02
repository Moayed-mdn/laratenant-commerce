/**
 * Zod schemas for product filters and forms.
 * Validates URL params parsed by nuqs and form data.
 */

import { z } from 'zod';

export const ProductFiltersSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['all', 'active', 'draft', 'archived']).default('all'),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export const ProductFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  cost_per_item: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(0),
  track_quantity: z.boolean().default(true),
  weight: z.coerce.number().min(0).optional().nullable(),
  weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
