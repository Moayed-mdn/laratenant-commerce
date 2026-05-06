/**
 * Zod schemas for user filters.
 * Validates URL params parsed by nuqs.
 */

import { z } from 'zod';

export const UserFiltersSchema = z.object({
  search: z.string().optional().default(''),
  role: z.enum(['all', 'store_admin', 'staff']).default('all'),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;
