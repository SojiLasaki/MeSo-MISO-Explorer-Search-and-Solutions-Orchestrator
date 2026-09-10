import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { u as getRequest } from "./createServerFn-BFFE07zL.mjs";
import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/integration-lab-C67heFZr.js
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const SUPABASE_URL = processModule.env["SUPABASE_URL"];
	const SUPABASE_PUBLISHABLE_KEY = processModule.env["SUPABASE_PUBLISHABLE_KEY"];
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []].join(", ")}. Connect Supabase in Lovable Cloud.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	if (token.split(".").length !== 3) throw new Error("Unauthorized: Invalid token");
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: {
			fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
			headers: { Authorization: `Bearer ${token}` }
		},
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	return next({ context: {
		supabase,
		userId: data.claims.sub,
		claims: data.claims
	} });
});
/**
* These scenarios use only APIs present in the checked-in MISO catalog. The
* Transmission Owner scenario deliberately treats ICCP and EMS as a design
* decision: they are not represented as Data Exchange endpoints in this app's
* catalog, so the agent does not promise a nonexistent feed.
*/
var EXTERNAL_USER_PERSONAS = [
	{
		id: "market_participant",
		title: "Market Participant / Trader",
		shortTitle: "Trader",
		description: "Validate nodal LMPs for billing, settlement, forecasting, and price-risk analysis.",
		outcome: "A paginated, server-side LMP ingestion plan with a settlement-ready result summary.",
		sourceId: "get-v1-real-time-date-lmp-expost",
		parameters: {
			date: "2026-09-08",
			node: "INDIANA.HUB",
			timeResolution: "hourly"
		},
		questions: [{
			question: "Which pricing node and market date should be validated?",
			answer: "INDIANA.HUB for 2026-09-08",
			reason: "Pins the settlement extract to an auditable node and date."
		}, {
			question: "Do you need five-minute or hourly values?",
			answer: "Hourly",
			reason: "Keeps the first billing join small while retaining the time-resolution choice."
		}],
		complianceNote: "Preserve MISO time offsets and every page for settlement auditability."
	},
	{
		id: "transmission_owner",
		title: "Transmission Owner",
		shortTitle: "Transmission owner",
		description: "Review operational state-estimator load while deciding whether ICCP telemetry or EMS visualization is required.",
		outcome: "A catalog-backed load integration plus a clear escalation for non-catalog ICCP/EMS needs.",
		sourceId: "get-v1-real-time-date-demand-load-state-estimator",
		parameters: { date: "2026-09-08" },
		questions: [{
			question: "Do you need your own ICCP telemetry feed or an EMS visualization?",
			answer: "EMS visualization for operations review",
			reason: "ICCP and EMS access are operational-tool decisions, not assumed Data Exchange API capabilities."
		}, {
			question: "Which operating day should be reconciled?",
			answer: "2026-09-08",
			reason: "The catalog operation requires a market date."
		}],
		complianceNote: "Escalate ICCP/EMS access through the appropriate MISO operational channel; do not treat this API as telemetry control."
	},
	{
		id: "interconnection_customer",
		title: "Interconnection Customer",
		shortTitle: "Interconnection",
		description: "Use forecasts and operational data to support resource testing, modeling, and commissioning preparation.",
		outcome: "A forecast request prepared for model input with date and time-basis checks.",
		sourceId: "get-v1-forecast-date-load",
		parameters: { date: "2026-09-09" },
		questions: [{
			question: "Is this for commissioning preparation, modeling, or post-test validation?",
			answer: "Commissioning preparation",
			reason: "Keeps the output scoped to planning support rather than declaring commercial-operation readiness."
		}, {
			question: "What forecast issue date should the model use?",
			answer: "2026-09-09",
			reason: "The forecast endpoint is date-scoped."
		}]
	},
	{
		id: "reliability_provider",
		title: "Reliability Services Recipient / Data Provider",
		shortTitle: "Reliability",
		description: "Check fuel-mix and generation inputs used for reliability workflows, settlement support, and compliance evidence.",
		outcome: "A repeatable real-time fuel-mix ingestion run with validation and traceable diagnostics.",
		sourceId: "get-v1-real-time-date-generation-fuel-type",
		parameters: { date: "2026-09-08" },
		questions: [{
			question: "Which reliability data needs a repeatable audit trail?",
			answer: "Real-time generation fuel mix",
			reason: "Selects a structured catalog operation rather than a legacy report copy."
		}, {
			question: "What operating date should be reconciled?",
			answer: "2026-09-08",
			reason: "Enables parameter validation before any data call."
		}],
		complianceNote: "Store source ID, parameters, response timestamps, and retry decisions—never the subscription key."
	},
	{
		id: "operations_planner",
		title: "Operations Planner",
		shortTitle: "Planner",
		description: "Plan around forward-looking demand and outages as reports migrate to structured APIs.",
		outcome: "An API-first planning request with a clear legacy-report migration path.",
		sourceId: "get-v1-forecast-date-outage",
		parameters: { date: "2026-09-09" },
		questions: [{
			question: "Are you replacing a historical report or planning from the API going forward?",
			answer: "Planning from the API going forward",
			reason: "The workflow favors structured API ingestion while preserving report references when explicitly requested."
		}, {
			question: "Which forecast date should drive today’s plan?",
			answer: "2026-09-09",
			reason: "Identifies the required endpoint parameter immediately."
		}]
	},
	{
		id: "backend_integrator",
		title: "Backend Integrator",
		shortTitle: "Developer",
		description: "Build a secure, typed ingestion service for a downstream database, chart, or internal application.",
		outcome: "A server-only request plan with pagination, retry, and secret-handling safeguards.",
		sourceId: "get-v1-real-time-date-demand-actual",
		parameters: {
			date: "2026-09-08",
			region: "MISO"
		},
		questions: [{
			question: "Where will the data be used after ingestion?",
			answer: "A Postgres-backed operations dashboard",
			reason: "The agent can tailor a server-side ingestion plan without receiving database credentials."
		}, {
			question: "Should the backend fetch a page or the complete data set?",
			answer: "Complete data set",
			reason: "Avoids silently partial exports when pagination is present."
		}],
		complianceNote: "The subscription key is read only by the backend environment at runtime and is never sent to the browser or agent prompt."
	}
];
function getExternalUserPersona(id) {
	return EXTERNAL_USER_PERSONAS.find((persona) => persona.id === id) ?? EXTERNAL_USER_PERSONAS[0];
}
//#endregion
export { getExternalUserPersona as n, requireSupabaseAuth as r, EXTERNAL_USER_PERSONAS as t };
