import type { AgentResult } from "@/lib/local-backend";

import { getEndpointSemanticMeta } from "./endpoint-catalog";
import { formatIntervalLabel, toNumber } from "./format";
import { inferSemanticDataset } from "./infer";
import type { SemanticDataset, SemanticField } from "./types";

type AgentDataEnvelope = NonNullable<AgentResult["data"]> & {
  totalMW?: string | number;
  refId?: string;
  source?: string;
  raw?: unknown;
};

/**
 * Convert an AgentResult payload into a SemanticDataset.
 * Catalog metadata wins; otherwise fall back to field inference.
 */
export function adaptAgentResultToSemanticDataset(result: AgentResult): SemanticDataset | null {
  const envelope = (result.data ?? {}) as AgentDataEnvelope;
  const rows = (envelope.data ?? []).map((row) => ({ ...row })) as Record<string, unknown>[];
  if (!rows.length && result.status !== "success") return null;
  if (!rows.length) return null;

  const meta = getEndpointSemanticMeta(result.endpoint?.id);
  const unit = meta?.unit ?? result.endpoint?.unit;

  if (!meta) {
    return inferSemanticDataset(rows, {
      title: result.endpoint?.name,
      endpointId: result.endpoint?.id,
      unit,
      source: typeof envelope.source === "string" ? envelope.source : result.verification?.source,
    });
  }

  const categoryKey = meta.fields.category;
  const valueKey = meta.fields.value;
  const timeKey = meta.fields.timestamp;
  const hide = new Set(meta.hideFields ?? []);

  const fields: SemanticField[] = [];
  if (categoryKey) {
    fields.push({
      name: categoryKey,
      label: meta.labels.category ?? "Category",
      role: "dimension",
      dataType: "string",
    });
  }
  if (valueKey) {
    fields.push({
      name: valueKey,
      label: meta.labels.value ? `${meta.labels.value}${unit ? ` (${unit})` : ""}` : "Value",
      role: "measure",
      unit,
      dataType: "number",
    });
  }
  if (timeKey) {
    fields.push({
      name: timeKey,
      label: meta.labels.timestamp ?? "Interval",
      role: "time",
      dataType: "datetime",
    });
  }
  if (meta.fields.location) {
    fields.push({
      name: meta.fields.location,
      label: "Location",
      role: "location",
      dataType: "string",
    });
  }

  // Preserve extra columns that aren't hidden / already listed.
  for (const key of Object.keys(rows[0] ?? {})) {
    if (hide.has(key)) continue;
    if (fields.some((f) => f.name === key)) continue;
    fields.push({
      name: key,
      label: key,
      role: "metadata",
      dataType: "string",
    });
  }

  const authoritativeTotal =
    toNumber(envelope.totalMW) ??
    (meta.fields.total && meta.fields.total !== "totalMW"
      ? toNumber((rows[0] as Record<string, unknown> | undefined)?.[meta.fields.total])
      : null);

  const timestampRaw =
    (timeKey ? rows[0]?.[timeKey] : undefined) ?? envelope.refId ?? undefined;

  return {
    title: result.endpoint?.name,
    endpointId: meta.endpointId,
    semanticType: meta.semanticType,
    rows,
    fields,
    metadata: {
      unit,
      total: authoritativeTotal ?? undefined,
      timestamp: timestampRaw != null ? formatIntervalLabel(timestampRaw) : undefined,
      source: typeof envelope.source === "string" ? envelope.source : result.verification?.source,
      confidence: "catalog",
    },
  };
}

/** Columns used for CSV / semantic table (respect hideFields + preferred order). */
export function semanticDisplayFields(dataset: SemanticDataset): SemanticField[] {
  const meta = getEndpointSemanticMeta(dataset.endpointId);
  const hide = new Set(meta?.hideFields ?? []);
  const preferred = dataset.fields.filter((f) => !hide.has(f.name) && f.role !== "metadata");
  if (preferred.length) return preferred;
  return dataset.fields.filter((f) => !hide.has(f.name));
}
