'use client';

import { useMutation } from '@tanstack/react-query';

import { updateProduct }       from '@/lib/api/products';
import queryClient             from '@/lib/queryClient';
import { queryKeys }           from '@/lib/queryKeys';
import { logger }              from '@/lib/logger';
import { buildContentPayload } from '@/features/products/editor/payloads/buildContentPayload';

import type { AdminProduct }             from '@/types/product';
import type { ApiError }                 from '@/types/api';
import type { ProductContentFormValues } from '@/features/products/editor/types/product-editor';

export interface UseSaveProductContentOptions {
  onSuccess?: (product: AdminProduct) => void;
  onError?:   (error: ApiError)      => void;
}

/** Mutation input — content values plus the current tag selection. */
export interface SaveContentInput {
  content: ProductContentFormValues;
  tags:    number[];
}

export function useSaveProductContent(
  storeId:   string,
  productId: string,
  options?:  UseSaveProductContentOptions
) {
  return useMutation<AdminProduct, ApiError, SaveContentInput>({
    mutationFn: ({ content, tags }) =>
      updateProduct(
        storeId,
        productId,
        buildContentPayload({ content, tags })
      ),
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products(storeId).detail(productId),
      });
      logger.info('Product content saved', { productId: data.id });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      logger.error('Save product content failed', { error });
      options?.onError?.(error);
    },
  });
}
