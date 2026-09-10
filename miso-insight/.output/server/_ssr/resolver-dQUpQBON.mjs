import { a as normalizeNode, i as fillCatalogParams, o as normalizeRegion, r as applyParamsToEndpoint, t as CATALOG_META } from "./catalog-DaTbh8nC.mjs";
import { n as legacyReportBySourceId } from "./legacy-reports-jmctEBAE.mjs";
import { i as rankSources, n as getSource, r as isAmbiguousRanking, t as MISO_SOURCES } from "./registry-ByJMkCvd.mjs";
import { t as MISO_RELIABILITY_GUIDANCE } from "./api-errors-BqJt9Wyi.mjs";
import { conversationMemory, isNewTopic } from "./conversation-DLXs5SJ7.mjs";
import { a as questionForParameter, i as normalizeSource, n as extractMisoDate, o as validateCatalogParameters, t as MISO_TIMESTAMP_NOTE } from "./validation-Ocs5Wa8R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resolver-dQUpQBON.js
var SUBSCRIPTION_KEY_PLACEHOLDER = "YOUR_MISO_SUBSCRIPTION_KEY";
function queryParams(source, params) {
	const query = {};
	for (const spec of source.parameters ?? []) {
		if (spec.in !== "query") continue;
		const value = params[spec.name];
		if (value) query[spec.name] = value;
	}
	return query;
}
function pathParams(source, params) {
	const path = {};
	for (const spec of source.parameters ?? []) {
		if (spec.in !== "path") continue;
		const value = params[spec.name];
		if (value) path[spec.name] = value;
	}
	return path;
}
/** Build the HTTP request. Auth placeholders only — never the live subscription key. */
function buildMisoRequest(source, params) {
	const url = source.type === "api" && source.endpoint ? applyParamsToEndpoint(source, params) : source.endpoint ?? "";
	const parsed = url.includes("://") ? new URL(url) : null;
	return {
		method: source.method ?? "GET",
		endpoint: parsed ? `${parsed.origin}${parsed.pathname}` : url.split("?")[0] ?? url,
		url,
		query: queryParams(source, params),
		path: pathParams(source, params),
		headers: [{
			key: CATALOG_META.authHeader,
			value: SUBSCRIPTION_KEY_PLACEHOLDER
		}, {
			key: "Accept",
			value: "application/json"
		}]
	};
}
function paginatedExamples(built, pagination) {
	const url = new URL(built.url);
	url.searchParams.delete(pagination.param_name);
	const { [pagination.param_name]: _page, ...baseParams } = built.query;
	const queryCode = JSON.stringify(baseParams, null, 4).replace(/\n/g, "\n    ");
	const pageParam = pagination.param_name;
	const header = CATALOG_META.authHeader;
	const key = CATALOG_META.requiredEnvVar;
	return [
		{
			language: "cURL",
			code: `# Requires jq. Each page is saved so settlement records are never silently dropped.
# curl retries transient failures and honors Retry-After when MISO sends one.
page=1
while :; do
  response="$(curl -sS --fail-with-body --retry 3 --retry-delay 1 --get "${url}" \\
    --data-urlencode "${pageParam}=$page" \\
    -H "${header}: ${SUBSCRIPTION_KEY_PLACEHOLDER}" \\
    -H "Accept: application/json")"
  printf '%s\\n' "$response" > "miso-page-\${page}.json"
  last_page="$(printf '%s' "$response" | jq -r '.page.lastPage // true')"
  [ "$last_page" = "true" ] && break
  page=$((page + 1))
done`
		},
		{
			language: "Python",
			code: `import os, random, time, requests
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

base_params = ${queryCode}
records = []
headers = {"${header}": os.environ["${key}"], "Accept": "application/json"}

def retry_after_seconds(value):
    if not value:
        return None
    try:
        return max(0, float(value))
    except ValueError:
        return max(0, (parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds())

def get_page(page):
    for attempt in range(3):
        response = requests.${built.method.toLowerCase()}("${built.endpoint}", params={**base_params, "${pageParam}": page}, headers=headers, timeout=60)
        if response.status_code != 429 and not 500 <= response.status_code < 600:
            response.raise_for_status()  # Fix non-retryable 4xx requests rather than looping.
            return response.json()
        if attempt == 2:
            response.raise_for_status()
        delay = retry_after_seconds(response.headers.get("Retry-After"))
        delay = delay if delay is not None else min(8, 0.5 * 2 ** attempt) * (1 + random.random() * 0.25)
        time.sleep(delay)

page = 1
while True:
    payload = get_page(page)
    records.extend(payload.get("data", []))
    if payload.get("page", {}).get("lastPage", True):
        break
    page += 1`
		},
		{
			language: "JavaScript",
			code: `const baseParams = ${JSON.stringify(baseParams, null, 2)};
const records = [];

async function getPage(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      method: "${built.method}",
      headers: {
        "${header}": process.env.${key},
        Accept: "application/json",
      },
    });
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable) {
      if (!response.ok) throw new Error("Fix this MISO request before retrying: " + response.status);
      return response.json();
    }
    if (attempt === 2) throw new Error("MISO request failed after retries: " + response.status);
    const retryAfterValue = response.headers.get("Retry-After");
    const retryAfterSeconds = Number(retryAfterValue);
    const retryAfterDate = Date.parse(retryAfterValue ?? "");
    const retryAfter = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : Number.isFinite(retryAfterDate) ? Math.max(0, retryAfterDate - Date.now()) : NaN;
    const delay = Number.isFinite(retryAfter) ? retryAfter : Math.min(8000, 500 * 2 ** attempt) * (1 + Math.random() * 0.25);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

for (let page = 1; ; page += 1) {
  const url = new URL("${built.endpoint}");
  for (const [key, value] of Object.entries(baseParams)) url.searchParams.set(key, value);
  url.searchParams.set("${pageParam}", String(page));

  const payload = await getPage(url);
  records.push(...(payload.data ?? []));
  if (payload.page?.lastPage ?? true) break;
}`
		}
	];
}
function toApiRequestSpec(source, params) {
	const built = buildMisoRequest(source, params);
	const specs = source.parameters ?? [];
	const pagination = source.pagination;
	return {
		name: `MISO ${source.name} API`,
		method: built.method,
		url: built.url,
		parameters: specs.map((p) => ({
			key: p.name,
			value: params[p.name] ?? "",
			required: p.required
		})),
		headers: built.headers,
		auth_note: "Requires a MISO Data Exchange subscription key (header Ocp-Apim-Subscription-Key). Stay under 100 calls/minute. The live key is injected by the server and is never returned to the client.",
		timezone_note: MISO_TIMESTAMP_NOTE,
		reliability_note: MISO_RELIABILITY_GUIDANCE,
		...pagination ? { pagination } : {},
		examples: pagination ? paginatedExamples(built, pagination) : [
			{
				language: "cURL",
				code: `curl -sS --get "${built.url}" \\\n  -H "${CATALOG_META.authHeader}: ${SUBSCRIPTION_KEY_PLACEHOLDER}" \\\n  -H "Accept: application/json"`
			},
			{
				language: "Python",
				code: `import os, requests\n\nresponse = requests.${built.method.toLowerCase()}(\n    "${built.endpoint}",\n    params=${JSON.stringify(built.query, null, 4).replace(/\n/g, "\n    ")},\n    headers={\n        "${CATALOG_META.authHeader}": os.environ["${CATALOG_META.requiredEnvVar}"],\n        "Accept": "application/json",\n    },\n    timeout=60,\n)\nresponse.raise_for_status()\ndata = response.json()`
			},
			{
				language: "JavaScript",
				code: `const response = await fetch("${built.url}", {\n  method: "${built.method}",\n  headers: {\n    "${CATALOG_META.authHeader}": process.env.${CATALOG_META.requiredEnvVar},\n    Accept: "application/json",\n  },\n});\nconst data = await response.json();`
			}
		]
	};
}
function containsSecret(value, secret) {
	if (!secret) return false;
	return JSON.stringify(value).includes(secret);
}
var GENERIC_POWER = /\bpower results\b|\bgeneration results\b|\bpower data\b/;
var DATASET_CUES = /\b(load|lmp|demand|generation|fuel|interchange|forecast|price|prices|report|pnode|mcp|outage)\b/;
var LEGACY_REPORT_CUES = /\b(?:old(?:er)?|legacy|archiv(?:e|ed)|retired)\b[\s\w-]{0,48}\b(?:report|reports|file|files)\b|\breader'?s guide\b|\breport[- ]to[- ]endpoint\b|\breport mapping\b/i;
var HUBS = [
	{
		re: /\bindiana\b/,
		raw: "indiana"
	},
	{
		re: /\bmichigan\b/,
		raw: "michigan"
	},
	{
		re: /\blouisiana\b/,
		raw: "louisiana"
	}
];
function lastUserQuestions(history) {
	return history.filter((line) => line.toLowerCase().startsWith("user:")).map((line) => line.replace(/^user:\s*/i, ""));
}
function isApiFollowUp(question) {
	const q = question.toLowerCase();
	if (/\b(api|endpoint|curl)\b/.test(q)) return true;
	if (/give me the api request/.test(q)) return true;
	if (/how (did |do )?you (retriev|get|find|fetch|pull)/.test(q)) return true;
	if (/\b(this|that|the) (request|endpoint|call)\b/.test(q)) return true;
	return false;
}
/** Questions about persisting, scheduling, or wiring the last result into an
* application are explanations, not another request for the underlying data. */
function isIntegrationFollowUp(question) {
	return /\b(database|backend|postgres(?:ql)?|supabase|warehouse|data lake|sql|persist|save|sync|etl|pipeline|integration)\b/i.test(question);
}
function isExplanationQuestion(question) {
	return isIntegrationFollowUp(question) || /^(?:why|how|explain|can you explain|what (?:happens|keeps|should|does|is the))\b/i.test(question.trim());
}
/** Handle a few common human-to-human prompts without accidentally re-running
* the last MISO query. The response is intentionally warm but keeps the app's
* purpose clear. */
function casualConversationReply(question) {
	const q = question.trim().toLowerCase();
	if (/\bdo you love me\b/.test(q)) return "I don't experience love, but I'm here to help you make sense of MISO data and build reliable energy-data workflows.";
	if (/\bhow are you\b/.test(q)) return "I'm ready to help with MISO data, market APIs, reports, or your integration workflow.";
	if (/\bwho are you\b/.test(q)) return "I'm MISO AI, a guide for finding MISO data and turning it into reliable integrations.";
}
function refersToPrevious(question) {
	return /\b(this|that|it|same one|the same|for this|for that)\b/i.test(question);
}
function detectIntent(question, lastCtx) {
	const q = question.toLowerCase();
	if ((/\b(report|workbook|pdf|imm)\b/.test(q) || LEGACY_REPORT_CUES.test(q)) && !/\bapi\b/.test(q)) return {
		type: "find_report",
		confidence: .8
	};
	if (isApiFollowUp(question)) return {
		type: "api_request",
		confidence: .9
	};
	if (isExplanationQuestion(question)) return {
		type: "explain",
		confidence: .88
	};
	if (lastCtx?.intent === "api_request" && lastCtx.status === "needs_clarification") return {
		type: "api_request",
		confidence: .86
	};
	return {
		type: "retrieve_data",
		confidence: .85
	};
}
function wantsLegacyReport(question) {
	return LEGACY_REPORT_CUES.test(question);
}
function extractTimeResolution(question, source) {
	const spec = (source.parameters ?? []).find((p) => p.name === "timeResolution");
	if (!spec?.options?.length) return void 0;
	const q = question.toLowerCase();
	if (/\bhourly\b/.test(q) && spec.options.includes("hourly")) return "hourly";
	if (/\bdaily\b/.test(q) && spec.options.includes("daily")) return "daily";
}
function extractInterval(question, source) {
	if (!(source.parameters ?? []).find((p) => p.name === "interval")) return void 0;
	const hour = question.match(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\b/);
	if (/\bhourly\b/.test(question.toLowerCase()) && !hour) return void 0;
	if (hour && /interval|at \d|hour \d|:/.test(question.toLowerCase())) {
		const h = hour[1].padStart(2, "0");
		return hour[2] ? `${h}:${hour[2]}` : hour[1];
	}
}
function extractFromText(question, source, now, origin) {
	const values = {};
	const details = [];
	const allowed = new Set((source.parameters ?? []).map((p) => p.name));
	const dated = extractMisoDate(question, now);
	if (dated && allowed.has("date")) {
		values["date"] = dated.value;
		details.push({
			name: "date",
			value: dated.value,
			source: origin,
			confidence: dated.confidence,
			required: true,
			status: "valid",
			error: null
		});
	}
	if (dated && allowed.has("report_date") && !allowed.has("date")) {
		values["report_date"] = dated.value;
		details.push({
			name: "report_date",
			value: dated.value,
			source: origin,
			confidence: dated.confidence,
			required: false,
			status: "valid",
			error: null
		});
	}
	const regionSpec = (source.parameters ?? []).find((p) => p.name === "region");
	const regionWords = question.match(/\b(north|central|south|miso)\b/i);
	if (regionWords && allowed.has("region")) {
		const region = normalizeRegion(regionWords[1]);
		if (region && (!regionSpec?.options || regionSpec.options.includes(region))) {
			values["region"] = region;
			details.push({
				name: "region",
				value: region,
				source: origin,
				confidence: .95,
				required: false,
				status: "valid",
				error: null
			});
		}
	}
	if (allowed.has("node")) {
		for (const hub of HUBS) if (hub.re.test(question.toLowerCase())) {
			const node = normalizeNode(hub.raw, source);
			if (node) {
				values["node"] = node;
				details.push({
					name: "node",
					value: node,
					source: origin,
					confidence: .96,
					required: false,
					status: "valid",
					error: null
				});
			}
			break;
		}
	}
	const timeResolution = extractTimeResolution(question, source);
	if (timeResolution) {
		values["timeResolution"] = timeResolution;
		details.push({
			name: "timeResolution",
			value: timeResolution,
			source: origin,
			confidence: .93,
			required: false,
			status: "valid",
			error: null
		});
	}
	const interval = extractInterval(question, source);
	if (interval) {
		values["interval"] = interval;
		details.push({
			name: "interval",
			value: interval,
			source: origin,
			confidence: .8,
			required: false,
			status: "valid",
			error: null
		});
	}
	if (/\blrz\s*(\d+)\b/i.test(question) && allowed.has("localResourceZone")) {
		const lrz = question.match(/\blrz\s*(\d+)\b/i)?.[1];
		if (lrz) {
			values["localResourceZone"] = lrz;
			if (allowed.has("geoResolution")) values["geoResolution"] = "localResourceZone";
			details.push({
				name: "localResourceZone",
				value: lrz,
				source: origin,
				confidence: .92,
				required: false,
				status: "valid",
				error: null
			});
		}
	}
	return {
		values,
		details
	};
}
function mergeExtracted(base, extra) {
	const values = {
		...extra.values,
		...base.values
	};
	const seen = new Set(base.details.map((d) => d.name));
	return {
		values,
		details: [...base.details, ...extra.details.filter((d) => !seen.has(d.name))]
	};
}
function isParamFollowUp(question, rankedScore, now) {
	const q = question.toLowerCase();
	const hasDate = Boolean(extractMisoDate(q, now));
	const hasGeo = HUBS.some((h) => h.re.test(q)) || /\b(north|central|south)\b/.test(q);
	const hasDataset = DATASET_CUES.test(q) && rankedScore >= 5;
	return (hasDate || hasGeo) && !hasDataset;
}
function isBareAnswer(question, now) {
	const q = question.trim();
	if (q.length > 80) return false;
	if (/^(option\s*)?#?\d{1,2}$/i.test(q)) return true;
	if (extractMisoDate(q, now) && !DATASET_CUES.test(q.toLowerCase())) return true;
	if (HUBS.some((h) => h.re.test(q.toLowerCase())) && q.split(/\s+/).length <= 4) return true;
	return false;
}
function pickAmbiguousOption(message, options) {
	const q = message.trim().toLowerCase();
	const numbered = q.match(/^(?:option\s*)?#?(\d{1,2})$/);
	if (numbered) {
		const opt = options[Number(numbered[1]) - 1];
		return opt ? getSource(opt.source_id) : void 0;
	}
	const named = options.find((opt) => q === opt.dataset.toLowerCase() || q.includes(opt.dataset.toLowerCase()));
	return named ? getSource(named.source_id) : void 0;
}
function namesDifferentDataset(message, prior) {
	const best = rankSources(message)[0];
	if (!best || best.score < 5) return false;
	if (!prior) return true;
	return best.source.source_id !== prior.source_id;
}
function shouldInheritSource(message, rankedScore, now, lastStatus, prior) {
	if (isNewTopic(message)) return false;
	if (namesDifferentDataset(message, prior) && !isApiFollowUp(message) && !refersToPrevious(message)) return false;
	if (isParamFollowUp(message, rankedScore, now)) return true;
	if (isApiFollowUp(message) || refersToPrevious(message)) return true;
	if (isBareAnswer(message, now)) return lastStatus === "needs_parameters" || lastStatus === "ambiguous" || lastStatus === "resolved" || lastStatus === "success" || lastStatus === "needs_clarification";
	return Boolean(prior) && rankedScore < 5;
}
function genericPowerOptions() {
	return [
		"get-v1-real-time-date-demand-actual",
		"get-v1-real-time-date-generation-fuel-type",
		"get-v1-real-time-date-generation-cleared",
		"get-v1-day-ahead-date-generation-cleared-physical",
		"get-v1-day-ahead-date-generation-fuel-type"
	].map((id) => getSource(id)).filter((s) => Boolean(s)).map((s) => ({
		dataset: s.name,
		description: s.description,
		source_id: s.source_id
	}));
}
function isGenericPowerQuery(question) {
	const q = question.toLowerCase();
	if (!GENERIC_POWER.test(q)) return false;
	return !/\b(fuel|physical|virtual|lmp|load|forecast|cleared demand)\b/.test(q);
}
function inheritSource(history) {
	for (const prior of [...lastUserQuestions(history)].reverse()) {
		if (isGenericPowerQuery(prior)) continue;
		const ranked = rankSources(prior).filter((row) => row.source.type === "api" || row.source.type === "report");
		const best = ranked[0];
		if (best && best.score >= 5 && !isAmbiguousRanking(ranked) && !isGenericPowerQuery(prior)) return best.source;
	}
	return null;
}
function pipeline(args) {
	return [
		{
			id: "user_request",
			title: "USER REQUEST",
			status: "valid"
		},
		{
			id: "intent",
			title: "INTENT",
			status: "valid",
			detail: args.intent
		},
		{
			id: "dataset",
			title: "MISO DATASET",
			status: args.dataset ? "valid" : "unresolved",
			...args.dataset ? { detail: args.dataset } : {}
		},
		{
			id: "endpoint",
			title: "API ENDPOINT",
			status: args.endpoint ? "valid" : "unresolved",
			...args.endpoint ? { detail: args.endpoint } : {}
		},
		{
			id: "parameters",
			title: "PARAMETERS",
			status: args.paramsOk,
			...args.paramDetail ? { detail: args.paramDetail } : {}
		},
		{
			id: "validation",
			title: "VALIDATION",
			status: args.validation
		},
		{
			id: "request",
			title: "REQUEST",
			status: args.request
		},
		{
			id: "response",
			title: "MISO RESPONSE",
			status: args.response
		}
	];
}
function withEndpoint(source) {
	return source.endpoint ? {
		dataset: source.name,
		endpoint: source.endpoint
	} : { dataset: source.name };
}
function sourceRef(source) {
	return {
		dataset: source.name,
		api: source.endpoint ?? source.source_id,
		source_id: source.source_id
	};
}
function resolveMisoQuery(message, options = {}) {
	const now = options.now ?? /* @__PURE__ */ new Date();
	const history = options.history ?? [];
	const memory = conversationMemory(history, options.lastTurn, options.lastSuccess);
	const ctx = memory.lastCtx;
	const success = memory.lastSuccess;
	const intent = detectIntent(message, ctx);
	const ranked = rankSources(message);
	const legacyReport = wantsLegacyReport(message) ? ranked.find((row) => Boolean(legacyReportBySourceId(row.source.source_id))) : void 0;
	const priorSource = (success?.source_id ? getSource(success.source_id) : void 0) ?? inheritSource(history) ?? (ctx?.source_id ? getSource(ctx.source_id) : void 0);
	const picked = ctx?.status === "ambiguous" && ctx.options?.length ? pickAmbiguousOption(message, ctx.options) : void 0;
	const casualReply = casualConversationReply(message);
	if (casualReply) return {
		status: "needs_clarification",
		intent: "clarify",
		parameters: {},
		known_parameters: {},
		missing_parameters: [],
		parameter_details: [],
		validation: { status: "pending" },
		reason: casualReply,
		pipeline: pipeline({
			intent: "clarify",
			paramsOk: "unresolved",
			validation: "pending",
			request: "pending",
			response: "pending"
		})
	};
	if (isNewTopic(message)) return {
		status: "needs_clarification",
		intent: "retrieve_data",
		parameters: {},
		known_parameters: {},
		missing_parameters: [],
		parameter_details: [],
		validation: { status: "pending" },
		reason: "Which MISO data do you need? For example: actual load, day-ahead cleared demand, real-time LMP, or fuel mix.",
		pipeline: pipeline({
			intent: "retrieve_data",
			paramsOk: "unresolved",
			validation: "pending",
			request: "pending",
			response: "pending"
		})
	};
	if (isGenericPowerQuery(message) && !priorSource && !picked) {
		const optionsList = genericPowerOptions();
		return {
			status: "ambiguous",
			intent: intent.type,
			parameters: {},
			known_parameters: {},
			missing_parameters: [],
			parameter_details: [],
			validation: { status: "pending" },
			options: optionsList,
			reason: "Multiple MISO datasets could satisfy this request.",
			pipeline: pipeline({
				intent: intent.type,
				paramsOk: "unresolved",
				validation: "pending",
				request: "pending",
				response: "pending"
			})
		};
	}
	let source = picked;
	const inherit = shouldInheritSource(message, ranked[0]?.score ?? 0, now, ctx?.status, priorSource);
	if (!source && legacyReport) source = legacyReport.source;
	else if (!source && inherit && priorSource) source = priorSource;
	else if (!source && isAmbiguousRanking(ranked) && !options.llmSourceId && !inherit) {
		const optionsList = ranked.slice(0, 5).map((row) => ({
			dataset: row.source.name,
			description: row.source.description,
			source_id: row.source.source_id
		}));
		return {
			status: "ambiguous",
			intent: intent.type,
			parameters: {},
			known_parameters: {},
			missing_parameters: [],
			parameter_details: [],
			validation: { status: "pending" },
			options: optionsList,
			reason: "Multiple MISO datasets could satisfy this request.",
			pipeline: pipeline({
				intent: intent.type,
				paramsOk: "unresolved",
				validation: "pending",
				request: "pending",
				response: "pending"
			})
		};
	} else if (!source) {
		const hinted = options.llmSourceId ? getSource(options.llmSourceId) : void 0;
		const best = ranked[0];
		if (hinted && ranked.some((row) => row.source.source_id === hinted.source_id && row.score >= 4)) source = hinted;
		else if (best && best.score >= 5) source = best.source;
		else if (best && best.score >= 3 && !ranked[1]) source = best.source;
		else if (priorSource && inherit) source = priorSource;
	}
	if (!source && ctx?.status === "ambiguous" && ctx.options?.length) return {
		status: "ambiguous",
		intent: intent.type,
		parameters: {},
		known_parameters: {},
		missing_parameters: [],
		parameter_details: [],
		validation: { status: "pending" },
		options: ctx.options,
		reason: "Please pick one of these MISO datasets by number or name.",
		pipeline: pipeline({
			intent: intent.type,
			paramsOk: "unresolved",
			validation: "pending",
			request: "pending",
			response: "pending"
		})
	};
	if (!source) {
		const question = intent.type === "api_request" ? "Which MISO dataset's API do you need? For example: actual load, day-ahead LMP, or fuel mix." : "Which MISO data do you need? For example: actual load, day-ahead cleared demand, real-time LMP, or fuel mix.";
		return {
			status: "needs_clarification",
			intent: intent.type,
			parameters: {},
			known_parameters: {},
			missing_parameters: [],
			parameter_details: [],
			validation: { status: "pending" },
			reason: question,
			pipeline: pipeline({
				intent: intent.type,
				paramsOk: "unresolved",
				validation: "pending",
				request: "pending",
				response: "pending"
			})
		};
	}
	let extracted = extractFromText(message, source, now, "user_message");
	const remembered = success?.parameters ?? ctx?.parameters;
	if (remembered && Object.keys(remembered).length) extracted = mergeExtracted(extracted, {
		values: remembered,
		details: Object.entries(remembered).map(([name, value]) => ({
			name,
			value,
			source: "conversation",
			confidence: .92,
			required: false,
			status: "valid",
			error: null
		}))
	});
	if (options.parameterOverrides) extracted = mergeExtracted({
		values: options.parameterOverrides,
		details: Object.entries(options.parameterOverrides).map(([name, value]) => ({
			name,
			value,
			source: "user_message",
			confidence: 1,
			required: false,
			status: "valid",
			error: null
		}))
	}, extracted);
	const filled = fillCatalogParams(source, extracted.values);
	const allowed = new Set((source.parameters ?? []).map((p) => p.name));
	allowed.add("start_date");
	allowed.add("end_date");
	const parameters = Object.fromEntries(Object.entries(filled).filter(([k, v]) => Boolean(v) && allowed.has(k)));
	const metadata = normalizeSource(source);
	const validation = validateCatalogParameters(metadata, parameters);
	const parameter_details = metadata.parameters.map((param) => {
		const existing = extracted.details.find((d) => d.name === param.name);
		const value = parameters[param.name] ?? "";
		if (!value) return {
			name: param.name,
			value: "",
			source: "trained_miso_metadata",
			confidence: param.required ? 0 : 1,
			required: param.required,
			status: param.required ? "unresolved" : "valid",
			error: param.required ? `Missing required parameter ${param.name}` : null
		};
		const issue = validation.errors.find((e) => e.parameter === param.name);
		return {
			name: param.name,
			value,
			source: existing?.source ?? "trained_miso_metadata",
			confidence: existing?.confidence ?? .9,
			required: param.required,
			status: issue ? "invalid" : "valid",
			error: issue?.message ?? null
		};
	});
	const missing_parameters = validation.missing.map((param) => ({
		name: param.name,
		question: questionForParameter(param, source.name)
	}));
	const built = source.type === "api" ? buildMisoRequest(source, parameters) : void 0;
	const request = built ? {
		method: built.method,
		endpoint: built.endpoint,
		query: built.query
	} : void 0;
	if (validation.errors.length && !validation.missing.length) return {
		status: "validation_error",
		intent: intent.type,
		...sourceRef(source),
		parameters,
		known_parameters: parameters,
		missing_parameters: [],
		parameter_details,
		validation: {
			status: "failed",
			errors: validation.errors
		},
		...request ? { request } : {},
		pipeline: pipeline({
			intent: intent.type,
			...withEndpoint(source),
			paramsOk: "invalid",
			validation: "invalid",
			request: "pending",
			response: "pending",
			paramDetail: validation.errors.map((e) => e.message).join(" ")
		})
	};
	if (missing_parameters.length) return {
		status: "needs_parameters",
		intent: intent.type,
		...sourceRef(source),
		parameters,
		known_parameters: parameters,
		missing_parameters,
		parameter_details,
		validation: { status: "failed" },
		...request ? { request } : {},
		pipeline: pipeline({
			intent: intent.type,
			...withEndpoint(source),
			paramsOk: "unresolved",
			validation: "invalid",
			request: "pending",
			response: "pending",
			paramDetail: missing_parameters.map((m) => m.name).join(", ")
		})
	};
	if (parameter_details.some((d) => d.required && d.confidence < .7)) return {
		status: "needs_clarification",
		intent: intent.type,
		...sourceRef(source),
		parameters,
		known_parameters: parameters,
		missing_parameters: [],
		parameter_details,
		validation: { status: "pending" },
		reason: "Parameter confidence is too low to call MISO without confirmation.",
		pipeline: pipeline({
			intent: intent.type,
			...withEndpoint(source),
			paramsOk: "unresolved",
			validation: "pending",
			request: "pending",
			response: "pending"
		})
	};
	return {
		status: "resolved",
		intent: intent.type,
		...sourceRef(source),
		parameters,
		known_parameters: parameters,
		missing_parameters: [],
		parameter_details,
		validation: { status: "passed" },
		...request ? { request } : {},
		pipeline: pipeline({
			intent: intent.type,
			...withEndpoint(source),
			paramsOk: "valid",
			validation: "valid",
			request: "valid",
			response: "pending"
		})
	};
}
function sourceFromResolution(resolution) {
	if (resolution.source_id) return getSource(resolution.source_id);
	if (resolution.api) return MISO_SOURCES.find((s) => s.endpoint === resolution.api || s.name === resolution.dataset);
	if (resolution.dataset) return MISO_SOURCES.find((s) => s.name === resolution.dataset);
}
//#endregion
export { toApiRequestSpec as n, resolveMisoQuery, sourceFromResolution, containsSecret as t };
