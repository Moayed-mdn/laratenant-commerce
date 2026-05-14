/**
 * Category types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminCategoryResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────

/** Single translation entry (one locale) */
export interface CategoryTranslationRaw {
  locale: string;
  name:   string;
  slug:   string;
}

/** Parent reference embedded in detail response */
export interface CategoryParentRaw {
  id:   number;
  slug: string;
  name: string;
}

/** Category list item — raw API shape */
export interface CategoryListItem {
  id:             number;
  store_id:       number;
  slug:           string;
  parent_id:      number | null;
  sort_order:     number;
  is_active:      boolean;
  /** Current-locale translation (may be null if not yet translated) */
  translation:    CategoryTranslationRaw | null;
  products_count: number;
  created_at:     string;
  updated_at:     string;
  deleted_at:     string | null;
}

/** Category detail — raw API shape (superset of list item) */
export interface CategoryDetail extends CategoryListItem {
  /** All locale translations */
  translations: CategoryTranslationRaw[];
  parent:       CategoryParentRaw | null;
  children:     CategoryListItem[];
  breadcrumb:   Array<{ id: number; name: string; slug: string }>;
}

// ── View types ────────────────────────────────────────────────────────────

/** Category list item — mapped for UI consumption */
export interface CategoryListItemView {
  id:            number;
  storeId:       number;
  slug:          string;
  parentId:      number | null;
  sortOrder:     number;
  isActive:      boolean;
  /** Resolved display name (current locale, fallback to slug) */
  name:          string;
  productsCount: number;
  createdAt:     string;
  deletedAt:     string | null;
}

/** Category detail — mapped for UI consumption */
export interface CategoryDetailView {
  id:            number;
  storeId:       number;
  slug:          string;
  parentId:      number | null;
  sortOrder:     number;
  isActive:      boolean;
  name:          string;
  productsCount: number;
  createdAt:     string;
  updatedAt:     string;
  deletedAt:     string | null;
  translations:  CategoryTranslationRaw[];
  parent:        CategoryParentRaw | null;
  children:      CategoryListItemView[];
  breadcrumb:    Array<{ id: number; name: string; slug: string }>;
}

// ── Form types ────────────────────────────────────────────────────────────

/** Translation entry used in create/update form */
export interface CategoryTranslationFormEntry {
  locale: 'en' | 'ar';
  name:   string;
  slug:   string;
}

/** Payload sent to POST /categories */
export interface CreateCategoryPayload {
  slug:         string;
  parent_id:    number | null;
  sort_order:   number;
  is_active:    boolean;
  translations: CategoryTranslationFormEntry[];
}

/** Payload sent to PATCH /categories/:id */
export interface UpdateCategoryPayload extends CreateCategoryPayload {}

// ── Filter types ──────────────────────────────────────────────────────────

export interface CategoryFilters {
  is_active: 'all' | 'true' | 'false';
  page:      number;
  perPage:   number;
}
