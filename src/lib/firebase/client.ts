/**
 * Browser-only Firebase Cloud Messaging client.
 *
 * Lazily initializes the Firebase app the first time it's needed (never at
 * module load / on the server), and no-ops entirely if
 * isWebPushConfigured() is false — so the app works fine before real
 * Firebase web config is supplied, and this file never runs during SSR.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, FIREBASE_WEB_CONFIG, isWebPushConfigured } from '@/config/firebase';
import { logger } from '@/lib/logger';

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(FIREBASE_WEB_CONFIG);
  }
  return firebaseApp;
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !isWebPushConfigured()) {
    return null;
  }

  if (!(await isSupported())) {
    // Safari/older browsers, or a non-secure (non-HTTPS/non-localhost) context.
    logger.debug('Firebase Cloud Messaging is not supported in this browser/context');
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(getFirebaseApp());
  }

  return messagingInstance;
}

/**
 * Requests notification permission (if not already granted/denied) and, if
 * granted, registers the messaging service worker and returns an FCM
 * registration token ready to send to the backend.
 *
 * Returns null if push isn't configured/supported, or if the user denies
 * permission — callers should treat that as "push unavailable", not an error.
 */
export async function requestPushPermissionAndGetToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  if (Notification.permission === 'denied') {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  try {
    const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams({
      apiKey: FIREBASE_WEB_CONFIG.apiKey,
      authDomain: FIREBASE_WEB_CONFIG.authDomain,
      projectId: FIREBASE_WEB_CONFIG.projectId,
      messagingSenderId: FIREBASE_WEB_CONFIG.messagingSenderId,
      appId: FIREBASE_WEB_CONFIG.appId,
    }).toString()}`;

    // Unregister any existing service workers first to avoid conflicts
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('firebase-messaging-sw')) {
        await registration.unregister();
      }
    }

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
      updateViaCache: 'none',
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    logger.error('Failed to obtain FCM token', { error });
    return null;
  }
}

/**
 * Subscribes to messages received while the dashboard tab is in the
 * foreground (background messages are handled by the service worker
 * instead). Returns an unsubscribe function.
 */
export async function onForegroundMessage(
  callback: (payload: MessagePayload) => void
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, callback);
}
