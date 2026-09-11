/**
 * Relative dates (today / yesterday) follow the MISO-footprint civil calendar
 * in America/New_York, which is how operators actually speak.
 * Path `{date}` is still sent as yyyy-mm-dd. MISO's market timetable uses
 * Eastern Prevailing Time (America/New_York), so the civil calendar changes
 * with daylight saving time.
 */

export const MISO_DATE_FORMAT = "yyyy-mm-dd";
export const MISO_CIVIL_TZ = "America/New_York";

/**
 * Keep the market-time semantics visible wherever a date or interval is shown.
 * On the autumn DST transition, a local clock hour occurs twice; the offset
 * carried by an API timestamp is therefore part of its identity.
 */
export const MISO_TIMESTAMP_NOTE =
  "Time basis: MISO market time is Eastern Prevailing Time (America/New_York), with daylight saving applied. On the fall clock change, keep the API-provided UTC offset to distinguish the repeated local hour.";

export function withMisoTimestampNote(text: string): string {
  return text.includes(MISO_TIMESTAMP_NOTE) ? text : `${text} ${MISO_TIMESTAMP_NOTE}`.trim();
}

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export interface ExtractedDate {
  value: string;
  kind: "relative" | "absolute" | "iso";
  phrase: string;
  confidence: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function calendarDateInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/** Civil calendar date in the MISO footprint (Eastern, with DST). */
export function misoCalendarDate(now: Date = new Date()): string {
  return calendarDateInZone(now, MISO_CIVIL_TZ);
}

export function addMisoDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = Date.UTC(y!, m! - 1, d! + days);
  const dt = new Date(utc);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function formatMisoDate(year: number, month: number, day: number): string | undefined {
  const value = `${year}-${pad(month)}-${pad(day)}`;
  return isIsoDate(value) ? value : undefined;
}

/**
 * Parse a natural-language date into the YYYY-MM-DD format required by MISO path `{date}`.
 * Returns undefined when the text does not name a date — callers must not invent one.
 */
export function extractMisoDate(text: string, now: Date = new Date()): ExtractedDate | undefined {
  const q = text.toLowerCase();
  const today = misoCalendarDate(now);

  const relative: Array<{ re: RegExp; value: string; phrase: string }> = [
    { re: /\byesterday\b/, value: addMisoDays(today, -1), phrase: "yesterday" },
    { re: /\bprevious day\b/, value: addMisoDays(today, -1), phrase: "previous day" },
    { re: /\blast 24 hours\b/, value: addMisoDays(today, -1), phrase: "last 24 hours" },
    { re: /\btoday\b/, value: today, phrase: "today" },
    { re: /\btomorrow\b/, value: addMisoDays(today, 1), phrase: "tomorrow" },
    { re: /\blast week\b/, value: addMisoDays(today, -7), phrase: "last week" },
    {
      re: /\bthis month\b/,
      value: `${today.slice(0, 8)}01`,
      phrase: "this month",
    },
    {
      re: /\blast month\b/,
      value: lastMonthFirstDay(today),
      phrase: "last month",
    },
  ];

  for (const item of relative) {
    if (item.re.test(q)) {
      return { value: item.value, kind: "relative", phrase: item.phrase, confidence: 0.97 };
    }
  }

  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso?.[1] && isIsoDate(iso[1])) {
    return { value: iso[1], kind: "iso", phrase: iso[1], confidence: 0.99 };
  }

  const named = q.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?\b/i,
  );
  if (named) {
    const month = MONTHS[named[1]!.toLowerCase()];
    const day = Number(named[2]);
    const year = named[3] ? Number(named[3]) : Number(today.slice(0, 4));
    if (month) {
      const value = formatMisoDate(year, month, day);
      if (value) {
        return {
          value,
          kind: "absolute",
          phrase: named[0]!,
          confidence: named[3] ? 0.98 : 0.9,
        };
      }
    }
  }

  return undefined;
}

function lastMonthFirstDay(today: string): string {
  const [y, m] = today.split("-").map(Number);
  const month = m === 1 ? 12 : m! - 1;
  const year = m === 1 ? y! - 1 : y!;
  return `${year}-${pad(month)}-01`;
}
