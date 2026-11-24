export const OPENAI_MEASUREMENT_NOTICE_VERSION = '2026-11-24';

export function permitsOpenAIMeasurement(
  consent: { advertising: boolean; measurementNoticeVersion?: string } | null,
  globalPrivacyControl: boolean,
): boolean {
  return !globalPrivacyControl && consent?.advertising === true
    && consent.measurementNoticeVersion === OPENAI_MEASUREMENT_NOTICE_VERSION;
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