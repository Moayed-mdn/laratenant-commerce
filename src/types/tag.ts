/**
 * Tag types for the admin dashboard.
 *
 * Raw types  → exact shape returned by Laravel AdminTagResource.
 * View types → mapped shape consumed by UI components.
 */

// ── Raw API types ─────────────────────────────────────────────────────────────

export interface TagTranslationRaw {
  locale: string;
  name:   string;
  slug:   string | null;
}

/** Raw API shape — translations keyed by locale (e.g. { "en": {...}, "ar": {...} }) */
export interface TagRaw {
  id:           number;
  store_id:     number;
  type:         string | null;
  color:        string | null;
  is_active:    boolean;
  translations: Record<string, TagTranslationRaw>;
  created_at:   string;
  updated_at:   string;
}

// ── View types ────────────────────────────────────────────────────────────────

export interface TagListItemView {
  id:                number;
  storeId:           number;
  type:              string | null;
  color:             string | null;
  isActive:          boolean;
  name:              string;
  translationsCount: number;
  createdAt:         string;
}

export interface TagDetailView {
  id:           number;
  storeId:      number;
  type:         string | null;
  color:        string | null;
  isActive:     boolean;
  name:         string;
  translations: TagTranslationRaw[];
  createdAt:    string;
  updatedAt:    string;
}

// ── Form / Payload types ──────────────────────────────────────────────────────

export interface TagTranslationFormEntry {
  locale: 'en' | 'ar';
  name:   string;
  slug:   string | null;
}

export interface CreateTagPayload {
  type?:        string | null;
  color?:       string | null;
  is_active?:   boolean;
  translations: TagTranslationFormEntry[];
}

export interface UpdateTagPayload {
  type?:         string | null;
  color?:        string | null;
  is_active?:    boolean;
  translations?: TagTranslationFormEntry[];
}
