/**
 * API functions for store-related endpoints.
 * Client-side only — uses apiClient.
 * 
 * Note: There is no GET /stores/{id} endpoint for regular users.
 * Store data comes from dashboard stats or user's store_id property.
 * This file is a placeholder for future store context functionality.
 */

import type { Store } from '@/types/store';

/**
 * Get store context by storeId.
 * 
 * TODO: Implement when dashboard is built (F.5).
 * The backend does not have a dedicated /stores/{id} endpoint.
 * Store info will be derived from dashboard stats response or user data.
 * 
 * @param storeId - The store ID from URL params
 * @returns Promise resolving to Store data
 */
export async function getStoreContext(storeId: string): Promise<Store> {
  // Placeholder implementation
  // Will be implemented in F.5 when dashboard stats endpoint is called
  throw new Error(
    `getStoreContext not yet implemented. Store data will come from dashboard stats endpoint for store: ${storeId}`
  );
}
