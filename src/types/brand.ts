/**
 * Brand types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminBrandResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────

/** Brand list item — raw API shape */
export interface BrandListItem {
  id:             number;
  store_id:       number;
  name:           string;
  slug:           string;
  description:    string | null;
  logo_url:       string | null;
  sort_order:     number;
  is_active:      boolean;
  products_count: number;
  created_at:     string;
  updated_at:     string;
  deleted_at:     string | null;
}

/** Brand detail — raw API shape (same shape, kept separate for extensibility) */
export type BrandDetail = BrandListItem;

// ── View types ────────────────────────────────────────────────────────────

/** Brand list item — mapped for UI consumption */
export interface BrandListItemView {
  id:            number;
  storeId:       number;
  name:          string;
  slug:          string;
  description:   string | null;
  logoUrl:       string | null;
  sortOrder:     number;
  isActive:      boolean;
  productsCount: number;
  createdAt:     string;
  deletedAt:     string | null;
}

/** Brand detail — mapped for UI consumption */
export interface BrandDetailView extends BrandListItemView {
  updatedAt: string;
}

// ── Form types ────────────────────────────────────────────────────────────

/** Payload sent to POST /brands */
export interface CreateBrandPayload {
  name:        string;
  slug:        string;
  description: string | null;
  logo_url:    string | null;
  sort_order:  number;
  is_active:   boolean;
}

/** Payload sent to PATCH /brands/:id */
export type UpdateBrandPayload = CreateBrandPayload;

// ── Filter types ──────────────────────────────────────────────────────────

export interface BrandFilters {
  is_active: 'all' | 'true' | 'false';
  page:      number;
  perPage:   number;
}