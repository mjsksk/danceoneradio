-- Remove corrupted test subscription
DELETE FROM push_subscriptions WHERE auth = 'test' AND endpoint = 'https://test.example.com';

-- Add minimum length constraints to prevent invalid subscriptions
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_auth_min_length CHECK (length(auth) >= 16);
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_p256dh_min_length CHECK (length(p256dh) >= 16);