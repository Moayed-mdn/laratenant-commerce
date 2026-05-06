/**
 * User data mappers.
 * Transforms raw API types to view types for UI consumption.
 */

import type {
  UserListItem,
  UserListItemView,
  UserDetail,
  UserDetailView,
} from '@/types/user';
import { formatDate, formatRelative } from '@/lib/utils/date';

/**
 * Map user list item from raw API shape to view shape.
 */
export function mapUserListItem(raw: UserListItem): UserListItemView {
  // Compute initials: first letter of each word in name, max 2
  const initials = raw.name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    roleId: raw.role,
    isActive: raw.is_active,
    isVerified: raw.email_verified_at !== null,
    createdAt: formatDate(raw.created_at),
    createdAtRelative: formatRelative(raw.created_at),
    initials,
  };
}

/**
 * Map user detail from raw API shape to view shape.
 */
export function mapUserDetail(raw: UserDetail): UserDetailView {
  const initials = raw.name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    roleId: raw.role,
    isActive: raw.is_active,
    isVerified: raw.email_verified_at !== null,
    verifiedAt: raw.email_verified_at ? formatDate(raw.email_verified_at) : null,
    createdAt: formatDate(raw.created_at),
    updatedAt: formatDate(raw.updated_at),
    initials,
  };
}
