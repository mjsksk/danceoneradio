import { getConsent } from './consentManager';
import {
  googleCmpMeasurementDecision, googleDecisionAllowsPixel, permitsOpenAIMeasurement, pixelDebugEnabled,
  type GoogleConsentState,
} from './openaiMeasurementPolicy';

const PIXEL_ID = 'QZs8QQBioHa6mexdc3fU2L';
const SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
const SCRIPT_ID = 'openai-measurement-pixel';
// Google's tool normally appears ~2s after its ad script; wait this long for it.
const GOOGLE_TOOL_GRACE_MS = 10000;
const GOOGLE_TOOL_MAX_WAIT_MS = 20000;

type PixelCommand = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  __oaiqInitialized?: boolean;
};

interface GoogleConsentData {
  gdprApplies?: boolean;
  eventStatus?: string | null;
  purpose?: { consents?: Record<number, boolean> };
}

declare global {
  interface Window {
    oaiq?: PixelCommand;
    __d1AdSenseScript?: 'loaded' | 'failed';
    __tcfapi?: (
      command: string, version: number,
      callback: (data: GoogleConsentData, success: boolean) => void,
    ) => void;
  }
}

let initialized = false;
let pixelAvailable = false;
let sdkFailed = false;
// Nothing is loaded while Google's consent tool may still answer.
let googleState: GoogleConsentState = 'pending';
let cmpRegistered = false;

export const openAIPixelDebugEnabled = () => pixelDebugEnabled(
  import.meta.env?.DEV === true, window.location.hostname,
);

function choiceAllowsMeasurement(): boolean {
  if (window.location.pathname === '/consent-preview') return false;
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  return permitsOpenAIMeasurement(getConsent(), gpc)
    && googleDecisionAllowsPixel(googleState);
}

/** Re-read the actual choice at the action, not just at script installation. */
export function canMeasureOpenAIAds(): boolean {
  return pixelAvailable && choiceAllowsMeasurement();
}

function debug(message: string) {
  if (openAIPixelDebugEnabled()) console.debug('[OpenAI Pixel]', message);
}

function revokeMeasurement() {
  pixelAvailable = false;
  const pixel = window.oaiq;
  if (!pixel) return;
  // A downloaded SDK might still be pending: never replay an old grant/event.
  if (!pixel.__oaiqInitialized && pixel.q) {
    pixel.q = pixel.q.filter(args => args[0] === 'init');
    pixel.q.unshift(['consent', false]);
  } else {
    pixel('consent', false);
  }
}

async function syncMeasurementConsent() {
  try {
    if (!choiceAllowsMeasurement()) {
      revokeMeasurement();
      return;
    }

    if (sdkFailed) {
      revokeMeasurement();
      return;
    }

    if (!document.getElementById(SCRIPT_ID)) {
      // Equivalent to the supplied setup snippet, with consent denied first.
      if (!window.oaiq) {
        const queue: PixelCommand = (...args) => { queue.q?.push(args); };
        queue.q = [];
        window.oaiq = queue;
      }
      window.oaiq('consent', false);
      window.oaiq('init', { pixelId: PIXEL_ID, debug: openAIPixelDebugEnabled() });
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = SDK_URL;
      script.onerror = () => {
        sdkFailed = true;
        revokeMeasurement();
        debug('Pixel unavailable; radio playback is unaffected.');
      };
      script.onload = () => {
        if (!choiceAllowsMeasurement()) revokeMeasurement();
      };
      document.head.appendChild(script);
    }
    window.oaiq?.('consent', true);
    pixelAvailable = true;
    debug('Measurement enabled by advertising consent.');
  } catch {
    pixelAvailable = false;
    debug('Pixel unavailable; radio playback is unaffected.');
  }
}

function setGoogleState(next: GoogleConsentState) {
  if (googleState === next) return;
  googleState = next;
  void syncMeasurementConsent();
}

function registerGoogleConsent() {
  if (!window.__tcfapi || cmpRegistered) return;
  cmpRegistered = true;
  // Also covers a tool that arrives after the wait ended: stop until it answers.
  setGoogleState('pending');
  try {
    window.__tcfapi('addEventListener', 2, (data, success) => {
      if (!success) return;
      // Google's CMP cannot grant OpenAI consent; it can additionally deny
      // storage (purpose 1) or ad measurement (purpose 7). Our own choice is
      // always required, including where GDPR does not apply.
      const decision = googleCmpMeasurementDecision(data);
      if (decision === undefined) return;
      setGoogleState(data.gdprApplies === false ? 'not-applicable' : decision ? 'allowed' : 'denied');
    });
  } catch {
    setGoogleState('denied');
  }
}

/** Google's tool is not coming (blocked, failed, or not served on this domain). */
function stopWaitingForGoogle() {
  if (!cmpRegistered && googleState === 'pending') setGoogleState('not-applicable');
}

function watchGoogleAdScript() {
  const settled = () => {
    if (window.__d1AdSenseScript === 'failed') stopWaitingForGoogle();
    else if (window.__d1AdSenseScript === 'loaded') window.setTimeout(stopWaitingForGoogle, GOOGLE_TOOL_GRACE_MS);
  };
  window.addEventListener('adsenseScriptSettled', settled, { once: true });
  if (window.__d1AdSenseScript) settled();
  window.setTimeout(stopWaitingForGoogle, GOOGLE_TOOL_MAX_WAIT_MS);
}

export function initializeOpenAIPixel() {
  if (initialized || window.location.pathname === '/consent-preview') return;
  initialized = true;
  window.addEventListener('consentChanged', () => { void syncMeasurementConsent(); });
  window.addEventListener('storage', event => {
    if (event.key === 'cookie_consent' || event.key === null) void syncMeasurementConsent();
  });
  window.addEventListener('focus', () => { void syncMeasurementConsent(); });
  registerGoogleConsent();
  watchGoogleAdScript();
  // Funding Choices arrives asynchronously, so subscribe when it becomes ready.
  const cmpTimer = window.setInterval(() => {
    registerGoogleConsent();
    if (cmpRegistered) window.clearInterval(cmpTimer);
  }, 250);
  window.setTimeout(() => window.clearInterval(cmpTimer), 60000);
  void syncMeasurementConsent();
}
