import { applyParamsToEndpoint } from "./catalog";
import { classifyHttpError, MisoApiError, MISO_RELIABILITY_GUIDANCE } from "./api-errors";
import { fetchMisoData } from "./client.server";
import { MISO_TIMESTAMP_NOTE } from "./dates";
import { getNormalizedApi } from "./metadata";
import { getSource } from "./registry";
import { validateCatalogParameters, type ValidationIssue } from "./validation";
import type { DataSeries, MisoSource } from "./types";

export type BackendTransportMode = "live" | "simulation";

export interface GatewayEvent {
  stage: "agent" | "validation" | "backend" | "api" | "analysis" | "error";
  status: "info" | "success" | "warning" | "error";
  message: string;
}

export interface GatewayErrorAdvice {
  status: number;
  title: string;
  explanation: string;
  retry: "do_not_retry" | "retry_after_fix" | "retry_with_backoff";
  actions: string[];
  safeSupportContext: string[];
}

export interface BackendGatewayResult {
  status: "success" | "needs_input" | "error";
  source?: Pick<MisoSource, "source_id" | "name" | "endpoint" | "method" | "documentation_url">;
  requestUrl?: string;
  events: GatewayEvent[];
  data?: DataSeries;
  live?: boolean;
  httpStatus?: number;
  pagination?: { pages_fetched: number; total_pages?: number; page_size?: number };
  validation?: { missing: string[]; errors: ValidationIssue[] };
  errorAdvice?: GatewayErrorAdvice;
}

export interface BackendGatewayRequest {
  sourceId: string;
  parameters: Record<string, string>;
  /** Simulation never sends network traffic or reads MISO credentials. */
  transport: BackendTransportMode;
  /** Used only by diagnostics/tests to exercise an upstream response. */
  simulatedHttpStatus?: number;
}

export function reviewGatewayFailure(status: number, source?: MisoSource): GatewayErrorAdvice {
  if (status === 505) {
    return {
      status,
      title: "HTTP 505 — HTTP Version Not Supported",
      explanation:
        "A 505 response means a gateway or origin rejected the HTTP protocol version. It does not by itself prove that MISO data is unavailable, and it should not trigger a blind retry.",
      retry: "do_not_retry",
      actions: [
        "Check outbound proxy, API gateway, and TLS/protocol settings for an HTTP version upgrade or downgrade rule.",
        "Use a standard server-side HTTP client with no manual Upgrade, Connection, or HTTP/2 version headers.",
        "Confirm the configured endpoint and method against the MISO catalog, then retry only after the transport configuration is corrected.",
        "If it persists, send MISO support the safe context below; never include a subscription key or full authorization header.",
      ],
      safeSupportContext: [
        `Operation: ${source?.name ?? "unknown"}`,
        `Endpoint: ${source?.endpoint ?? "unknown"}`,
        "HTTP status: 505",
        "UTC timestamp, request method, parameter names/values that are safe to share, and any non-secret correlation ID",
      ],
    };
  }

  const classified = classifyHttpError(status);
  return {
    status,
    title: `HTTP ${status} — ${classified.type.replace(/_/g, " ")}`,
    explanation: classified.message,
    retry: classified.retryable ? "retry_with_backoff" : "retry_after_fix",
    actions: classified.retryable
      ? ["Honor Retry-After when supplied.", "Retry with bounded exponential backoff and jitter."]
      : ["Correct the request or authentication configuration before retrying."],
    safeSupportContext: [
      `Operation: ${source?.name ?? "unknown"}`,
      `Endpoint: ${source?.endpoint ?? "unknown"}`,
      `HTTP status: ${status}`,
    ],
  };
}

/**
 * Server-only integration boundary. A live invocation reads the subscription
 * key inside client.server.ts; no caller ever receives it. The simulator uses
 * the same validation and response-shaping path while explicitly disabling
 * credentials and network access.
 */
export async function executeBackendGateway(
  request: BackendGatewayRequest,
): Promise<BackendGatewayResult> {
  const source = getSource(request.sourceId);
  if (!source || source.type !== "api" || !source.endpoint) {
    return {
      status: "error",
      events: [
        {
          stage: "backend",
          status: "error",
          message: "The selected operation is not an executable MISO API endpoint.",
        },
      ],
      errorAdvice: reviewGatewayFailure(404, source),
    };
  }

  const metadata = getNormalizedApi(source.source_id);
  const validation = metadata ? validateCatalogParameters(metadata, request.parameters) : null;
  const baseEvents: GatewayEvent[] = [
    {
      stage: "backend",
      status: "info",
      message: `Prepared the server-only ${source.method ?? "GET"} request for ${source.name}.`,
    },
  ];

  if (!metadata || !validation || !validation.ok) {
    return {
      status: "needs_input",
      source,
      events: [
        ...baseEvents,
        {
          stage: "validation",
          status: "warning",
          message: "The agent paused before calling MISO because required inputs need attention.",
        },
      ],
      validation: {
        missing: validation?.missing.map((parameter) => parameter.name) ?? [],
        errors: validation?.errors ?? [],
      },
    };
  }

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
          message: `Gateway returned HTTP ${request.simulatedHttpStatus}; no automatic retry was made.`,
        },
        {
          stage: "error",
          status: "warning",
          message: "The recovery agent produced a non-secret transport diagnostic.",
        },
      ],
      errorAdvice: advice,
    };
  }

  try {
    const result = await fetchMisoData(
      source,
      request.parameters,
      request.transport === "simulation" ? { getKey: () => undefined } : {},
    );
    return {
      status: "success",
      source,
      requestUrl,
      live: result.live,
      httpStatus: result.httpStatus,
      data: result.data,
      ...(result.pagination ? { pagination: result.pagination } : {}),
      events: [
        ...baseEvents,
        {
          stage: "validation",
          status: "success",
          message: "Catalog-required parameters and dependent fields passed validation.",
        },
        {
          stage: "api",
          status: "success",
          message: result.live
            ? "The backend received a live MISO response."
            : "The backend received deterministic simulated data; no MISO credentials or network call were used.",
        },
        {
          stage: "analysis",
          status: "success",
          message: `Response shaped for downstream storage, charts, and audit metadata. ${MISO_TIMESTAMP_NOTE}`,
        },
      ],
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
        { stage: "api", status: "error", message: apiError.message },
        {
          stage: "error",
          status: "warning",
          message: `${MISO_RELIABILITY_GUIDANCE} The key value was not logged.`,
        },
      ],
      errorAdvice: reviewGatewayFailure(apiError.httpStatus ?? 503, source),
    };
  }
}
