import type { SemanticDataType, SemanticDataset, SemanticField, SemanticType } from "./types";
import { toNumber } from "./format";

const TIME_HINTS = [/time/i, /date/i, /interval/i, /timestamp/i, /period/i];
const LOCATION_HINTS = [/region/i, /zone/i, /node/i, /hub/i, /lat/i, /lon/i, /location/i];
const ID_HINTS = [/^id$/i, /uuid/i, /refid/i, /source/i];

function looksLikeDatetime(name: string, sample: unknown): boolean {
  if (TIME_HINTS.some((re) => re.test(name))) return true;
  if (typeof sample !== "string") return false;
  return /\d{4}-\d{2}-\d{2}/.test(sample) || /\d{1,2}:\d{2}/.test(sample);
}

function uniqueStrings(rows: Record<string, unknown>[], key: string): number {
  const set = new Set<string>();
  for (const row of rows) {
    const value = row[key];
    if (value != null && value !== "") set.add(String(value));
  }
  return set.size;
}

function inferDataType(name: string, samples: unknown[]): SemanticDataType {
  if (samples.some((s) => toNumber(s) != null) && samples.every((s) => s == null || toNumber(s) != null || s === "")) {
    return "number";
  }
  if (samples.some((s) => looksLikeDatetime(name, s))) return "datetime";
  return "string";
}

/**
 * Low-confidence inference when no endpoint catalog entry exists.
 * Prefers a safe generic_table when signals are weak.
 */
export function inferSemanticDataset(
  rows: Record<string, unknown>[],
  options?: { title?: string; endpointId?: string; unit?: string; source?: string },
): SemanticDataset {
  if (!rows.length) {
    return {
      title: options?.title,
      endpointId: options?.endpointId,
      semanticType: "generic_table",
      rows: [],
      fields: [],
      metadata: { source: options?.source, confidence: "low", unit: options?.unit },
    };
  }

  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const fields: SemanticField[] = keys.map((name) => {
    const samples = rows.map((row) => row[name]).filter((v) => v != null && v !== "");
    const dataType = inferDataType(name, samples);
    let role: SemanticField["role"] = "metadata";
    if (ID_HINTS.some((re) => re.test(name))) role = "identifier";
    else if (dataType === "datetime" || looksLikeDatetime(name, samples[0])) role = "time";
    else if (LOCATION_HINTS.some((re) => re.test(name))) role = "location";
    else if (dataType === "number") role = "measure";
    else if (dataType === "string" && uniqueStrings(rows, name) > 1 && uniqueStrings(rows, name) <= Math.max(rows.length, 2)) {
      role = "dimension";
    }
    return {
      name,
      label: name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      role,
      dataType,
      unit: role === "measure" ? options?.unit : undefined,
    };
  });

  const measures = fields.filter((f) => f.role === "measure");
  const dimensions = fields.filter((f) => f.role === "dimension");
  const times = fields.filter((f) => f.role === "time");

  let semanticType: SemanticType = "generic_table";
  let confidence: "inferred" | "low" = "low";

  if (times.length && measures.length && rows.length >= 3) {
    semanticType = "time_series";
    confidence = "inferred";
  } else if (dimensions.length && measures.length && rows.length >= 2) {
    const dimCardinality = uniqueStrings(rows, dimensions[0]!.name);
    if (dimCardinality === rows.length || dimCardinality >= 2) {
      semanticType = "categorical_comparison";
      confidence = "inferred";
    }
  } else if (measures.length === 1 && rows.length === 1) {
    semanticType = "single_metric";
    confidence = "inferred";
  }

  return {
    title: options?.title,
    endpointId: options?.endpointId,
    semanticType,
    rows,
    fields,
    metadata: {
      unit: options?.unit,
      source: options?.source,
      confidence,
      timestamp: times[0] ? String(rows[0]?.[times[0].name] ?? "") || undefined : undefined,
    },
  };
}
