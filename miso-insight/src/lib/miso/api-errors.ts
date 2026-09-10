export type MisoApiErrorType =
  | "authentication"
  | "timeout"
  | "rate_limit"
  | "unavailable"
  | "malformed"
  | "empty"
  | "invalid_parameter"
  | "missing_parameter"
  | "invalid_dataset"
  | "ambiguous"
  | "training_data"
  | "llm_failure"
  | "http_version";

/**
 * Deliberately avoids asserting an availability percentage or SLA. This reflects
 * normal HTTP semantics and MISO's documented rate-limit responses.
 */
export const MISO_RELIABILITY_GUIDANCE =
  "Reliability: treat a successful empty response as no records, not an outage. Retry timeouts, HTTP 429, and 5xx responses with exponential backoff and jitter; honor Retry-After when MISO supplies it. Fix 4xx requests before retrying.";

/** Conservative defaults for an interactive product: retry transient failures,
 * never retry malformed or invalid requests, and leave rate-limit timing to MISO. */
export const MISO_RETRY_POLICY = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 8_000,
} as const;

/** Parse either form allowed by HTTP Retry-After: seconds or an HTTP date. */
export function retryAfterMilliseconds(
  value: string | null,
  now: number = Date.now(),
): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1_000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : undefined;
}

/** Exponential backoff with a small jitter so simultaneous clients do not retry together. */
export function retryDelayMilliseconds(
  retryNumber: number,
  retryAfter: string | null,
  random: () => number = Math.random,
): number {
  const serverDelay = retryAfterMilliseconds(retryAfter);
  if (serverDelay != null) return serverDelay;
  const exponential = Math.min(
    MISO_RETRY_POLICY.maxDelayMs,
    MISO_RETRY_POLICY.baseDelayMs * 2 ** retryNumber,
  );
  return Math.round(exponential * (1 + Math.max(0, Math.min(1, random())) * 0.25));
}

export class MisoApiError extends Error {
  readonly type: MisoApiErrorType;
  readonly httpStatus: number | undefined;
  readonly retryable: boolean;

  constructor(type: MisoApiErrorType, message: string, httpStatus?: number) {
    super(message);
    this.name = "MisoApiError";
    this.type = type;
    this.httpStatus = httpStatus;
    this.retryable = type === "timeout" || type === "unavailable" || type === "rate_limit";
  }
}

export function classifyHttpError(status: number): MisoApiError {
  if (status === 505) {
    return new MisoApiError(
      "http_version",
      "The gateway rejected the HTTP protocol version (HTTP 505). Check transport configuration before retrying.",
      status,
    );
  }
  if (status === 401 || status === 403) {
    return new MisoApiError("authentication", "MISO authentication failed.", status);
  }
  if (status === 429) {
    return new MisoApiError("rate_limit", "MISO rate limit exceeded (100 calls/minute).", status);
  }
  if (status === 408 || status === 504) {
    return new MisoApiError("timeout", "The MISO API request timed out.", status);
  }
  if (status >= 500) {
    return new MisoApiError("unavailable", "The MISO API is currently unavailable.", status);
  }
  if (status >= 400) {
    return new MisoApiError(
      "invalid_parameter",
      `MISO API rejected the request (HTTP ${status}).`,
      status,
    );
  }
  return new MisoApiError("unavailable", `MISO API responded with HTTP ${status}.`, status);
}

export function userFacingApiError(err: unknown): { type: MisoApiErrorType; message: string } {
  if (err instanceof MisoApiError) {
    return { type: err.type, message: err.message };
  }
  if (err instanceof Error) {
    const name = err.name.toLowerCase();
    const msg = err.message.toLowerCase();
    if (name === "aborterror" || msg.includes("timeout") || msg.includes("aborted")) {
      return { type: "timeout", message: "The MISO API request timed out." };
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) {
      return { type: "unavailable", message: "The MISO API could not be reached." };
    }
  }
  return { type: "unavailable", message: "The MISO API request failed." };
}
