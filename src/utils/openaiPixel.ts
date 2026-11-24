import { getConsent } from './consentManager';
import { googleCmpMeasurementDecision, permitsOpenAIMeasurement, pixelDebugEnabled } from './openaiMeasurementPolicy';

const PIXEL_ID = 'QZs8QQBioHa6mexdc3fU2L';
const SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
const SCRIPT_ID = 'openai-measurement-pixel';

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
    __tcfapi?: (
      command: string, version: number,
      callback: (data: GoogleConsentData, success: boolean) => void,
    ) => void;
  }
}

let initialized = false;
let pixelAvailable = false;
let sdkFailed = false;
let cmpAllowsMeasurement: boolean | undefined;
let cmpRegistered = false;

export const openAIPixelDebugEnabled = () => pixelDebugEnabled(
  import.meta.env?.DEV === true, window.location.hostname,
);

function choiceAllowsMeasurement(): boolean {
  if (window.location.pathname === '/consent-preview') return false;
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  return permitsOpenAIMeasurement(getConsent(), gpc)
    && (!window.__tcfapi || cmpAllowsMeasurement === true);
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

function registerGoogleConsent() {
  if (!window.__tcfapi || cmpRegistered) return;
  cmpRegistered = true;
  cmpAllowsMeasurement = false;
  void syncMeasurementConsent();
  try {
    window.__tcfapi('addEventListener', 2, (data, success) => {
      if (!success) return;
      // Google's CMP cannot grant OpenAI consent; it can additionally deny
      // storage (purpose 1) or ad measurement (purpose 7). Our own choice is
      // always required, including where GDPR does not apply.
      const decision = googleCmpMeasurementDecision(data);
      if (decision === undefined) return;
      cmpAllowsMeasurement = decision;
      void syncMeasurementConsent();
    });
  } catch {
    revokeMeasurement();
  }
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
  // Funding Choices arrives asynchronously, so subscribe when it becomes ready.
  const cmpTimer = window.setInterval(() => {
    registerGoogleConsent();
    if (cmpRegistered) window.clearInterval(cmpTimer);
  }, 500);
  window.setTimeout(() => window.clearInterval(cmpTimer), 30000);
  void syncMeasurementConsent();
}