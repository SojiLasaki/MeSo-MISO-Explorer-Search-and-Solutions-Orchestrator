import type { AgentResult } from "@/lib/local-backend";

import { buildSemanticView, semanticDisplayFields } from "./index";
import { formatIntervalLabel, toNumber } from "./format";

function escapeCsv(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function rowsToCsv(headers: string[], body: unknown[][]): string {
  return [headers, ...body].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

/**
 * Build a human-readable CSV from an agent result.
 * Prefers semantic labels (Fuel Type, Generation (MW), …);
 * falls back to flattened row keys with humanized headers.
 */
export function buildReadableCsv(result: AgentResult, question = ""): string | null {
  const semantic = buildSemanticView(result, question);
  const lines: string[] = [];

  // Optional provenance header rows (comment-style, still openable in Excel as text).
  const totalMW = result.data && "totalMW" in result.data ? toNumber(result.data.totalMW) : null;
  const refId = result.data && typeof result.data.refId === "string" ? result.data.refId : null;
  const source =
    (result.data && typeof result.data.source === "string" && result.data.source) ||
    result.verification?.source ||
    null;

  if (result.endpoint?.name || source || totalMW != null || refId) {
    lines.push(escapeCsv("# MISO AI export"));
    if (result.endpoint?.name) lines.push([escapeCsv("# Dataset"), escapeCsv(result.endpoint.name)].join(","));
    if (source) lines.push([escapeCsv("# Source"), escapeCsv(source)].join(","));
    if (refId) lines.push([escapeCsv("# Reference"), escapeCsv(refId)].join(","));
    if (totalMW != null) {
      lines.push([escapeCsv("# Total Generation (MW)"), escapeCsv(String(totalMW))].join(","));
    }
    lines.push(""); // blank separator before the table
  }

  if (semantic) {
    const fields = semanticDisplayFields(semantic.dataset);
    const rows = semantic.dataset.rows;
    if (fields.length && rows.length) {
      const headers = fields.map((field) => field.label);
      const body = rows.map((row) =>
        fields.map((field) => {
          const raw = row[field.name];
          if (field.role === "time") return formatIntervalLabel(raw);
          if (field.role === "measure" || field.dataType === "number") {
            const n = toNumber(raw);
            // Plain number (no thousands separators) so Excel keeps it numeric.
            return n == null ? "" : String(n);
          }
          return raw == null ? "" : String(raw);
        }),
      );
      lines.push(rowsToCsv(headers, body));
      return lines.join("\r\n");
    }
  }

  const data = result.data?.data ?? [];
  if (!data.length) return null;

  const columns = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const headers = columns.map(humanizeKey);
  const body = data.map((row) =>
    columns.map((column) => {
      const raw = row[column];
      if (typeof raw === "number") return String(raw);
      if (typeof raw === "string" && (column.toLowerCase().includes("interval") || column.toLowerCase().includes("date") || column.toLowerCase().includes("time"))) {
        return formatIntervalLabel(raw);
      }
      const asNum = toNumber(raw);
      if (asNum != null && String(raw).trim() !== "" && !Number.isNaN(Number(String(raw).replace(/,/g, "")))) {
        // Prefer numeric when the cell is clearly a number string.
        if (/^-?\d+(\.\d+)?$/.test(String(raw).trim()) || /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(String(raw).trim())) {
          return String(asNum);
        }
      }
      return raw == null ? "" : String(raw);
    }),
  );
  lines.push(rowsToCsv(headers, body));
  return lines.join("\r\n");
}

export function downloadReadableCsv(result: AgentResult, question = "") {
  const csv = buildReadableCsv(result, question);
  if (!csv) return false;
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  const stamp = result.parameters?.date ?? new Date().toISOString().slice(0, 10);
  anchor.download = `${result.endpoint?.id ?? "miso-data"}-${stamp}.csv`;
  anchor.click();
  URL.revokeObjectURL(href);
  return true;
}
