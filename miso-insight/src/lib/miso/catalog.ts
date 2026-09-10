import catalog from "./catalog.json";
import type { MisoPaginationSpec, MisoParameterSpec, MisoSource } from "./types";

export interface CatalogOperation {
  source_id: string;
  name: string;
  type: "api";
  api_id: string;
  api_name: string;
  description: string;
  supports: string[];
  requires_authentication: boolean;
  supports_api_generation: boolean;
  supports_visualization: boolean;
  base_url: string;
  url_template: string;
  endpoint: string;
  method: "GET" | "POST";
  documentation_url: string;
  auth_header: string;
  value_label: string;
  unit: string;
  parameters: MisoParameterSpec[];
  required: string[];
  optional: string[];
  availability_note: string;
}

export const CATALOG_META = {
  source: catalog.source,
  gateway: catalog.gateway,
  portal: catalog.portal,
  authHeader: catalog.auth_header,
  requiredEnvVar: catalog.required_env_var,
  rateLimit: catalog.rate_limit,
};

export const CATALOG_OPERATIONS = catalog.operations as CatalogOperation[];

/**
 * MISO describes pagination through the optional `pageNumber` request parameter
 * and a `page` object in the response. Page size is returned by MISO at runtime;
 * it is intentionally not guessed here.
 */
function paginationFor(op: CatalogOperation): MisoPaginationSpec | undefined {
  const page = op.parameters.find((parameter) => parameter.name === "pageNumber");
  if (!page) return undefined;
  return {
    supported: true,
    param_name: page.name,
    page_info_path: "page",
    page_size_path: "page.pageSize",
    total_pages_path: "page.totalPages",
    last_page_path: "page.lastPage",
  };
}

export function operationToSource(op: CatalogOperation): MisoSource {
  const pagination = paginationFor(op);
  return {
    source_id: op.source_id,
    name: op.name,
    type: "api",
    description: op.description,
    supports: op.supports,
    requires_authentication: op.requires_authentication,
    supports_api_generation: op.supports_api_generation,
    supports_visualization: op.supports_visualization,
    ...(pagination ? { pagination } : {}),
    endpoint: op.endpoint,
    method: op.method,
    parameters: op.parameters,
    documentation_url: op.documentation_url,
    value_label: op.value_label,
    unit: op.unit,
  };
}

export function fillCatalogParams(
  source: MisoSource,
  params: Record<string, string>,
): Record<string, string> {
  const filled = { ...params };
  if (!filled["date"]) {
    filled["date"] = filled["start_date"] ?? filled["report_date"] ?? "";
  }
  if (filled["date"] && !filled["start_date"]) filled["start_date"] = filled["date"];
  if (filled["start_date"] && !filled["end_date"]) filled["end_date"] = filled["start_date"];

  const node = normalizeNode(filled["node"] ?? "", source);
  if (node) filled["node"] = node;

  const region = normalizeRegion(filled["region"]);
  if (region) filled["region"] = region;

  return filled;
}

export function defaultDateFor(source: MisoSource): string {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86400000);
  const path = source.endpoint ?? "";
  if (path.includes("/forecast/")) return iso(today);
  if (path.includes("/real-time/") || path.includes("/historical/")) return iso(yesterday);
  if (path.includes("/day-ahead/")) return iso(yesterday);
  return iso(yesterday);
}

export function applyParamsToEndpoint(source: MisoSource, params: Record<string, string>): string {
  let url = source.endpoint ?? "";
  for (const spec of source.parameters ?? []) {
    if (spec.in === "path") {
      const value = params[spec.name];
      if (value) url = url.replaceAll(`{${spec.name}}`, encodeURIComponent(value));
    }
  }
  const parsed = new URL(url);
  for (const spec of source.parameters ?? []) {
    if (spec.in !== "query") continue;
    const value = params[spec.name];
    if (value) parsed.searchParams.set(spec.name, value);
  }
  return parsed.toString();
}

export function normalizeRegion(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const key = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    north: "NORTH",
    central: "CENTRAL",
    south: "SOUTH",
    miso: "MISO",
    midwest: "MISO",
  };
  return map[key];
}

export function normalizeNode(raw: string, source: MisoSource): string | undefined {
  const allowsNode = (source.parameters ?? []).some((p) => p.name === "node");
  if (!allowsNode) return undefined;
  const key = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    indiana: "INDIANA.HUB",
    "indiana hub": "INDIANA.HUB",
    "indiana.hub": "INDIANA.HUB",
    michigan: "MICHIGAN.HUB",
    "michigan hub": "MICHIGAN.HUB",
    "michigan.hub": "MICHIGAN.HUB",
    louisiana: "LOUISIANA.HUB",
    "louisiana hub": "LOUISIANA.HUB",
    "louisiana.hub": "LOUISIANA.HUB",
  };
  if (map[key]) return map[key];
  if (/^[A-Z0-9]+(?:\.[A-Z0-9]+)+$/.test(raw.trim())) return raw.trim();
  return undefined;
}
