/* eslint-disable */
/**
 * Firebase Cloud Messaging service worker.
 *
 * Handles push notifications received while the dashboard is NOT in the
 * foreground (tab closed/backgrounded). Foreground messages are instead
 * handled in src/lib/firebase/client.ts (onForegroundMessage), so we don't
 * show a duplicate notification here for those.
 *
 * This file is served as a static asset — it can't read
 * process.env.NEXT_PUBLIC_* at build time — so the Firebase web config is
 * passed via the registration URL's query string (see
 * requestPushPermissionAndGetToken() in src/lib/firebase/client.ts) and
 * read from self.location.search below. These values are the public
 * Firebase web app config, safe to pass this way (not a secret).
 */

importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'New notification';
    const body = payload.notification?.body || payload.data?.body || '';

    self.registration.showNotification(title, {
      body,
      icon: '/next.svg',
      data: payload.data || {},
    });
  });
}

// Focus/open the dashboard when a background notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
