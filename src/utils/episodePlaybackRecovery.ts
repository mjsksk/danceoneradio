export const EPISODE_STALL_TIMEOUT_MS = 12000;
export const EPISODE_MAX_AUTOMATIC_RETRIES = 1;

/** Only advancing media time proves progress; load/play events do not. */
export class EpisodePlaybackRecovery {
  private active = false;
  private retries = 0;
  private lastProgressAt = 0;
  private position = 0;

  start(now: number, position: number) {
    this.active = true;
    this.retries = 0;
    this.lastProgressAt = now;
    this.position = position;
  }

  cancel() { this.active = false; }

  observe(now: number, position: number): boolean {
    if (!this.active || Math.abs(position - this.position) < 0.05) return false;
    this.position = position;
    this.lastProgressAt = now;
    return true;
  }

  needsRecovery(now: number): boolean {
    return this.active && now - this.lastProgressAt >= EPISODE_STALL_TIMEOUT_MS;
  }

  retry(now: number, position: number): boolean {
    if (!this.active || this.retries >= EPISODE_MAX_AUTOMATIC_RETRIES) return false;
    this.retries += 1;
    this.position = position;
    this.lastProgressAt = now;
    return true;
  }
}

export function freshEpisodeUrl(url: string, now: number): string {
  const fresh = new URL(url);
  fresh.searchParams.set('_cb', String(now));
  return fresh.toString();
}