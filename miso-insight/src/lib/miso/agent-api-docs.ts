import { CATALOG_OPERATIONS, defaultDateFor, fillCatalogParams, operationToSource } from "./catalog";
import { LEGACY_REPORTS } from "./legacy-reports";
import { toApiRequestSpec } from "./request-builder";
import type { ApiRequestSpec, MisoSource } from "./types";

/** Backend Integration Lab ids → web catalog operation ids. */
export const BACKEND_ENDPOINT_TO_SOURCE_ID: Record<string, string> = {
  actual_load: "get-v1-real-time-date-demand-actual",
  day_ahead_demand: "get-v1-day-ahead-date-demand",
  realtime_lmp: "get-v1-real-time-date-lmp-expost",
  day_ahead_lmp: "get-v1-day-ahead-date-lmp-expost",
  load_forecast: "get-v1-forecast-date-load",
  binding_constraints: "get-v1-real-time-date-binding-constraint",
  state_estimator_load: "get-v1-real-time-date-demand-load-state-estimator",
  realtime_generation_fuel_type: "get-v1-real-time-date-generation-fuel-type",
  outage_forecast: "get-v1-forecast-date-outage",
};

export interface AgentApiDocsModel {
  source: MisoSource;
  sourceId: string;
  description: string;
  documentationUrl?: string;
  api: ApiRequestSpec;
  requiredParameters: Array<{ name: string; label: string; description?: string; example?: string; options?: string[] }>;
  optionalParameters: Array<{ name: string; label: string; description?: string; example?: string; options?: string[] }>;
  exampleResponse: Record<string, unknown>;
  related: Array<{ sourceId: string; name: string; description: string }>;
  legacyReport?: { title: string; url: string; description: string };
  callPrompt: string;
  docsPageHref: string;
}

function exampleResponseFor(source: MisoSource, params: Record<string, string>): Record<string, unknown> {
  const marketDate = params.date ?? defaultDateFor(source);
  const unit = source.unit ?? "MW";
  const value = unit.includes("$") ? 32.45 : 72150;
  return {
    data: [
      {
        marketDate,
        intervalEnding: `${marketDate}T05:00:00-05:00`,
        value,
        unit,
        ...(params.region ? { region: params.region } : { region: "MISO" }),
        ...(params.node ? { node: params.node } : {}),
      },
    ],
    page: {
      pageNumber: 1,
      pageSize: 1000,
      totalPages: 1,
      lastPage: true,
    },
  };
}

export function sourceForBackendEndpoint(endpointId: string): MisoSource | null {
  const sourceId = BACKEND_ENDPOINT_TO_SOURCE_ID[endpointId];
  if (!sourceId) return null;
  const op = CATALOG_OPERATIONS.find((item) => item.source_id === sourceId);
  return op ? operationToSource(op) : null;
}

/**
 * Build a documentation-oriented view for an Integration Lab api_only result,
 * using the richer web catalog when the backend endpoint is mapped.
 */
export function buildAgentApiDocs(input: {
  endpointId: string;
  endpointName: string;
  parameters?: Record<string, string>;
  documentationUrl?: string;
  group?: string;
}): AgentApiDocsModel | null {
  const source = sourceForBackendEndpoint(input.endpointId);
  if (!source) return null;

  const params = fillCatalogParams(source, {
    ...input.parameters,
  });
  if (!params.date) params.date = defaultDateFor(source);
  const api = toApiRequestSpec(source, params);
  const op = CATALOG_OPERATIONS.find((item) => item.source_id === source.source_id);

  const requiredParameters = (source.parameters ?? [])
    .filter((p) => p.required)
    .map((p) => ({
      name: p.name,
      label: p.label,
      description: p.description,
      example: p.example != null ? String(p.example) : params[p.name],
      options: p.options,
    }));
  const optionalParameters = (source.parameters ?? [])
    .filter((p) => !p.required)
    .map((p) => ({
      name: p.name,
      label: p.label,
      description: p.description,
      example: p.example != null ? String(p.example) : params[p.name] || undefined,
      options: p.options,
    }));

  const related = CATALOG_OPERATIONS.filter(
    (item) =>
      item.source_id !== source.source_id &&
      (item.api_id === op?.api_id || item.api_name === op?.api_name),
  )
    .slice(0, 4)
    .map((item) => ({
      sourceId: item.source_id,
      name: item.name,
      description: item.description,
    }));

  const legacyReport = LEGACY_REPORTS.find(
    (report) => report.api_replacement?.source_id === source.source_id,
  );

  const datePhrase = params.date ? ` for ${params.date}` : " for yesterday";
  return {
    source,
    sourceId: source.source_id,
    description: source.description,
    documentationUrl: input.documentationUrl || source.documentation_url || op?.documentation_url,
    api,
    requiredParameters,
    optionalParameters,
    exampleResponse: exampleResponseFor(source, params),
    related,
    legacyReport: legacyReport
      ? { title: legacyReport.title, url: legacyReport.url, description: legacyReport.description }
      : undefined,
    callPrompt: `Retrieve ${input.endpointName} data${datePhrase}`,
    docsPageHref: `/api-docs/${source.source_id}`,
  };
}
