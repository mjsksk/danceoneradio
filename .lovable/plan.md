

# Generate VAPID Keys via Edge Function

## What This Does
Create a simple edge function that generates a VAPID key pair using the Web Crypto API built into Deno. You'll call it once to get your keys, then add them as secrets.

## Implementation

### 1. Create `supabase/functions/generate-vapid-keys/index.ts`

- Uses the Web Crypto API to generate an ECDSA P-256 key pair
- Exports the public key as a URL-safe base64 string (the format Web Push requires)
- Exports the private key in the same format
- No authentication required (one-time use, will be deleted after)

### 2. Add to `supabase/config.toml`

```toml
[functions.generate-vapid-keys]
verify_jwt = false
```

### 3. Usage Flow

1. Deploy the function
2. Call it once via the browser or curl to get your keys
3. Add the keys as Supabase secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`)
4. Delete the function (no longer needed)
5. Continue with the rest of the push notification implementation

### Files to Create/Modify

| Action | File |
|---|---|
| Create | `supabase/functions/generate-vapid-keys/index.ts` |
| Modify | `supabase/config.toml` -- add function config |

