import { toNumber } from "./format";
import type { SemanticDataset, VisualizationPlan } from "./types";

/**
 * Ensure the plan only references fields/values that exist in the dataset.
 * Falls back to a safe table plan when validation fails.
 */
export function validateVisualizationPlan(
  dataset: SemanticDataset,
  plan: VisualizationPlan,
): VisualizationPlan {
  const available = new Set(dataset.fields.map((f) => f.name));
  const rowKeys = new Set(dataset.rows.flatMap((row) => Object.keys(row)));

  const fieldExists = (name: string | undefined) =>
    !name || available.has(name) || rowKeys.has(name);

  let type = plan.type;
  let categoryField = plan.categoryField;
  let valueField = plan.valueField;
  let timeField = plan.timeField;

  if (!fieldExists(categoryField)) categoryField = undefined;
  if (!fieldExists(valueField)) valueField = undefined;
  if (!fieldExists(timeField)) timeField = undefined;

  if (valueField) {
    const sample = dataset.rows.map((row) => toNumber(row[valueField!])).filter((n) => n != null);
    if (!sample.length) valueField = undefined;
  }

  let highlightValues = plan.highlightValues;
  if (highlightValues?.length && categoryField) {
    const cats = new Set(
      dataset.rows.map((row) => String(row[categoryField!] ?? "").toLowerCase()).filter(Boolean),
    );
    highlightValues = highlightValues.filter((h) => cats.has(h.toLowerCase()));
    if (!highlightValues.length) highlightValues = undefined;
  }

  if (
    (type === "horizontal_bar" || type === "vertical_bar" || type === "donut" || type === "comparison") &&
    (!categoryField || !valueField)
  ) {
    type = "table";
  }
  if ((type === "line" || type === "multi_line") && !valueField) {
    type = "table";
  }
  if (type === "comparison" && (!highlightValues || highlightValues.length < 2)) {
    type = categoryField && valueField ? "horizontal_bar" : "table";
  }

  return {
    ...plan,
    type,
    categoryField,
    valueField,
    timeField,
    highlightValues,
  };
}
