/**
 * Application configuration.
 */

export const APP_CONFIG = {
  name: 'Admin Dashboard',
  version: '1.0.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  apiPrefix: '/api/v1',
  defaultLocale: 'en',
  supportedLocales: ['en', 'ar'] as const,
  defaultCurrency: 'USD',
  defaultTimezone: 'UTC',
  requestTimeout: 10000, // 10 seconds — hard rule
  maxUploadSizeMb: 5,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

export const UPLOAD_CONFIG = {
  maxSizeBytes: APP_CONFIG.maxUploadSizeMb * 1024 * 1024,
  maxSizeMb: APP_CONFIG.maxUploadSizeMb,
  acceptedTypes: APP_CONFIG.supportedImageTypes,
  maxImagesPerProduct: 10,
} as const;
