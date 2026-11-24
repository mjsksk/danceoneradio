# OpenAI measurement — preview verification

- Requested outcome: `live_stream_started` once after an intentional live start reaches the existing audio `playing` handler, after the paused-user guard. No podcast, buffering-recovery, or automatic-reconnect conversions.
- Pixel: `QZs8QQBioHa6mexdc3fU2L`; SDK `https://bzrcdn.openai.com/sdk/oaiq.min.js`. One script per document; debug enabled in development/preview and disabled on published domains.
- Consent: existing Advertising Cookies control, separate from analytics. No SDK before explicit advertising acceptance of the updated notice. Withdrawal stops future measurement in this and other tabs and clears queued starts while the SDK is pending. GPC denies permission. The Google CMP can additionally deny ad-measurement/storage purposes; its choices cannot grant OpenAI permission by themselves. Presentation-only consent preview remains uninstrumented.
- Existing automatic advanced matching is enabled in the pixel's public account configuration. The builder requested continuation with the existing pixel after this was disclosed. Account settings were not changed; consent and privacy notices disclose automatic detection/hashing. No manual customer fields are added to the custom event.
- Intent: `playLiveStream` arms a pending marker; user `resume` calls `restartLiveStream(0, true)`. Automatic restarts use the default `false` and clear the marker. Pause/close/podcast changes clear it. First valid `playing` consumes it before permission checks, preventing replay after later consent or SDK availability. Stream-URL fallback during initial startup retains the original pending intent; it cannot generate a second counted start.

## Checks (2026-11-24)

- 11 focused policy tests passed with `bun test src/utils/openaiMeasurementPolicy.test.ts`.
- Browser: actual live audio advanced on start and intentional resume, producing exactly two `live_stream_started` custom payloads through the supplied real SDK.
- Duplicate `playing`, waiting recovery, injected stream-end/reconnect, and user-paused `playing` did not increment the count.
- Podcast 432 audio played without incrementing the live-start count.
- Actual footer rejection left playback running and blocked later starts. Reacceptance did not replay the denied start. Two-tab rejection also blocked later starts in the other tab.
- Analytics-only permission and GPC did not load the SDK. Aborted and throwing pixels left real audio playing with no page errors. Withdrawal during delayed SDK download dropped the queued custom event.
- With an isolated Google CMP callback, denial blocked SDK loading, granting storage/ad-measurement purposes allowed one real live-start event, and later measurement withdrawal stopped the pixel without pausing audio.
- Mobile 390×844 consent settings: measurement switch accessible; no horizontal overflow.
- Latest preview build log: build OK. No publication requested or performed.

## Evidence limits

Tests intercepted the OpenAI endpoint and used a browser-only matching-disabled configuration to avoid sharing customer data or polluting provider reporting. No provider/account settings were changed, and no test events reached OpenAI. Receipt in Ads Manager and attributed conversions remain unverified; this is installed and tested in preview, not a claim of counted conversions.