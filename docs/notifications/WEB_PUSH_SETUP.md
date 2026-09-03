# Notifications — Merchant Dashboard Setup

## What works right away (no configuration needed)

The in-app notification center is fully wired to the backend and needs nothing beyond
`NEXT_PUBLIC_API_URL` already being set:

- Bell icon + unread badge in the topbar (`FEATURES.enableNotifications`, now `true`)
- Dropdown list, mark-as-read, mark-all-as-read, polling for new unread counts
- Click-through routing to the relevant order/product/billing/settings page

This requires the backend's push notification system to be deployed and migrated (see the
`justshop-api` repo's `docs/notifications/`).

## What needs Firebase Web config: browser push

Receiving an actual OS-level push notification (tab closed/backgrounded) needs a **Firebase Web
app** config — this is separate from the backend's service-account credentials, and these
`NEXT_PUBLIC_*` values are public/non-secret by design (Firebase's own security model doesn't rely
on hiding them).

1. In the same Firebase project the backend uses, go to **Project settings → General → Your apps**
   and add a **Web app** (if one doesn't already exist).
2. Copy the `firebaseConfig` object shown there into `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. Go to **Project settings → Cloud Messaging → Web configuration → Generate key pair** and put
   the result in:
   ```
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
   ```
4. Run `npm install` to pull in the new `firebase` dependency.

Until all six variables above are set, `isWebPushConfigured()` returns `false` and the app simply
skips push registration — no errors, no broken UI, the in-app center keeps working.

## How it fits together

- `src/config/firebase.ts` — reads the env vars, exposes `isWebPushConfigured()`.
- `src/lib/firebase/client.ts` — lazy Firebase app/messaging init, permission request, token
  retrieval, foreground-message subscription. Never runs on the server or before push is
  configured.
- `public/firebase-messaging-sw.js` — background push handler. It's a static file (can't read
  `process.env` at request time), so the web config is passed via the service-worker registration
  URL's query string instead of a build step — see the comment at the top of that file.
- `src/hooks/notifications/usePushNotificationRegistration.ts` — requests permission and registers
  the token once per session; shows a toast + refreshes the bell for foreground pushes.
- `src/features/dashboard/shell/PushNotificationRegistrar.tsx` — mounted in `DashboardShell`,
  renders nothing, just triggers the hook above for every authenticated merchant session.

## Deliberately not done

- **No token removal on logout.** A device token isn't tied to a login session — the same browser
  may log back in later (possibly as a different user on a shared machine), and the backend's
  `DeviceTokenService::registerForUser()` already reassigns a re-registered token to whoever is
  currently authenticated. Removing it on logout would only mean asking for permission again next
  time, for no real benefit.
- **No dedicated "all notifications" page.** The dropdown (paginated, 10 at a time) is the
  complete notification center for now. `useNotifications()` already supports `page`/`per_page`,
  so a full `/merchant/notifications` list page is a small addition later if wanted — no API/hook
  changes required.
- **No per-role visibility gating on the bell.** Every merchant user (Store Admin or Staff) sees
  their own notifications regardless of role — the backend already decides *which* notifications
  each of them receives (see the backend's `StoreNotificationRecipientResolver`); the frontend just
  displays whatever the API returns for the current user.
