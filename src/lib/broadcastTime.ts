/**
 * Timezone-aware broadcast time helpers.
 *
 * Broadcast times are authored as "wall clock" times in the station's timezone
 * (e.g. "2026-07-24T18:00:00" = 6:00 PM station time). Previously these naive
 * strings were parsed with `new Date(...)`, which interprets them in the
 * *visitor's* timezone — so a listener in Tokyo saw the wrong airtime.
 *
 * These helpers convert station wall-clock time into a real instant, then format
 * it in the listener's own timezone.
 */

/** The timezone the schedule is authored in. */
export const STATION_TIMEZONE = 'America/Los_Angeles';

/** The listener's timezone, resolved from the browser. */
export const getListenerTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || STATION_TIMEZONE;
  } catch {
    return STATION_TIMEZONE;
  }
};

/** Offset (in minutes) of `timeZone` from UTC at the given instant. */
const getTimeZoneOffsetMinutes = (date: Date, timeZone: string): number => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value])
  ) as Record<string, string>;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return (asUTC - date.getTime()) / 60000;
};

/**
 * Parse a naive "YYYY-MM-DDTHH:mm:ss" string as wall-clock time in `timeZone`
 * and return the correct absolute instant. Strings that already carry an offset
 * or a `Z` suffix are passed through untouched.
 */
export const parseBroadcastDate = (
  value: string | Date,
  timeZone: string = STATION_TIMEZONE
): Date => {
  if (value instanceof Date) return value;
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(value);

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return new Date(value);

  const [, y, mo, d, h = '0', mi = '0', s = '0'] = match;
  const naiveUTC = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  // Two passes handle DST boundaries correctly.
  let offset = getTimeZoneOffsetMinutes(new Date(naiveUTC), timeZone);
  let instant = naiveUTC - offset * 60000;
  offset = getTimeZoneOffsetMinutes(new Date(instant), timeZone);
  instant = naiveUTC - offset * 60000;
  return new Date(instant);
};

/** Short timezone name for the listener, e.g. "GMT+2" / "EDT". */
export const getTimeZoneLabel = (date: Date, timeZone = getListenerTimeZone()): string => {
  try {
    const part = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
};

/** Format a broadcast date in the listener's timezone. */
export const formatBroadcastDate = (
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
): string =>
  parseBroadcastDate(value).toLocaleDateString('en-US', {
    ...options,
    timeZone: getListenerTimeZone(),
  });

/** Format a broadcast time in the listener's timezone, with tz abbreviation. */
export const formatBroadcastTime = (
  value: string | Date,
  { withZone = true }: { withZone?: boolean } = {}
): string => {
  const date = parseBroadcastDate(value);
  const tz = getListenerTimeZone();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
  });
  return withZone ? `${time} ${getTimeZoneLabel(date, tz)}`.trim() : time;
};

/** Weekday + time in the listener's timezone, e.g. "Friday at 3:00 PM PDT". */
export const formatBroadcastWeekdayTime = (value: string | Date): string => {
  const date = parseBroadcastDate(value);
  const weekday = date.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: getListenerTimeZone(),
  });
  return `${weekday} at ${formatBroadcastTime(date)}`;
};
