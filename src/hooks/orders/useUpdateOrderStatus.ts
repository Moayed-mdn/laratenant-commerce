'use client';

/**
 * Hook for updating order status.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '@/lib/api/orders';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';
import type { AdminOrder, OrderUpdatePayload } from '@/types/order';

export interface UseUpdateOrderStatusOptions {
  onSuccess?: (order: AdminOrder) => void;
  onError?: (error: ApiError) => void;
}

export function useUpdateOrderStatus(
  storeId: string,
  orderId: string,
  options?: UseUpdateOrderStatusOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderUpdatePayload) =>
      updateOrderStatus(storeId, orderId, payload),
    retry: 0,
    onSuccess: (data) => {
      // Invalidate order list
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(storeId).lists(),
      });
      // Invalidate this order's detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(storeId).detail(orderId),
      });
      logger.info('Order status updated', { orderId, status: data.status });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      logger.error('Update order status failed', { error, orderId });
      options?.onError?.(error as unknown as ApiError);
    },
  });
}
