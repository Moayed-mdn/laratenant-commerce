/**
 * Error normalization utility.
 * This is the ONLY place raw Axios errors are processed.
 * Every API call must go through this before errors reach hooks or components.
 */

import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Normalize an unknown error into a standardized ApiError shape.
 */
export function normalizeError(error: unknown): ApiError {
  // Case 1: AxiosError with response
  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse;
    const message = data?.message ?? 'An error occurred';
    const errors = data?.errors ?? {};

    let code: string;
    switch (status) {
      case 401:
        code = 'UNAUTHORIZED';
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        break;
      case 500:
        code = 'SERVER_ERROR';
        break;
      default:
        code = 'UNKNOWN_ERROR';
    }

    return {
      message,
      errors,
      status,
      code,
    };
  }

  // Case 2: AxiosError without response (network error)
  if (isAxiosError(error)) {
    return {
      message: 'Network error — please check your connection',
      errors: {},
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // Case 3: Plain Error
  if (error instanceof Error) {
    return {
      message: error.message,
      errors: {},
      status: 0,
      code: 'CLIENT_ERROR',
    };
  }

  // Case 4: Fallback for anything else
  return {
    message: 'An unexpected error occurred',
    errors: {},
    status: 0,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Type guard to check if an error is an AxiosError.
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}
