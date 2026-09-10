//#region node_modules/.nitro/vite/services/ssr/assets/api-errors-BqJt9Wyi.js
/**
* Deliberately avoids asserting an availability percentage or SLA. This reflects
* normal HTTP semantics and MISO's documented rate-limit responses.
*/
var MISO_RELIABILITY_GUIDANCE = "Reliability: treat a successful empty response as no records, not an outage. Retry timeouts, HTTP 429, and 5xx responses with exponential backoff and jitter; honor Retry-After when MISO supplies it. Fix 4xx requests before retrying.";
/** Conservative defaults for an interactive product: retry transient failures,
* never retry malformed or invalid requests, and leave rate-limit timing to MISO. */
var MISO_RETRY_POLICY = {
	maxAttempts: 3,
	baseDelayMs: 500,
	maxDelayMs: 8e3
};
/** Parse either form allowed by HTTP Retry-After: seconds or an HTTP date. */
function retryAfterMilliseconds(value, now = Date.now()) {
	if (!value) return void 0;
	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1e3);
	const date = Date.parse(value);
	return Number.isFinite(date) ? Math.max(0, date - now) : void 0;
}
/** Exponential backoff with a small jitter so simultaneous clients do not retry together. */
function retryDelayMilliseconds(retryNumber, retryAfter, random = Math.random) {
	const serverDelay = retryAfterMilliseconds(retryAfter);
	if (serverDelay != null) return serverDelay;
	const exponential = Math.min(MISO_RETRY_POLICY.maxDelayMs, MISO_RETRY_POLICY.baseDelayMs * 2 ** retryNumber);
	return Math.round(exponential * (1 + Math.max(0, Math.min(1, random())) * .25));
}
var MisoApiError = class extends Error {
	type;
	httpStatus;
	retryable;
	constructor(type, message, httpStatus) {
		super(message);
		this.name = "MisoApiError";
		this.type = type;
		this.httpStatus = httpStatus;
		this.retryable = type === "timeout" || type === "unavailable" || type === "rate_limit";
	}
};
function classifyHttpError(status) {
	if (status === 505) return new MisoApiError("http_version", "The gateway rejected the HTTP protocol version (HTTP 505). Check transport configuration before retrying.", status);
	if (status === 401 || status === 403) return new MisoApiError("authentication", "MISO authentication failed.", status);
	if (status === 429) return new MisoApiError("rate_limit", "MISO rate limit exceeded (100 calls/minute).", status);
	if (status === 408 || status === 504) return new MisoApiError("timeout", "The MISO API request timed out.", status);
	if (status >= 500) return new MisoApiError("unavailable", "The MISO API is currently unavailable.", status);
	if (status >= 400) return new MisoApiError("invalid_parameter", `MISO API rejected the request (HTTP ${status}).`, status);
	return new MisoApiError("unavailable", `MISO API responded with HTTP ${status}.`, status);
}
function userFacingApiError(err) {
	if (err instanceof MisoApiError) return {
		type: err.type,
		message: err.message
	};
	if (err instanceof Error) {
		const name = err.name.toLowerCase();
		const msg = err.message.toLowerCase();
		if (name === "aborterror" || msg.includes("timeout") || msg.includes("aborted")) return {
			type: "timeout",
			message: "The MISO API request timed out."
		};
		if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) return {
			type: "unavailable",
			message: "The MISO API could not be reached."
		};
	}
	return {
		type: "unavailable",
		message: "The MISO API request failed."
	};
}
//#endregion
export { retryDelayMilliseconds as a, classifyHttpError as i, MISO_RETRY_POLICY as n, userFacingApiError as o, MisoApiError as r, MISO_RELIABILITY_GUIDANCE as t };
