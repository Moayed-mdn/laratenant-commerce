/**
 * Zod schemas for order filters.
 * Validates URL params parsed by nuqs and form data.
 */

import { z } from 'zod';

export const OrderFiltersSchema = z.object({
  search: z.string().optional().default(''),
  status: z
    .enum(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .default('all'),
  payment_status: z.enum(['all', 'pending', 'paid', 'failed', 'refunded']).default('all'),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type OrderFilters = z.infer<typeof OrderFiltersSchema>;
