/**
 * Firebase Web push notification configuration.
 *
 * All these NEXT_PUBLIC_ values are the public Firebase *web app* config
 * (apiKey, appId, etc.) — safe to expose client-side by design; Firebase
 * enforces security via its own rules, not by hiding this config. This is
 * NOT the server-side service account credential the backend uses to send
 * pushes (that one is a real secret and stays server-only).
 *
 * See docs/notifications/WEB_PUSH_SETUP.md for where to get these values.
 */

export const FIREBASE_WEB_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
} as const;

/** VAPID key for requesting a web push subscription token. */
export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

/**
 * Whether enough config is present to attempt web push at all. Checked
 * before any Firebase SDK call so the app degrades silently (in-app
 * notification center still works) until real values are supplied.
 */
export function isWebPushConfigured(): boolean {
  return (
    FIREBASE_WEB_CONFIG.apiKey !== '' &&
    FIREBASE_WEB_CONFIG.projectId !== '' &&
    FIREBASE_WEB_CONFIG.messagingSenderId !== '' &&
    FIREBASE_WEB_CONFIG.appId !== '' &&
    FIREBASE_VAPID_KEY !== ''
  );
}
