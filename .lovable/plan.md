
# Notification History Log and Database Cleanup

## What We're Building

1. **Notification History UI** -- A new admin panel section showing all sent push notifications with title, message, recipient count, and timestamp.

2. **Automated Cleanup** -- A cron job to delete old notification records (push_notifications and scheduled_notifications) after 90 days to prevent database bloat.

---

## Implementation Steps

### 1. Create NotificationHistory Component

A new component `src/components/admin/NotificationHistory.tsx` that:
- Fetches from the existing `push_notifications` table (already has admin SELECT RLS policy)
- Displays a table with columns: Title, Message, Recipients, Sent At
- Shows a badge with total count
- Includes a refresh button
- Limits display to most recent 50 entries
- Uses the project's existing Orbitron/Rajdhani font styling

### 2. Add Component to Admin Page

Insert `<NotificationHistory />` into `src/pages/Admin.tsx` right after the `PushNotificationComposer`.

### 3. Database Cleanup Cron Job

Add a scheduled SQL job (via Supabase insert tool) that runs weekly at 3 AM UTC on Sundays:
- Deletes rows from `push_notifications` older than 90 days
- Deletes rows from `scheduled_notifications` with status "sent" or "cancelled" older than 90 days

---

## Technical Details

**Existing infrastructure used:**
- `push_notifications` table already exists with columns: id, title, body, image_url, sent_by, sent_at, recipient_count
- RLS policy "Admins can view push notification log" already grants admin SELECT access
- No new tables or migrations needed

**Cleanup SQL (cron job):**
```sql
DELETE FROM public.push_notifications WHERE sent_at < NOW() - INTERVAL '90 days';
DELETE FROM public.scheduled_notifications WHERE status IN ('sent', 'cancelled') AND scheduled_at < NOW() - INTERVAL '90 days';
```

**Schedule:** Weekly on Sundays at 3 AM UTC (same pattern as existing cleanup jobs)
