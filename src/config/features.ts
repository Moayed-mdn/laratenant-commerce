/**
 * Feature flags configuration.
 */

export const FEATURES = {
  enableDarkMode: true,
  enableRTL: true,
  enableNotifications: true, // in-app center + device-token registration (web push needs NEXT_PUBLIC_FIREBASE_* env vars — see docs/notifications/WEB_PUSH_SETUP.md)
  enableSuperAdmin: false, // Phase 2
  enableBulkOperations: false, // Phase 2
  enableExportCsv: false, // Phase 2
  enableActivityLog: false, // Phase 2
} as const;
