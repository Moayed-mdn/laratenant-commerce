/**
 * User types for the admin dashboard.
 */

/** User role union type */
export type UserRole = 'store_admin' | 'staff' | 'super_admin';

/** Admin user type */
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  store_id: number | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}
