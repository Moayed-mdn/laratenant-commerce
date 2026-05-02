/**
 * Feature flags configuration.
 */

export const FEATURES = {
  enableDarkMode: true,
  enableRTL: true,
  enableNotifications: false, // not built yet
  enableSuperAdmin: false, // Phase 2
  enableBulkOperations: false, // Phase 2
  enableExportCsv: false, // Phase 2
  enableActivityLog: false, // Phase 2
} as const;
