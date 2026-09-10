import { r as applyParamsToEndpoint } from "./catalog-DaTbh8nC.mjs";
import { n as getExternalUserPersona } from "./integration-lab-C67heFZr.mjs";
import { n as getSource } from "./registry-ByJMkCvd.mjs";
import { i as classifyHttpError, r as MisoApiError, t as MISO_RELIABILITY_GUIDANCE } from "./api-errors-BqJt9Wyi.mjs";
import { n as fetchMisoData } from "./client.server-CwMy-1Z8.mjs";
import { o as validateCatalogParameters, r as getNormalizedApi, t as MISO_TIMESTAMP_NOTE } from "./validation-Ocs5Wa8R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integration-simulator.server-DAd-b6zx.js
function reviewGatewayFailure(status, source) {
	if (status === 505) return {
		status,
		title: "HTTP 505 — HTTP Version Not Supported",
		explanation: "A 505 response means a gateway or origin rejected the HTTP protocol version. It does not by itself prove that MISO data is unavailable, and it should not trigger a blind retry.",
		retry: "do_not_retry",
		actions: [
			"Check outbound proxy, API gateway, and TLS/protocol settings for an HTTP version upgrade or downgrade rule.",
			"Use a standard server-side HTTP client with no manual Upgrade, Connection, or HTTP/2 version headers.",
			"Confirm the configured endpoint and method against the MISO catalog, then retry only after the transport configuration is corrected.",
			"If it persists, send MISO support the safe context below; never include a subscription key or full authorization header."
		],
		safeSupportContext: [
			`Operation: ${source?.name ?? "unknown"}`,
			`Endpoint: ${source?.endpoint ?? "unknown"}`,
			"HTTP status: 505",
			"UTC timestamp, request method, parameter names/values that are safe to share, and any non-secret correlation ID"
		]
	};
	const classified = classifyHttpError(status);
	return {
		status,
		title: `HTTP ${status} — ${classified.type.replace(/_/g, " ")}`,
		explanation: classified.message,
		retry: classified.retryable ? "retry_with_backoff" : "retry_after_fix",
		actions: classified.retryable ? ["Honor Retry-After when supplied.", "Retry with bounded exponential backoff and jitter."] : ["Correct the request or authentication configuration before retrying."],
		safeSupportContext: [
			`Operation: ${source?.name ?? "unknown"}`,
			`Endpoint: ${source?.endpoint ?? "unknown"}`,
			`HTTP status: ${status}`
		]
	};
}
/**
* Server-only integration boundary. A live invocation reads the subscription
* key inside client.server.ts; no caller ever receives it. The simulator uses
* the same validation and response-shaping path while explicitly disabling
* credentials and network access.
*/
async function executeBackendGateway(request) {
	const source = getSource(request.sourceId);
	if (!source || source.type !== "api" || !source.endpoint) return {
		status: "error",
		events: [{
			stage: "backend",
			status: "error",
			message: "The selected operation is not an executable MISO API endpoint."
		}],
		errorAdvice: reviewGatewayFailure(404, source)
	};
	const metadata = getNormalizedApi(source.source_id);
	const validation = metadata ? validateCatalogParameters(metadata, request.parameters) : null;
	const baseEvents = [{
		stage: "backend",
		status: "info",
		message: `Prepared the server-only ${source.method ?? "GET"} request for ${source.name}.`
	}];
	if (!metadata || !validation || !validation.ok) return {
		status: "needs_input",
		source,
		events: [...baseEvents, {
			stage: "validation",
			status: "warning",
			message: "The agent paused before calling MISO because required inputs need attention."
		}],
		validation: {
			missing: validation?.missing.map((parameter) => parameter.name) ?? [],
			errors: validation?.errors ?? []
		}
	};
	const requestUrl = applyParamsToEndpoint(source, request.parameters);
	if (request.simulatedHttpStatus && request.simulatedHttpStatus !== 200) {
		const advice = reviewGatewayFailure(request.simulatedHttpStatus, source);
		return {
			status: "error",
			source,
			requestUrl,
			httpStatus: request.simulatedHttpStatus,
			events: [
				...baseEvents,
				{
					stage: "api",
					status: "error",
					message: `Gateway returned HTTP ${request.simulatedHttpStatus}; no automatic retry was made.`
				},
				{
					stage: "error",
					status: "warning",
					message: "The recovery agent produced a non-secret transport diagnostic."
				}
			],
			errorAdvice: advice
		};
	}
	try {
		const result = await fetchMisoData(source, request.parameters, request.transport === "simulation" ? { getKey: () => void 0 } : {});
		return {
			status: "success",
			source,
			requestUrl,
			live: result.live,
			httpStatus: result.httpStatus,
			data: result.data,
			...result.pagination ? { pagination: result.pagination } : {},
			events: [
				...baseEvents,
				{
					stage: "validation",
					status: "success",
					message: "Catalog-required parameters and dependent fields passed validation."
				},
				{
					stage: "api",
					status: "success",
					message: result.live ? "The backend received a live MISO response." : "The backend received deterministic simulated data; no MISO credentials or network call were used."
				},
				{
					stage: "analysis",
					status: "success",
					message: `Response shaped for downstream storage, charts, and audit metadata. ${MISO_TIMESTAMP_NOTE}`
				}
			]
		};
	} catch (error) {
		const apiError = error instanceof MisoApiError ? error : new MisoApiError("unavailable", "The MISO API request failed.");
		return {
			status: "error",
			source,
			requestUrl,
			httpStatus: apiError.httpStatus,
			events: [
				...baseEvents,
				{
					stage: "api",
					status: "error",
					message: apiError.message
				},
				{
					stage: "error",
					status: "warning",
					message: `${MISO_RELIABILITY_GUIDANCE} The key value was not logged.`
				}
			],
			errorAdvice: reviewGatewayFailure(apiError.httpStatus ?? 503, source)
		};
	}
}
function analyzeRows(rows) {
	const values = rows.flatMap((row) => Object.values(row)).filter((value) => typeof value === "number" && Number.isFinite(value));
	if (!values.length) return void 0;
	return {
		minimum: Math.min(...values),
		average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100,
		maximum: Math.max(...values)
	};
}
function describeParameters(parameters) {
	return Object.entries(parameters).map(([name, value]) => `${name} = ${value}`).join(", ");
}
function createChatTranscript(persona, mode) {
	const parameterValues = describeParameters(persona.parameters);
	const parameterNames = Object.keys(persona.parameters).join(", ");
	const transcript = [
		{
			actor: "agent",
			kind: "question",
			message: `I can prepare the ${persona.title} backend integration. What values should I use for the required API parameters: ${parameterNames}?`
		},
		{
			actor: "chat",
			kind: "answer",
			message: `Simulation user response: ${parameterValues}.`
		},
		{
			actor: "agent",
			kind: "action",
			message: "I validated those values against the MISO catalog and will use the server-only request path."
		},
		{
			actor: "agent",
			kind: "safety",
			message: "Which saved credential reference should this backend use? Please provide its label or environment-variable name only—never paste a subscription-key value here."
		},
		{
			actor: "chat",
			kind: "answer",
			message: "Simulation user response: use the Production MISO reference (MISO_SUBSCRIPTION_KEY). The secret is already configured in the backend environment."
		},
		{
			actor: "agent",
			kind: "action",
			message: "I staged the typed server integration and focused tests in a local sandbox. The generated code reads process.env.MISO_SUBSCRIPTION_KEY only at runtime."
		}
	];
	if (mode === "http_505") transcript.push({
		actor: "chat",
		kind: "question",
		message: "Simulation user response: the gateway returned HTTP 505. Should the agent retry?"
	}, {
		actor: "agent",
		kind: "error",
		message: "No. I stopped the retry, preserved the safe diagnostics, and asked for proxy/TLS protocol configuration to be reviewed before another request."
	});
	else transcript.push({
		actor: "agent",
		kind: "action",
		message: "The simulated request completed. I returned a structured response summary to the web chat and kept the credential out of the transcript, code, and logs."
	});
	return transcript;
}
function createLocalChanges(persona) {
	return [
		{
			path: "src/lib/miso/backend-gateway.server.ts",
			action: `Stage a typed, server-only ${persona.sourceId} request using the approved parameters.`
		},
		{
			path: "src/lib/miso/backend-gateway.test.ts",
			action: "Stage mocked success and gateway-failure coverage; tests make no live MISO request."
		},
		{
			path: ".env.example",
			action: "Document MISO_SUBSCRIPTION_KEY by name only; do not place a key value in a file or source control."
		}
	];
}
/**
* End-to-end, no-credential simulation of the exact server boundary used for
* MISO ingestion. It is intentionally deterministic so users can inspect the
* full flow safely before connecting a subscription key or database.
*/
async function runIntegrationSimulation(personaId, mode) {
	const persona = getExternalUserPersona(personaId);
	const chatTranscript = createChatTranscript(persona, mode);
	const localChanges = createLocalChanges(persona);
	const agentEvents = [
		{
			stage: "agent",
			status: "info",
			message: `Agent selected the ${persona.title} workflow and asked its scoped integration questions.`
		},
		{
			stage: "agent",
			status: "success",
			message: `Agent matched ${persona.sourceId} from the catalog instead of guessing an endpoint.`
		},
		{
			stage: "backend",
			status: "success",
			message: "Agent wrote the approved server-only gateway module plan; subscription keys remain environment-only."
		}
	];
	const gateway = await executeBackendGateway({
		sourceId: persona.sourceId,
		parameters: persona.parameters,
		transport: "simulation",
		...mode === "http_505" ? { simulatedHttpStatus: 505 } : {}
	});
	const request = {
		sourceId: persona.sourceId,
		...gateway.requestUrl ? { url: gateway.requestUrl } : {},
		...gateway.source?.method ? { method: gateway.source.method } : {},
		parameters: persona.parameters
	};
	if (gateway.status === "success" && gateway.data) {
		const numericSummary = analyzeRows(gateway.data.rows);
		return {
			persona,
			mode,
			status: "success",
			events: [...agentEvents, ...gateway.events],
			chatTranscript,
			localChanges,
			request,
			analysis: {
				records: gateway.data.rows.length,
				...numericSummary ? { numericSummary } : {},
				note: "Simulation result only. It exercises catalog validation and the backend response path without calling MISO or using a key."
			},
			backendWrite: {
				path: "src/lib/miso/backend-gateway.server.ts",
				status: "ready",
				note: "This typed server-only module is ready for a live environment variable and downstream persistence adapter."
			}
		};
	}
	return {
		persona,
		mode,
		status: gateway.status,
		events: [...agentEvents, ...gateway.events],
		chatTranscript,
		localChanges,
		request,
		...gateway.errorAdvice ? { errorAdvice: gateway.errorAdvice } : {},
		backendWrite: {
			path: "src/lib/miso/backend-gateway.server.ts",
			status: "ready",
			note: "The gateway blocks unsafe retries and exposes a safe diagnostics path before a live rollout."
		}
	};
}
//#endregion
export { runIntegrationSimulation };
