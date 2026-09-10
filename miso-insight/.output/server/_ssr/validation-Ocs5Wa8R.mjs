import { n as CATALOG_OPERATIONS, t as CATALOG_META } from "./catalog-DaTbh8nC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/validation-Ocs5Wa8R.js
/**
* Relative dates (today / yesterday) follow the MISO-footprint civil calendar
* in America/New_York, which is how operators actually speak.
* Path `{date}` is still sent as yyyy-mm-dd. MISO's market timetable uses
* Eastern Prevailing Time (America/New_York), so the civil calendar changes
* with daylight saving time.
*/
var MISO_DATE_FORMAT = "yyyy-mm-dd";
var MISO_CIVIL_TZ = "America/New_York";
/**
* Keep the market-time semantics visible wherever a date or interval is shown.
* On the autumn DST transition, a local clock hour occurs twice; the offset
* carried by an API timestamp is therefore part of its identity.
*/
var MISO_TIMESTAMP_NOTE = "Time basis: MISO market time is Eastern Prevailing Time (America/New_York), with daylight saving applied. On the fall clock change, keep the API-provided UTC offset to distinguish the repeated local hour.";
function withMisoTimestampNote(text) {
	return text.includes("Time basis: MISO market time is Eastern Prevailing Time (America/New_York), with daylight saving applied. On the fall clock change, keep the API-provided UTC offset to distinguish the repeated local hour.") ? text : `${text} ${MISO_TIMESTAMP_NOTE}`.trim();
}
var MONTHS = {
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
	dec: 12
};
function pad(n) {
	return String(n).padStart(2, "0");
}
function calendarDateInZone(now, timeZone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(now);
	return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;
}
/** Civil calendar date in the MISO footprint (Eastern, with DST). */
function misoCalendarDate(now = /* @__PURE__ */ new Date()) {
	return calendarDateInZone(now, MISO_CIVIL_TZ);
}
function addMisoDays(isoDate, days) {
	const [y, m, d] = isoDate.split("-").map(Number);
	const utc = Date.UTC(y, m - 1, d + days);
	const dt = new Date(utc);
	return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
function isIsoDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [y, m, d] = value.split("-").map(Number);
	if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return false;
	const dt = new Date(Date.UTC(y, m - 1, d));
	return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function formatMisoDate(year, month, day) {
	const value = `${year}-${pad(month)}-${pad(day)}`;
	return isIsoDate(value) ? value : void 0;
}
/**
* Parse a natural-language date into the YYYY-MM-DD format required by MISO path `{date}`.
* Returns undefined when the text does not name a date — callers must not invent one.
*/
function extractMisoDate(text, now = /* @__PURE__ */ new Date()) {
	const q = text.toLowerCase();
	const today = misoCalendarDate(now);
	const relative = [
		{
			re: /\byesterday\b/,
			value: addMisoDays(today, -1),
			phrase: "yesterday"
		},
		{
			re: /\bprevious day\b/,
			value: addMisoDays(today, -1),
			phrase: "previous day"
		},
		{
			re: /\blast 24 hours\b/,
			value: addMisoDays(today, -1),
			phrase: "last 24 hours"
		},
		{
			re: /\btoday\b/,
			value: today,
			phrase: "today"
		},
		{
			re: /\btomorrow\b/,
			value: addMisoDays(today, 1),
			phrase: "tomorrow"
		},
		{
			re: /\blast week\b/,
			value: addMisoDays(today, -7),
			phrase: "last week"
		},
		{
			re: /\bthis month\b/,
			value: `${today.slice(0, 8)}01`,
			phrase: "this month"
		},
		{
			re: /\blast month\b/,
			value: lastMonthFirstDay(today),
			phrase: "last month"
		}
	];
	for (const item of relative) if (item.re.test(q)) return {
		value: item.value,
		kind: "relative",
		phrase: item.phrase,
		confidence: .97
	};
	const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
	if (iso?.[1] && isIsoDate(iso[1])) return {
		value: iso[1],
		kind: "iso",
		phrase: iso[1],
		confidence: .99
	};
	const named = q.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?\b/i);
	if (named) {
		const month = MONTHS[named[1].toLowerCase()];
		const day = Number(named[2]);
		const year = named[3] ? Number(named[3]) : Number(today.slice(0, 4));
		if (month) {
			const value = formatMisoDate(year, month, day);
			if (value) return {
				value,
				kind: "absolute",
				phrase: named[0],
				confidence: named[3] ? .98 : .9
			};
		}
	}
}
function lastMonthFirstDay(today) {
	const [y, m] = today.split("-").map(Number);
	const month = m === 1 ? 12 : m - 1;
	return `${m === 1 ? y - 1 : y}-${pad(month)}-01`;
}
function mapType(spec) {
	if (spec.type === "enum") return "enum";
	if (spec.type === "date") return "date";
	if (spec.type === "datetime") return "datetime";
	if (spec.type === "boolean") return "boolean";
	if (spec.type === "integer") return "integer";
	if (spec.type === "array") return "array";
	if (spec.type === "object") return "object";
	if (spec.type === "number") return /page|count|limit|offset/i.test(spec.name) ? "integer" : "number";
	return "string";
}
function validationRules(spec, type) {
	const rules = [];
	if (spec.required) rules.push("required");
	if (type === "date") rules.push(`format:${MISO_DATE_FORMAT}`);
	if (type === "datetime") rules.push("format:iso-8601");
	if (type === "enum" && spec.options?.length) rules.push(`enum:${spec.options.join("|")}`);
	if (type === "integer") rules.push("integer");
	if (spec.name === "pageNumber") rules.push("min:1");
	if (spec.description.toLowerCase().includes("eastern standard time")) rules.push("timezone:EST");
	return rules;
}
/**
* Dependencies are inferred from co-occurring catalog parameters, not invented APIs.
* geoResolution=localResourceZone requires localResourceZone; region filters apply at region resolution.
*/
function inferDependencies(parameters) {
	const names = new Set(parameters.map((p) => p.name));
	const deps = [];
	if (names.has("geoResolution") && names.has("localResourceZone")) {
		deps.push({
			parameter: "localResourceZone",
			depends_on: {
				parameter: "geoResolution",
				condition: "equals:localResourceZone"
			}
		});
		deps.push({
			parameter: "geoResolution",
			depends_on: {
				parameter: "localResourceZone",
				condition: "required_when:localResourceZone"
			}
		});
	}
	if (names.has("region") && names.has("node")) deps.push({
		parameter: "node",
		depends_on: {
			parameter: "region",
			condition: "incompatible:pricing hubs are node values, not region enums"
		}
	});
	return deps;
}
function normalizeParameter(spec, all) {
	const type = mapType(spec);
	const dependencies = inferDependencies(all).filter((d) => d.parameter === spec.name);
	return {
		name: spec.name,
		label: spec.label,
		type,
		required: spec.required,
		description: spec.description,
		...spec.in ? { in: spec.in } : {},
		...spec.example ? { example: spec.example } : {},
		...spec.options?.length ? { allowed_values: spec.options } : {},
		validation_rules: validationRules(spec, type),
		dependencies
	};
}
function normalizeOperation(op) {
	return {
		dataset: op.name,
		description: op.description,
		source_id: op.source_id,
		api_id: op.api_id,
		api_name: op.api_name,
		endpoint: op.endpoint,
		method: op.method,
		parameters: op.parameters.map((p) => normalizeParameter(p, op.parameters)),
		authentication: {
			required: op.requires_authentication,
			header: op.auth_header || CATALOG_META.authHeader,
			env_var: CATALOG_META.requiredEnvVar
		},
		response_format: "json",
		date_format: MISO_DATE_FORMAT,
		timezone: "EST",
		...op.availability_note ? { limitations: op.availability_note } : {},
		...op.documentation_url ? { documentation_url: op.documentation_url } : {}
	};
}
function normalizeSource(source) {
	const op = CATALOG_OPERATIONS.find((item) => item.source_id === source.source_id);
	if (op) return normalizeOperation(op);
	const parameters = source.parameters ?? [];
	return {
		dataset: source.name,
		description: source.description,
		source_id: source.source_id,
		api_id: source.type,
		api_name: source.name,
		endpoint: source.endpoint ?? "",
		method: source.method ?? "GET",
		parameters: parameters.map((p) => normalizeParameter(p, parameters)),
		authentication: {
			required: source.requires_authentication,
			header: CATALOG_META.authHeader,
			env_var: CATALOG_META.requiredEnvVar
		},
		response_format: "json",
		date_format: MISO_DATE_FORMAT,
		timezone: "EST",
		...source.documentation_url ? { documentation_url: source.documentation_url } : {}
	};
}
var NORMALIZED_CATALOG = CATALOG_OPERATIONS.map(normalizeOperation);
function getNormalizedApi(sourceId) {
	return NORMALIZED_CATALOG.find((api) => api.source_id === sourceId);
}
function asNormalized(spec) {
	if ("validation_rules" in spec && "allowed_values" in spec) return spec;
	const p = spec;
	return {
		name: p.name,
		label: p.label,
		type: p.type === "number" ? "number" : p.type === "date" ? "date" : p.type === "enum" ? "enum" : "string",
		required: p.required,
		description: p.description,
		...p.in ? { in: p.in } : {},
		...p.example ? { example: p.example } : {},
		...p.options?.length ? { allowed_values: p.options } : {},
		validation_rules: [],
		dependencies: []
	};
}
function typeCheck(param, value) {
	if (param.type === "date" || param.validation_rules.includes(`format:yyyy-mm-dd`)) {
		if (!isIsoDate(value)) return {
			parameter: param.name,
			provided: value,
			expected: ["yyyy-mm-dd"],
			message: `${param.label} must be a calendar date in yyyy-mm-dd (MISO EST).`
		};
	}
	if (param.type === "integer" || param.validation_rules.includes("integer")) {
		if (!/^-?\d+$/.test(value)) return {
			parameter: param.name,
			provided: value,
			expected: ["integer"],
			message: `${param.label} must be an integer.`
		};
	}
	if (param.type === "number" && Number.isNaN(Number(value))) return {
		parameter: param.name,
		provided: value,
		message: `${param.label} must be a number.`
	};
	if (param.type === "boolean" && !/^(true|false|0|1)$/i.test(value)) return {
		parameter: param.name,
		provided: value,
		expected: ["true", "false"],
		message: `${param.label} must be true or false.`
	};
	if (param.validation_rules.includes("min:1") && Number(value) < 1) return {
		parameter: param.name,
		provided: value,
		expected: [">= 1"],
		message: `${param.label} must be at least 1.`
	};
	const allowed = param.allowed_values;
	if (allowed?.length && !allowed.includes(value)) return {
		parameter: param.name,
		provided: value,
		expected: allowed,
		message: `Invalid ${param.label.toLowerCase()}.`
	};
}
function validateCatalogParameters(metadata, params) {
	const errors = [];
	const missing = [];
	for (const param of metadata.parameters) {
		const value = params[param.name];
		if (!value) {
			if (param.required) missing.push(param);
			continue;
		}
		const issue = typeCheck(param, value);
		if (issue) errors.push(issue);
	}
	const geo = params["geoResolution"];
	const lrz = params["localResourceZone"];
	if (geo === "localResourceZone" && !lrz) {
		const spec = metadata.parameters.find((p) => p.name === "localResourceZone");
		if (spec) missing.push(spec);
		errors.push({
			parameter: "localResourceZone",
			provided: "",
			message: "localResourceZone is required when geoResolution is localResourceZone."
		});
	}
	if (lrz && geo && geo !== "localResourceZone") errors.push({
		parameter: "geoResolution",
		provided: geo,
		expected: ["localResourceZone"],
		message: "geoResolution must be localResourceZone when localResourceZone is set."
	});
	const region = params["region"];
	const node = params["node"];
	if (region && node) {
		const regionParam = metadata.parameters.find((p) => p.name === "region");
		if (regionParam?.allowed_values && !regionParam.allowed_values.includes(region)) errors.push({
			parameter: "region",
			provided: region,
			expected: regionParam.allowed_values,
			message: "Region and pricing-node filters cannot be combined this way."
		});
	}
	return {
		ok: errors.length === 0 && missing.length === 0,
		errors,
		missing
	};
}
function questionForParameter(param, dataset) {
	const spec = asNormalized(param);
	const about = dataset ? ` for ${dataset}` : "";
	if (spec.name === "date" || spec.type === "date") return `What date would you like${about}? You can say yesterday, today, or a date like September 5.`;
	if (spec.allowed_values?.length) return `Which ${spec.label.toLowerCase()} should we use${about}? Choose one of: ${spec.allowed_values.join(", ")}.`;
	return `What ${spec.label.toLowerCase()} should we use${about}?`;
}
//#endregion
export { questionForParameter as a, normalizeSource as i, extractMisoDate as n, validateCatalogParameters as o, getNormalizedApi as r, withMisoTimestampNote as s, MISO_TIMESTAMP_NOTE as t };
