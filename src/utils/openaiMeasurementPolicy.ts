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