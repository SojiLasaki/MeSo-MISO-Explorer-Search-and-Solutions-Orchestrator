import { applyParamsToEndpoint } from "./catalog";
import { legacyReportBySourceId } from "./legacy-reports";
import {
  classifyHttpError,
  MisoApiError,
  MISO_RETRY_POLICY,
  retryDelayMilliseconds,
} from "./api-errors";
import type { DataSeries, MisoSource, ReportRef } from "./types";

/**
 * MISO API client layer.
 *
 * If a MISO subscription key is configured (MISO_SUBSCRIPTION_KEY) the client
 * calls the live MISO API. Otherwise it returns deterministic, realistic
 * simulated data so the whole product works end to end. The subscription key
 * never leaves this module and is never returned to the frontend.
 */

export interface MisoFetchDeps {
  fetch?: typeof fetch;
  getKey?: () => string | undefined;
  timeoutMs?: number;
  /** Test hooks and integrations may replace timing without changing retry semantics. */
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
  maxAttempts?: number;
}

export function hasLiveMisoCredentials(
  getKey: () => string | undefined = () => process.env["MISO_SUBSCRIPTION_KEY"],
): boolean {
  return Boolean(getKey());
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pseudoRandom(seed: string): number {
  return (hash(seed) % 10000) / 10000;
}

function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return [start];
  for (let d = s; d <= e && days.length < 400; d = new Date(d.getTime() + 86400000)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days.length ? days : [start];
}

const FUELS = ["Natural Gas", "Coal", "Nuclear", "Wind", "Solar", "Hydro", "Other"];

function simulate(source: MisoSource, params: Record<string, string>): DataSeries {
  const start = params["date"] ?? params["start_date"] ?? new Date().toISOString().slice(0, 10);
  const end = params["end_date"] ?? start;
  const days = eachDay(start, end);
  const region = params["region"] ?? params["node"] ?? "MISO";
  const regionScale = region === "MISO" ? 1 : 0.22 + pseudoRandom(region) * 0.25;

  if (
    source.source_id === "miso_generation_fuel_mix" ||
    /fuel/i.test(source.name) ||
    /fuel-type/i.test(source.source_id)
  ) {
    const base = 78000 * regionScale;
    return {
      columns: [
        { key: "fuel", label: "Fuel type" },
        { key: "output", label: `Average output (MW)` },
        { key: "share", label: "Share" },
      ],
      unit: "MW",
      x_key: "fuel",
      y_key: "output",
      rows: FUELS.map((fuel) => {
        const weight = 0.05 + pseudoRandom(`${fuel}${start}${region}`) * 0.3;
        const output = Math.round(base * weight);
        return { fuel, output, share: `${Math.round(weight * 100)}%` };
      }),
    };
  }

  const isPrice = source.unit === "$/MWh";
  const hourly = days.length === 1;

  if (hourly) {
    const rows = Array.from({ length: 24 }, (_, hour) => {
      const noise = pseudoRandom(`${source.source_id}${start}${region}${hour}`);
      const shape = Math.sin(((hour - 4) / 24) * Math.PI * 2) * 0.5 + 0.5;
      const value = isPrice
        ? Math.round((22 + shape * 48 + noise * 14) * 100) / 100
        : Math.round((62000 + shape * 22000 + noise * 4000) * regionScale);
      return {
        hour: `${String(hour).padStart(2, "0")}:00`,
        value,
      };
    });
    return {
      columns: [
        { key: "hour", label: "Hour (MISO Eastern time)" },
        { key: "value", label: `${source.value_label} (${source.unit})` },
      ],
      unit: source.unit,
      x_key: "hour",
      y_key: "value",
      rows,
    };
  }

  const rows = days.map((day) => {
    const noise = pseudoRandom(`${source.source_id}${day}${region}`);
    const value = isPrice
      ? Math.round((26 + noise * 42) * 100) / 100
      : Math.round((68000 + noise * 22000) * regionScale);
    return { date: day, value };
  });

  return {
    columns: [
      { key: "date", label: "Date" },
      { key: "value", label: `${source.value_label} (${source.unit})` },
    ],
    unit: source.unit,
    x_key: "date",
    y_key: "value",
    rows,
  };
}

interface MisoPageInfo {
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  lastPage?: boolean;
}

interface LiveMisoResult {
  data: DataSeries;
  pagination?: { pages_fetched: number; total_pages?: number; page_size?: number };
}

function pagePayload(json: unknown): { records: unknown[]; page?: MisoPageInfo } {
  if (Array.isArray(json)) return { records: json };
  if (!json || typeof json !== "object") {
    throw new MisoApiError("malformed", "The MISO API returned a malformed response.");
  }
  const payload = json as { data?: unknown; page?: unknown };
  const records = payload.data ?? [];
  if (!Array.isArray(records)) {
    throw new MisoApiError("malformed", "The MISO API returned a malformed response.");
  }
  const page = payload.page;
  return {
    records,
    ...(page && typeof page === "object" ? { page: page as MisoPageInfo } : {}),
  };
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function networkError(err: unknown): MisoApiError {
  if (err instanceof MisoApiError) return err;
  const name = err instanceof Error ? err.name : "";
  if (name === "TimeoutError" || name === "AbortError") {
    return new MisoApiError("timeout", "The MISO API request timed out.");
  }
  return new MisoApiError("unavailable", "The MISO API could not be reached.");
}

/**
 * Retry only failures that can reasonably clear on their own. This runs per
 * page, so a temporary failure cannot turn a multi-page settlement extract
 * into a silently incomplete result.
 */
async function fetchPageWithRetry(
  target: string,
  source: MisoSource,
  key: string,
  timeoutMs: number,
  deps: MisoFetchDeps,
): Promise<Response> {
  const fetchFn = deps.fetch ?? fetch;
  const sleepFn = deps.sleep ?? sleep;
  const maxAttempts = Math.max(1, deps.maxAttempts ?? MISO_RETRY_POLICY.maxAttempts);
  let lastError: MisoApiError | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchFn(target, {
        method: source.method ?? "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return response;

      const apiError = classifyHttpError(response.status);
      if (!apiError.retryable || attempt === maxAttempts - 1) throw apiError;
      await sleepFn(
        retryDelayMilliseconds(attempt, response.headers.get("Retry-After"), deps.random),
      );
      lastError = apiError;
    } catch (err) {
      const apiError = networkError(err);
      if (!apiError.retryable || attempt === maxAttempts - 1) throw apiError;
      await sleepFn(retryDelayMilliseconds(attempt, null, deps.random));
      lastError = apiError;
    }
  }

  throw lastError ?? new MisoApiError("unavailable", "The MISO API request failed.");
}

async function callLiveMiso(
  source: MisoSource,
  params: Record<string, string>,
  deps: MisoFetchDeps = {},
): Promise<LiveMisoResult | null> {
  const getKey = deps.getKey ?? (() => process.env["MISO_SUBSCRIPTION_KEY"]);
  const key = getKey();
  if (!key || !source.endpoint) return null;
  const timeoutMs = deps.timeoutMs ?? 20_000;
  const pagination = source.pagination;
  const pageParam = pagination?.param_name;
  let pageNumber = Number(params[pageParam ?? ""] ?? "1") || 1;
  const explicitlyRequestedPage = Boolean(pageParam && params[pageParam]);
  let pagesFetched = 0;
  let totalPages: number | undefined;
  let pageSize: number | undefined;
  const records: unknown[] = [];

  while (true) {
    // MISO defaults to its first page. Preserve that canonical first request,
    // then explicitly request every following page (or an explicitly supplied page).
    const pageParams =
      pageParam && (explicitlyRequestedPage || pageNumber > 1)
        ? { ...params, [pageParam]: String(pageNumber) }
        : params;
    const target = applyParamsToEndpoint(source, pageParams);
    const res = await fetchPageWithRetry(target, source, key, timeoutMs, deps);
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new MisoApiError("malformed", "The MISO API returned a malformed response.");
    }
    const payload = pagePayload(json);
    records.push(...payload.records);
    pagesFetched += 1;
    if (!pagination) break;

    totalPages = payload.page?.totalPages ?? totalPages;
    pageSize = payload.page?.pageSize ?? pageSize;
    const isLastPage = payload.page?.lastPage;
    const hasMoreByCount = totalPages != null && pageNumber < totalPages;
    const hasMore = isLastPage === false || (isLastPage == null && hasMoreByCount);
    if (!hasMore) break;
    if (pagesFetched >= 1_000) {
      throw new MisoApiError("malformed", "MISO pagination did not identify a final page.");
    }
    pageNumber += 1;
  }

  if (records.length === 0) {
    throw new MisoApiError("empty", "MISO returned no records for this request.");
  }
  const first = records[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 6);
  return {
    data: {
      columns: keys.map((k) => ({ key: k, label: k.replace(/_/g, " ") })),
      rows: records as Record<string, string | number>[],
      unit: source.unit,
      x_key: keys[0],
      y_key: keys[1],
    },
    ...(pagination
      ? {
          pagination: {
            pages_fetched: pagesFetched,
            ...(totalPages != null ? { total_pages: totalPages } : {}),
            ...(pageSize != null ? { page_size: pageSize } : {}),
          },
        }
      : {}),
  };
}

export async function fetchMisoData(
  source: MisoSource,
  params: Record<string, string>,
  deps: MisoFetchDeps = {},
): Promise<{
  data: DataSeries;
  live: boolean;
  httpStatus: number;
  pagination?: { pages_fetched: number; total_pages?: number; page_size?: number };
}> {
  const getKey = deps.getKey ?? (() => process.env["MISO_SUBSCRIPTION_KEY"]);
  if (hasLiveMisoCredentials(getKey) && source.endpoint) {
    const live = await callLiveMiso(source, params, deps);
    if (live) return { ...live, live: true, httpStatus: 200 };
  }
  return { data: simulate(source, params), live: false, httpStatus: 200 };
}

export function findReport(source: MisoSource, params: Record<string, string>): ReportRef {
  const legacy = legacyReportBySourceId(source.source_id);
  if (legacy) {
    return {
      title: legacy.title,
      published: "MISO archive reference",
      format: legacy.format,
      description: legacy.description,
      url: legacy.url,
    };
  }
  const date = params["report_date"] ?? new Date().toISOString().slice(0, 10);
  const monthly = source.source_id === "miso_market_report_monthly";
  return {
    title: monthly
      ? `MISO Monthly Market Assessment — ${new Date(`${date}T00:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}`
      : `MISO Daily Market Report — ${date}`,
    published: date,
    format: monthly ? "PDF" : "PDF / XLS",
    description: source.description,
    url:
      source.documentation_url ??
      "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/",
  };
}
