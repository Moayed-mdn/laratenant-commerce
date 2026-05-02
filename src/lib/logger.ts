/**
 * Logger utility.
 * Replaces all console.log usage in the application.
 */

const isProduction = process.env.NODE_ENV === 'production';

const getTimestamp = (): string => new Date().toISOString();

export const logger = {
  debug(message: string, data?: unknown): void {
    if (isProduction) return;
    console.debug(`[DEBUG] [${getTimestamp()}] ${message}`, data ?? '');
  },

  info(message: string, data?: unknown): void {
    if (isProduction) return;
    console.info(`[INFO] [${getTimestamp()}] ${message}`, data ?? '');
  },

  warn(message: string, data?: unknown): void {
    if (isProduction) {
      console.warn(message, data ?? '');
    } else {
      console.warn(`[WARN] [${getTimestamp()}] ${message}`, data ?? '');
    }
  },

  error(message: string, data?: unknown): void {
    if (isProduction) {
      console.error(message, data ?? '');
    } else {
      console.error(`[ERROR] [${getTimestamp()}] ${message}`, data ?? '');
    }
  },
};
