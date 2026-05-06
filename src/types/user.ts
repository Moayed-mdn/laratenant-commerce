/**
 * User types for the admin dashboard.
 */

/** User role union type */
export type UserRole = 'super_admin' | 'store_admin' | 'staff';

/** Admin user type */
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  email_verified_at?: string | null;
  has_password: boolean;
  has_google_linked: boolean;
  store_id: number | null;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

/** User list item (raw API shape) */
export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  store_id: number;
  is_active: boolean;
  deleted_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/** User list item view (mapped for UI) */
export interface UserListItemView {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roleId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  createdAtRelative: string;
  initials: string;
}

/** User detail (raw API shape) */
export interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  store_id: number;
  is_active: boolean;
  deleted_at: string | null;
  email_verified_at: string | null;
  orders_count: number;
  created_at: string;
  updated_at: string;
}

/** User detail view (mapped for UI) */
export interface UserDetailView {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roleId: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  initials: string;
}

/** User filters state */
export interface UserFilters {
  search: string;
  role: 'all' | 'store_admin' | 'staff';
  status: 'all' | 'active' | 'inactive';
  page: number;
  perPage: number;
}
