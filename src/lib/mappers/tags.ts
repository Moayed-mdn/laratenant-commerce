/**
 * Tag data mappers.
 * Transforms raw API types to view types for UI consumption.
 * Note: API returns translations as Record<locale, entry>; we convert to array.
 */

import type { TagRaw, TagListItemView, TagDetailView, TagTranslationRaw } from '@/types/tag';
import { formatDate } from '@/lib/utils/date';

function resolveName(
  translations: Record<string, TagTranslationRaw>,
  locale: string,
): string {
  return (
    translations[locale]?.name ??
    translations['en']?.name ??
    Object.values(translations)[0]?.name ??
    '—'
  );
}

function translationsToArray(
  translations: Record<string, TagTranslationRaw>,
): TagTranslationRaw[] {
  return Object.values(translations);
}

export function mapTagListItem(
  locale: string,
): (raw: TagRaw) => TagListItemView {
  return (raw: TagRaw) => ({
    id:                raw.id,
    storeId:           raw.store_id,
    type:              raw.type,
    color:             raw.color,
    isActive:          raw.is_active,
    name:              resolveName(raw.translations, locale),
    translationsCount: Object.keys(raw.translations).length,
    createdAt:         formatDate(raw.created_at),
  });
}

export function mapTagDetail(
  locale: string,
): (raw: TagRaw) => TagDetailView {
  return (raw: TagRaw) => ({
    id:           raw.id,
    storeId:      raw.store_id,
    type:         raw.type,
    color:        raw.color,
    isActive:     raw.is_active,
    name:         resolveName(raw.translations, locale),
    translations: translationsToArray(raw.translations),
    createdAt:    formatDate(raw.created_at),
    updatedAt:    formatDate(raw.updated_at),
  });
}