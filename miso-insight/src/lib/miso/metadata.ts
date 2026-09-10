import { CATALOG_META, CATALOG_OPERATIONS, type CatalogOperation } from "./catalog";
import { MISO_DATE_FORMAT } from "./dates";
import type { MisoParameterSpec, MisoSource } from "./types";

export type NormalizedParamType =
  "string" | "integer" | "number" | "boolean" | "date" | "datetime" | "enum" | "array" | "object";

export interface ParameterDependency {
  parameter: string;
  depends_on: {
    parameter: string;
    condition: string;
  };
}

export interface NormalizedParameter {
  name: string;
  label: string;
  type: NormalizedParamType;
  required: boolean;
  description: string;
  in?: "path" | "query";
  example?: string;
  default?: string;
  allowed_values?: string[];
  validation_rules: string[];
  dependencies: ParameterDependency[];
}

export interface NormalizedApi {
  dataset: string;
  description: string;
  source_id: string;
  api_id: string;
  api_name: string;
  endpoint: string;
  method: "GET" | "POST";
  parameters: NormalizedParameter[];
  authentication: {
    required: boolean;
    header: string;
    env_var: string;
  };
  response_format: "json";
  date_format: string;
  timezone: "EST";
  limitations?: string;
  documentation_url?: string;
}

function mapType(spec: MisoParameterSpec): NormalizedParamType {
  if (spec.type === "enum") return "enum";
  if (spec.type === "date") return "date";
  if (spec.type === "datetime") return "datetime";
  if (spec.type === "boolean") return "boolean";
  if (spec.type === "integer") return "integer";
  if (spec.type === "array") return "array";
  if (spec.type === "object") return "object";
  if (spec.type === "number") {
    return /page|count|limit|offset/i.test(spec.name) ? "integer" : "number";
  }
  return "string";
}

function validationRules(spec: MisoParameterSpec, type: NormalizedParamType): string[] {
  const rules: string[] = [];
  if (spec.required) rules.push("required");
  if (type === "date") rules.push(`format:${MISO_DATE_FORMAT}`);
  if (type === "datetime") rules.push("format:iso-8601");
  if (type === "enum" && spec.options?.length) rules.push(`enum:${spec.options.join("|")}`);
  if (type === "integer") rules.push("integer");
  if (spec.name === "pageNumber") rules.push("min:1");
  if (spec.description.toLowerCase().includes("eastern standard time")) {
    rules.push("timezone:EST");
  }
  return rules;
}

/**
 * Dependencies are inferred from co-occurring catalog parameters, not invented APIs.
 * geoResolution=localResourceZone requires localResourceZone; region filters apply at region resolution.
 */
export function inferDependencies(parameters: MisoParameterSpec[]): ParameterDependency[] {
  const names = new Set(parameters.map((p) => p.name));
  const deps: ParameterDependency[] = [];
  if (names.has("geoResolution") && names.has("localResourceZone")) {
    deps.push({
      parameter: "localResourceZone",
      depends_on: {
        parameter: "geoResolution",
        condition: "equals:localResourceZone",
      },
    });
    deps.push({
      parameter: "geoResolution",
      depends_on: {
        parameter: "localResourceZone",
        condition: "required_when:localResourceZone",
      },
    });
  }
  if (names.has("region") && names.has("node")) {
    deps.push({
      parameter: "node",
      depends_on: {
        parameter: "region",
        condition: "incompatible:pricing hubs are node values, not region enums",
      },
    });
  }
  return deps;
}

export function normalizeParameter(
  spec: MisoParameterSpec,
  all: MisoParameterSpec[],
): NormalizedParameter {
  const type = mapType(spec);
  const dependencies = inferDependencies(all).filter((d) => d.parameter === spec.name);
  return {
    name: spec.name,
    label: spec.label,
    type,
    required: spec.required,
    description: spec.description,
    ...(spec.in ? { in: spec.in } : {}),
    ...(spec.example ? { example: spec.example } : {}),
    ...(spec.options?.length ? { allowed_values: spec.options } : {}),
    validation_rules: validationRules(spec, type),
    dependencies,
  };
}

export function normalizeOperation(op: CatalogOperation): NormalizedApi {
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
      env_var: CATALOG_META.requiredEnvVar,
    },
    response_format: "json",
    date_format: MISO_DATE_FORMAT,
    timezone: "EST",
    ...(op.availability_note ? { limitations: op.availability_note } : {}),
    ...(op.documentation_url ? { documentation_url: op.documentation_url } : {}),
  };
}

export function normalizeSource(source: MisoSource): NormalizedApi {
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
      env_var: CATALOG_META.requiredEnvVar,
    },
    response_format: "json",
    date_format: MISO_DATE_FORMAT,
    timezone: "EST",
    ...(source.documentation_url ? { documentation_url: source.documentation_url } : {}),
  };
}

export const NORMALIZED_CATALOG: NormalizedApi[] = CATALOG_OPERATIONS.map(normalizeOperation);

export function getNormalizedApi(sourceId: string): NormalizedApi | undefined {
  return NORMALIZED_CATALOG.find((api) => api.source_id === sourceId);
}
