import { isIsoDate } from "./dates";
import type { NormalizedApi, NormalizedParameter } from "./metadata";
import type { MisoParameterSpec } from "./types";

export interface ValidationIssue {
  parameter: string;
  provided: string;
  expected?: string[];
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  missing: NormalizedParameter[];
}

function asNormalized(spec: MisoParameterSpec | NormalizedParameter): NormalizedParameter {
  if ("validation_rules" in spec && "allowed_values" in spec) {
    return spec as NormalizedParameter;
  }
  const p = spec as MisoParameterSpec;
  return {
    name: p.name,
    label: p.label,
    type:
      p.type === "number"
        ? "number"
        : p.type === "date"
          ? "date"
          : p.type === "enum"
            ? "enum"
            : "string",
    required: p.required,
    description: p.description,
    ...(p.in ? { in: p.in } : {}),
    ...(p.example ? { example: p.example } : {}),
    ...(p.options?.length ? { allowed_values: p.options } : {}),
    validation_rules: [],
    dependencies: [],
  };
}

function typeCheck(param: NormalizedParameter, value: string): ValidationIssue | undefined {
  if (param.type === "date" || param.validation_rules.includes(`format:yyyy-mm-dd`)) {
    if (!isIsoDate(value)) {
      return {
        parameter: param.name,
        provided: value,
        expected: ["yyyy-mm-dd"],
        message: `${param.label} must be a calendar date in yyyy-mm-dd (MISO EST).`,
      };
    }
  }
  if (param.type === "integer" || param.validation_rules.includes("integer")) {
    if (!/^-?\d+$/.test(value)) {
      return {
        parameter: param.name,
        provided: value,
        expected: ["integer"],
        message: `${param.label} must be an integer.`,
      };
    }
  }
  if (param.type === "number" && Number.isNaN(Number(value))) {
    return {
      parameter: param.name,
      provided: value,
      message: `${param.label} must be a number.`,
    };
  }
  if (param.type === "boolean" && !/^(true|false|0|1)$/i.test(value)) {
    return {
      parameter: param.name,
      provided: value,
      expected: ["true", "false"],
      message: `${param.label} must be true or false.`,
    };
  }
  if (param.validation_rules.includes("min:1") && Number(value) < 1) {
    return {
      parameter: param.name,
      provided: value,
      expected: [">= 1"],
      message: `${param.label} must be at least 1.`,
    };
  }
  const allowed = param.allowed_values;
  if (allowed?.length && !allowed.includes(value)) {
    return {
      parameter: param.name,
      provided: value,
      expected: allowed,
      message: `Invalid ${param.label.toLowerCase()}.`,
    };
  }
  return undefined;
}

export function validateCatalogParameters(
  metadata: NormalizedApi,
  params: Record<string, string>,
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const missing: NormalizedParameter[] = [];

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
      message: "localResourceZone is required when geoResolution is localResourceZone.",
    });
  }
  if (lrz && geo && geo !== "localResourceZone") {
    errors.push({
      parameter: "geoResolution",
      provided: geo,
      expected: ["localResourceZone"],
      message: "geoResolution must be localResourceZone when localResourceZone is set.",
    });
  }

  const region = params["region"];
  const node = params["node"];
  if (region && node) {
    const regionParam = metadata.parameters.find((p) => p.name === "region");
    if (regionParam?.allowed_values && !regionParam.allowed_values.includes(region)) {
      errors.push({
        parameter: "region",
        provided: region,
        expected: regionParam.allowed_values,
        message: "Region and pricing-node filters cannot be combined this way.",
      });
    }
  }

  return { ok: errors.length === 0 && missing.length === 0, errors, missing };
}

export function questionForParameter(
  param: NormalizedParameter | MisoParameterSpec,
  dataset?: string,
): string {
  const spec = asNormalized(param);
  const about = dataset ? ` for ${dataset}` : "";
  if (spec.name === "date" || spec.type === "date") {
    return `What date would you like${about}? You can say yesterday, today, or a date like September 5.`;
  }
  if (spec.allowed_values?.length) {
    return `Which ${spec.label.toLowerCase()} should we use${about}? Choose one of: ${spec.allowed_values.join(", ")}.`;
  }
  return `What ${spec.label.toLowerCase()} should we use${about}?`;
}
