
# Web Push Notifications System

## Overview
Add a browser push notification system where visitors can opt in to receive notifications, and admins can compose and send notifications (with optional image) from the admin dashboard.

## How It Works

1. **Visitor lands on the site** -- after a short delay, a styled in-app prompt asks if they want to enable notifications
2. **If accepted** -- the browser's native permission dialog appears, and their subscription is stored in the database
3. **Admin creates a notification** -- fills in title, body, optional image URL, and clicks send
4. **Edge function** loops through all stored subscriptions and delivers the push notification via the Web Push API

## Technical Details

### 1. Service Worker Update (`public/sw.js`)

Add push event and notification click handlers to the existing service worker:
- Listen for `push` events and display the notification with title, body, icon, and optional image
- Handle `notificationclick` to open the site when tapped

### 2. Database -- new `push_subscriptions` table

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| endpoint | text | Unique, the push service URL |
| p256dh | text | Public key for encryption |
| auth | text | Auth secret for encryption |
| created_at | timestamptz | When subscribed |

RLS: insert allowed for anon (public subscribe), select/delete restricted to service role. A cleanup policy removes stale subscriptions on failed delivery.

### 3. Database -- new `push_notifications` table (log)

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | Notification title |
| body | text | Notification body text |
| image_url | text | Optional image URL |
| sent_by | text | Admin email |
| sent_at | timestamptz | When sent |
| recipient_count | integer | How many were sent to |

RLS: admin-only select, service role insert.

### 4. VAPID Keys

Web Push requires VAPID (Voluntary Application Server Identification) key pair. You will need to:
- Generate a VAPID key pair (one-time setup)
- Store the private key as a Supabase secret (`VAPID_PRIVATE_KEY`)
- Store the public key as a Supabase secret (`VAPID_PUBLIC_KEY`) and also hardcode it in the frontend for subscription
- Store a contact email as `VAPID_EMAIL` secret (or reuse ADMIN_EMAIL)

### 5. Edge Function: `send-push-notification`

- Requires JWT (admin only)
- Receives `{ title, body, image_url? }` 
- Fetches all subscriptions from `push_subscriptions`
- Sends each notification using the `web-push` protocol (manual implementation using Web Crypto API since Deno doesn't have the npm `web-push` library)
- Removes subscriptions that return 410 Gone (unsubscribed)
- Logs the notification in `push_notifications`

### 6. Edge Function: `subscribe-push`

- No JWT required (public endpoint)
- Receives `{ endpoint, keys: { p256dh, auth } }`
- Upserts into `push_subscriptions` (on conflict with endpoint, update keys)

### 7. Frontend: `NotificationPrompt` component

- Shows a styled banner/card after 5 seconds on first visit (checks localStorage flag)
- Two buttons: "Enable Notifications" and "No Thanks"
- On accept: calls `Notification.requestPermission()`, then `serviceWorkerRegistration.pushManager.subscribe()` with the VAPID public key, then POSTs the subscription to `subscribe-push`
- On dismiss: sets localStorage flag, doesn't ask again for 30 days
- Does not show if browser doesn't support push or if already subscribed

### 8. Frontend: `PushNotificationComposer` admin component

- Title input, body textarea, optional image URL input
- "Send Test" button (sends only to admin's own subscription)
- "Send to All" button with confirmation dialog
- Shows last notification stats (recipient count, timestamp)
- Added to Admin.tsx

### 9. Configuration

- Add `send-push-notification` to `supabase/config.toml` with `verify_jwt = true`
- Add `subscribe-push` to `supabase/config.toml` with `verify_jwt = false`

### Files to create/modify

| Action | File |
|---|---|
| Create | `supabase/functions/subscribe-push/index.ts` |
| Create | `supabase/functions/send-push-notification/index.ts` |
| Create | `src/components/NotificationPrompt.tsx` |
| Create | `src/components/admin/PushNotificationComposer.tsx` |
| Modify | `public/sw.js` -- add push event handlers |
| Modify | `src/App.tsx` -- add NotificationPrompt component |
| Modify | `src/pages/Admin.tsx` -- add PushNotificationComposer |
| Modify | `supabase/config.toml` -- add new edge functions |
| Migration | New tables `push_subscriptions` + `push_notifications` + RLS |

### Setup Required From You

After implementation, you will need to generate VAPID keys and add them as Supabase secrets. I will provide instructions and a simple generation method when we get to that step.
