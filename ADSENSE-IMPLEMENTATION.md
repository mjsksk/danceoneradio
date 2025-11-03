# Google AdSense Implementation with Consent Mode v2

## Overview
This implementation follows Google's Consent Mode v2 requirements for GDPR compliance and proper ad delivery.

## Key Changes

### 1. Google Consent Mode v2 (`src/utils/googleConsentMode.ts`)
- **Initializes consent state BEFORE any Google scripts load**
- Sets default consent to "denied" for all categories
- Updates consent when user makes choices
- Required for AdSense to work properly in Europe

### 2. Script Loading Order (`src/main.tsx`)
```
1. Initialize Consent Mode (default: denied)
2. Load AdSense script (respects consent mode)
3. Update consent if user previously gave consent
4. Render app
```

### 3. User Consent Flow
- **First visit**: Consent Mode sends "denied" signals to Google → No ads shown, no tracking
- **After accepting**: Consent updated to "granted" → Page reloads → Ads initialize properly
- **After rejecting**: Stays "denied" → No ads, no tracking

### 4. Benefits
✅ Ads load immediately after consent (no delay)
✅ GDPR compliant - proper consent signals
✅ Better revenue - Google knows user intent
✅ Works across all pages
✅ Lazy loading for performance
✅ Supports both display and video ads

## Technical Details

### Consent Mode States
- `ad_storage`: Cookie storage for advertising
- `ad_user_data`: User data collection for ads
- `ad_personalization`: Personalized advertising
- `analytics_storage`: Analytics cookies
- `functionality_storage`: Functional features
- `security_storage`: Always granted

### Page Reload Requirement
When user accepts advertising consent, page reloads to:
- Properly initialize AdSense with granted consent
- Ensure all ad slots are registered correctly
- Apply consent mode to all existing Google tags

## Files Modified
- `src/utils/googleConsentMode.ts` - NEW: Consent Mode implementation
- `src/components/GoogleAds.tsx` - NEW: Improved ad component
- `src/components/CookieConsent.tsx` - Updated: Consent Mode integration
- `src/main.tsx` - Updated: Proper initialization order
- `src/utils/consentManager.ts` - Updated: Simplified script loading
- All page files - Updated: Use new GoogleAds component

## Testing
1. Clear cookies and localStorage
2. Visit site → No ads shown, consent banner appears
3. Accept consent → Page reloads → Ads appear
4. Refresh page → Ads still work (consent remembered)
