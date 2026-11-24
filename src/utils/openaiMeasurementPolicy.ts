export const OPENAI_MEASUREMENT_NOTICE_VERSION = '2026-11-24';

export function permitsOpenAIMeasurement(
  consent: { advertising: boolean; measurementNoticeVersion?: string } | null,
  globalPrivacyControl: boolean,
): boolean {
  return !globalPrivacyControl && consent?.advertising === true
    && consent.measurementNoticeVersion === OPENAI_MEASUREMENT_NOTICE_VERSION;
}

/**
 * What Google's consent tool says about measurement, or `undefined` while it
 * has not decided. Outside GDPR regions it reports `gdprApplies: false` with
 * no event status at all, so that case must be answered before the status check.
 */
export function googleCmpMeasurementDecision(data: {
  gdprApplies?: boolean;
  eventStatus?: string | null;
  purpose?: { consents?: Record<number, boolean> };
}): boolean | undefined {
  if (data.gdprApplies === false) return true;
  if (data.eventStatus !== 'tcloaded' && data.eventStatus !== 'useractioncomplete') return undefined;
  return data.purpose?.consents?.[1] === true && data.purpose?.consents?.[7] === true;
}

export type GoogleConsentState = 'pending' | 'not-applicable' | 'allowed' | 'denied';

/** The Pixel may load only once Google's tool has answered or is known not to apply. */
export function googleDecisionAllowsPixel(state: GoogleConsentState): boolean {
  return state === 'allowed' || state === 'not-applicable';
}

export function pixelDebugEnabled(development: boolean, hostname: string): boolean {
  return development || /^(?:id-)?preview--/.test(hostname);
}

/** Armed only by user start/resume, never by an automatic recovery. */
export class LiveStreamStartIntent {
  private pending = false;

  arm() { this.pending = true; }
  cancel() { this.pending = false; }

  consume(source: 'live' | 'episode' | null): boolean {
    const intentionalLiveStart = this.pending && source === 'live';
    this.pending = false;
    return intentionalLiveStart;
  }
}

/**
 * Only Lovable preview and local development may give up waiting for Google's
 * tool (after a timer or a failed ad script). Public domains never do.
 */
export function googleToolTimeoutAllowed(development: boolean, hostname: string): boolean {
  return pixelDebugEnabled(development, hostname);
}
