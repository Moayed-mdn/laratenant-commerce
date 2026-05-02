/**
 * Store types for the admin dashboard.
 */

/** User store type (returned after login) */
export interface UserStore {
  id: number;
  name: string;
  slug: string;
  role: 'store_admin' | 'staff' | 'super_admin';
}

/** Store status union type */
export type StoreStatus = 'active' | 'inactive';

/** Store type */
export interface Store {
  id: number;
  name: string;
  slug: string;
  domain: string | null;
  currency: string;
  timezone: string;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
}
