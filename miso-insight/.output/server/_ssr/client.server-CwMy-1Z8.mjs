import { r as applyParamsToEndpoint } from "./catalog-DaTbh8nC.mjs";
import { n as legacyReportBySourceId } from "./legacy-reports-jmctEBAE.mjs";
import { a as retryDelayMilliseconds, i as classifyHttpError, n as MISO_RETRY_POLICY, r as MisoApiError } from "./api-errors-BqJt9Wyi.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-CwMy-1Z8.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var client_server_exports = /* @__PURE__ */ __exportAll({
	fetchMisoData: () => fetchMisoData,
	findReport: () => findReport,
	hasLiveMisoCredentials: () => hasLiveMisoCredentials
});
function hasLiveMisoCredentials(getKey = () => processModule.env["MISO_SUBSCRIPTION_KEY"]) {
	return Boolean(getKey());
}
function hash(input) {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return Math.abs(h);
}
function pseudoRandom(seed) {
	return hash(seed) % 1e4 / 1e4;
}
function eachDay(start, end) {
	const days = [];
	const s = /* @__PURE__ */ new Date(`${start}T00:00:00Z`);
	const e = /* @__PURE__ */ new Date(`${end}T00:00:00Z`);
	if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return [start];
	for (let d = s; d <= e && days.length < 400; d = new Date(d.getTime() + 864e5)) days.push(d.toISOString().slice(0, 10));
	return days.length ? days : [start];
}
var FUELS = [
	"Natural Gas",
	"Coal",
	"Nuclear",
	"Wind",
	"Solar",
	"Hydro",
	"Other"
];
function simulate(source, params) {
	const start = params["date"] ?? params["start_date"] ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const days = eachDay(start, params["end_date"] ?? start);
	const region = params["region"] ?? params["node"] ?? "MISO";
	const regionScale = region === "MISO" ? 1 : .22 + pseudoRandom(region) * .25;
	if (source.source_id === "miso_generation_fuel_mix" || /fuel/i.test(source.name) || /fuel-type/i.test(source.source_id)) {
		const base = 78e3 * regionScale;
		return {
			columns: [
				{
					key: "fuel",
					label: "Fuel type"
				},
				{
					key: "output",
					label: `Average output (MW)`
				},
				{
					key: "share",
					label: "Share"
				}
			],
			unit: "MW",
			x_key: "fuel",
			y_key: "output",
			rows: FUELS.map((fuel) => {
				const weight = .05 + pseudoRandom(`${fuel}${start}${region}`) * .3;
				return {
					fuel,
					output: Math.round(base * weight),
					share: `${Math.round(weight * 100)}%`
				};
			})
		};
	}
	const isPrice = source.unit === "$/MWh";
	if (days.length === 1) {
		const rows = Array.from({ length: 24 }, (_, hour) => {
			const noise = pseudoRandom(`${source.source_id}${start}${region}${hour}`);
			const shape = Math.sin((hour - 4) / 24 * Math.PI * 2) * .5 + .5;
			const value = isPrice ? Math.round((22 + shape * 48 + noise * 14) * 100) / 100 : Math.round((62e3 + shape * 22e3 + noise * 4e3) * regionScale);
			return {
				hour: `${String(hour).padStart(2, "0")}:00`,
				value
			};
		});
		return {
			columns: [{
				key: "hour",
				label: "Hour (MISO Eastern time)"
			}, {
				key: "value",
				label: `${source.value_label} (${source.unit})`
			}],
			unit: source.unit,
			x_key: "hour",
			y_key: "value",
			rows
		};
	}
	const rows = days.map((day) => {
		const noise = pseudoRandom(`${source.source_id}${day}${region}`);
		return {
			date: day,
			value: isPrice ? Math.round((26 + noise * 42) * 100) / 100 : Math.round((68e3 + noise * 22e3) * regionScale)
		};
	});
	return {
		columns: [{
			key: "date",
			label: "Date"
		}, {
			key: "value",
			label: `${source.value_label} (${source.unit})`
		}],
		unit: source.unit,
		x_key: "date",
		y_key: "value",
		rows
	};
}
function pagePayload(json) {
	if (Array.isArray(json)) return { records: json };
	if (!json || typeof json !== "object") throw new MisoApiError("malformed", "The MISO API returned a malformed response.");
	const payload = json;
	const records = payload.data ?? [];
	if (!Array.isArray(records)) throw new MisoApiError("malformed", "The MISO API returned a malformed response.");
	const page = payload.page;
	return {
		records,
		...page && typeof page === "object" ? { page } : {}
	};
}
function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function networkError(err) {
	if (err instanceof MisoApiError) return err;
	const name = err instanceof Error ? err.name : "";
	if (name === "TimeoutError" || name === "AbortError") return new MisoApiError("timeout", "The MISO API request timed out.");
	return new MisoApiError("unavailable", "The MISO API could not be reached.");
}
/**
* Retry only failures that can reasonably clear on their own. This runs per
* page, so a temporary failure cannot turn a multi-page settlement extract
* into a silently incomplete result.
*/
async function fetchPageWithRetry(target, source, key, timeoutMs, deps) {
	const fetchFn = deps.fetch ?? fetch;
	const sleepFn = deps.sleep ?? sleep;
	const maxAttempts = Math.max(1, deps.maxAttempts ?? MISO_RETRY_POLICY.maxAttempts);
	let lastError;
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) try {
		const response = await fetchFn(target, {
			method: source.method ?? "GET",
			headers: {
				"Ocp-Apim-Subscription-Key": key,
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (response.ok) return response;
		const apiError = classifyHttpError(response.status);
		if (!apiError.retryable || attempt === maxAttempts - 1) throw apiError;
		await sleepFn(retryDelayMilliseconds(attempt, response.headers.get("Retry-After"), deps.random));
		lastError = apiError;
	} catch (err) {
		const apiError = networkError(err);
		if (!apiError.retryable || attempt === maxAttempts - 1) throw apiError;
		await sleepFn(retryDelayMilliseconds(attempt, null, deps.random));
		lastError = apiError;
	}
	throw lastError ?? new MisoApiError("unavailable", "The MISO API request failed.");
}
async function callLiveMiso(source, params, deps = {}) {
	const key = (deps.getKey ?? (() => processModule.env["MISO_SUBSCRIPTION_KEY"]))();
	if (!key || !source.endpoint) return null;
	const timeoutMs = deps.timeoutMs ?? 2e4;
	const pagination = source.pagination;
	const pageParam = pagination?.param_name;
	let pageNumber = Number(params[pageParam ?? ""] ?? "1") || 1;
	const explicitlyRequestedPage = Boolean(pageParam && params[pageParam]);
	let pagesFetched = 0;
	let totalPages;
	let pageSize;
	const records = [];
	while (true) {
		const pageParams = pageParam && (explicitlyRequestedPage || pageNumber > 1) ? {
			...params,
			[pageParam]: String(pageNumber)
		} : params;
		const res = await fetchPageWithRetry(applyParamsToEndpoint(source, pageParams), source, key, timeoutMs, deps);
		let json;
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
		if (!(isLastPage === false || isLastPage == null && totalPages != null && pageNumber < totalPages)) break;
		if (pagesFetched >= 1e3) throw new MisoApiError("malformed", "MISO pagination did not identify a final page.");
		pageNumber += 1;
	}
	if (records.length === 0) throw new MisoApiError("empty", "MISO returned no records for this request.");
	const first = records[0];
	const keys = Object.keys(first).slice(0, 6);
	return {
		data: {
			columns: keys.map((k) => ({
				key: k,
				label: k.replace(/_/g, " ")
			})),
			rows: records,
			unit: source.unit,
			x_key: keys[0],
			y_key: keys[1]
		},
		...pagination ? { pagination: {
			pages_fetched: pagesFetched,
			...totalPages != null ? { total_pages: totalPages } : {},
			...pageSize != null ? { page_size: pageSize } : {}
		} } : {}
	};
}
async function fetchMisoData(source, params, deps = {}) {
	if (hasLiveMisoCredentials(deps.getKey ?? (() => processModule.env["MISO_SUBSCRIPTION_KEY"])) && source.endpoint) {
		const live = await callLiveMiso(source, params, deps);
		if (live) return {
			...live,
			live: true,
			httpStatus: 200
		};
	}
	return {
		data: simulate(source, params),
		live: false,
		httpStatus: 200
	};
}
function findReport(source, params) {
	const legacy = legacyReportBySourceId(source.source_id);
	if (legacy) return {
		title: legacy.title,
		published: "MISO archive reference",
		format: legacy.format,
		description: legacy.description,
		url: legacy.url
	};
	const date = params["report_date"] ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const monthly = source.source_id === "miso_market_report_monthly";
	return {
		title: monthly ? `MISO Monthly Market Assessment — ${(/* @__PURE__ */ new Date(`${date}T00:00:00Z`)).toLocaleString("en-US", {
			month: "long",
			year: "numeric",
			timeZone: "UTC"
		})}` : `MISO Daily Market Report — ${date}`,
		published: date,
		format: monthly ? "PDF" : "PDF / XLS",
		description: source.description,
		url: source.documentation_url ?? "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/"
	};
}
//#endregion
export { hasLiveMisoCredentials as i, fetchMisoData as n, findReport as r, client_server_exports as t };
