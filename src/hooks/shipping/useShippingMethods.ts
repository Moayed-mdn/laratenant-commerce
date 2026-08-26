/**
 * React Query hooks for shipping methods management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';
import type {
  ShippingMethod,
  CreateShippingMethodPayload,
  UpdateShippingMethodPayload,
} from '@/types/shipping';
import {
  getShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from '@/lib/api/shipping';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Fetch all shipping methods for a store.
 */
export function useShippingMethods(storeSlug: string) {
  return useQuery({
    queryKey: queryKeys.shipping.methods(storeSlug).lists(),
    queryFn: () => getShippingMethods(storeSlug),
    enabled: !!storeSlug,
  });
}

/**
 * Create a new shipping method.
 */
export function useCreateShippingMethod(storeSlug: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('shipping.messages');

  return useMutation<ShippingMethod, ApiError, CreateShippingMethodPayload>({
    mutationFn: (payload) => createShippingMethod(storeSlug, payload),
    onSuccess: (newMethod) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.methods(storeSlug).lists() });
      toast.success(t('methodCreated'));
    },
    onError: (error) => {
      logger.error('Failed to create shipping method', error);
      toast.error(error.message || t('methodCreateError'));
    },
  });
}

/**
 * Update a shipping method.
 */
export function useUpdateShippingMethod(storeSlug: string, methodId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('shipping.messages');

  return useMutation<ShippingMethod, ApiError, UpdateShippingMethodPayload>({
    mutationFn: (payload) => updateShippingMethod(storeSlug, methodId, payload),
    onSuccess: (updatedMethod) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.methods(storeSlug).lists() });
      toast.success(t('methodUpdated'));
    },
    onError: (error) => {
      logger.error('Failed to update shipping method', error);
      toast.error(error.message || t('methodUpdateError'));
    },
  });
}

/**
 * Delete a shipping method.
 */
export function useDeleteShippingMethod(storeSlug: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('shipping.messages');

  return useMutation<void, ApiError, string>({
    mutationFn: (methodId) => deleteShippingMethod(storeSlug, methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.methods(storeSlug).lists() });
      toast.success(t('methodDeleted'));
    },
    onError: (error) => {
      logger.error('Failed to delete shipping method', error);
      toast.error(error.message || t('methodDeleteError'));
    },
  });
}
