import { getEndpointSemanticMeta } from "./endpoint-catalog";
import { formatIntervalLabel, formatMeasure, formatPercent, toNumber } from "./format";
import type { SemanticDataset, VisualizationMetric, VisualizationPlan, VisualizationType } from "./types";

export type QuestionIntent =
  | "most"
  | "least"
  | "percentage"
  | "compare"
  | "mix"
  | "generic";

export function detectQuestionIntent(question: string): QuestionIntent {
  const q = question.toLowerCase();
  if (/\b(percent|percentage|share|portion|fraction)\b/.test(q)) return "percentage";
  if (/\b(mix|composition|breakdown|split)\b/.test(q)) return "mix";
  if (/\b(compare|vs\.?|versus|difference between)\b/.test(q)) return "compare";
  if (/\b(most|highest|largest|top|biggest|greatest)\b/.test(q)) return "most";
  if (/\b(least|lowest|smallest|minimum|fewest)\b/.test(q)) return "least";
  return "generic";
}

/** Extract quoted or known category names mentioned in the question. */
export function extractMentionedCategories(question: string, categories: string[]): string[] {
  const q = question.toLowerCase();
  const hits = categories.filter((name) => q.includes(name.toLowerCase()));
  const quoted = [...question.matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2] ?? "");
  for (const name of quoted) {
    const match = categories.find((c) => c.toLowerCase() === name.toLowerCase());
    if (match && !hits.includes(match)) hits.push(match);
  }
  // Common fuel aliases
  const aliases: Record<string, string[]> = {
    gas: ["Natural Gas"],
    "natural gas": ["Natural Gas"],
    coal: ["Coal"],
    wind: ["Wind"],
    solar: ["Solar"],
    nuclear: ["Nuclear"],
    battery: ["Battery Storage"],
    imports: ["Imports"],
  };
  for (const [alias, targets] of Object.entries(aliases)) {
    if (q.includes(alias)) {
      for (const target of targets) {
        if (categories.includes(target) && !hits.includes(target)) hits.push(target);
      }
    }
  }
  return hits;
}

function fieldByRole(dataset: SemanticDataset, role: SemanticDataset["fields"][number]["role"]) {
  return dataset.fields.find((f) => f.role === role);
}

function numericValues(dataset: SemanticDataset, valueField: string): number[] {
  return dataset.rows
    .map((row) => toNumber(row[valueField]))
    .filter((n): n is number => n != null);
}

function buildCategoricalMetrics(
  dataset: SemanticDataset,
  categoryField: string,
  valueField: string,
  unit: string | undefined,
  intent: QuestionIntent,
  highlights: string[],
): { metrics: VisualizationMetric[]; insight?: string } {
  const pairs = dataset.rows
    .map((row) => ({
      category: String(row[categoryField] ?? ""),
      value: toNumber(row[valueField]),
    }))
    .filter((p): p is { category: string; value: number } => Boolean(p.category) && p.value != null);

  if (!pairs.length) return { metrics: [] };

  const sortedDesc = [...pairs].sort((a, b) => b.value - a.value);
  const largest = sortedDesc[0]!;
  const smallest = sortedDesc[sortedDesc.length - 1]!;
  const total = dataset.metadata?.total;
  const metrics: VisualizationMetric[] = [];

  if (total != null) {
    metrics.push({
      label: "Total Generation",
      value: formatMeasure(total, unit),
      helperText: dataset.metadata?.timestamp ? `As of ${dataset.metadata.timestamp}` : undefined,
    });
  }

  metrics.push({
    label: "Largest Source",
    value: `${largest.category} — ${formatMeasure(largest.value, unit)}`,
  });
  metrics.push({
    label: dataset.endpointId === "realtime_generation_fuel_type" ? "Fuel Categories" : "Categories",
    value: pairs.length,
  });

  if (intent === "percentage" && highlights[0] && total != null && total !== 0) {
    const hit = pairs.find((p) => p.category.toLowerCase() === highlights[0]!.toLowerCase());
    if (hit) {
      const pct = (hit.value / total) * 100;
      metrics.push({
        label: `${hit.category} Share`,
        value: formatPercent(pct),
        helperText: formatMeasure(hit.value, unit),
      });
    }
  } else if (highlights.length === 1) {
    const hit = pairs.find((p) => p.category.toLowerCase() === highlights[0]!.toLowerCase());
    if (hit) {
      metrics.push({
        label: hit.category,
        value: formatMeasure(hit.value, unit),
      });
    }
  } else if (intent === "compare" && highlights.length >= 2) {
    const a = pairs.find((p) => p.category.toLowerCase() === highlights[0]!.toLowerCase());
    const b = pairs.find((p) => p.category.toLowerCase() === highlights[1]!.toLowerCase());
    if (a && b) {
      metrics.push({
        label: "Difference",
        value: formatMeasure(Math.abs(a.value - b.value), unit),
        helperText: `${a.category} vs ${b.category}`,
      });
    }
  } else if (intent === "least") {
    metrics.push({
      label: "Smallest Source",
      value: `${smallest.category} — ${formatMeasure(smallest.value, unit)}`,
    });
  }

  let insight: string | undefined;
  if (intent === "percentage" && highlights[0] && total != null && total !== 0) {
    const hit = pairs.find((p) => p.category.toLowerCase() === highlights[0]!.toLowerCase());
    if (hit) {
      insight = `${hit.category} is ${formatPercent((hit.value / total) * 100)} of total generation (${formatMeasure(hit.value, unit)} of ${formatMeasure(total, unit)}).`;
    }
  } else if (intent === "compare" && highlights.length >= 2) {
    const a = pairs.find((p) => p.category.toLowerCase() === highlights[0]!.toLowerCase());
    const b = pairs.find((p) => p.category.toLowerCase() === highlights[1]!.toLowerCase());
    if (a && b) {
      const leader = a.value >= b.value ? a : b;
      const trailer = a.value >= b.value ? b : a;
      insight = `${leader.category} leads ${trailer.category} by ${formatMeasure(Math.abs(a.value - b.value), unit)}.`;
    }
  } else if (intent === "least") {
    insight = `${smallest.category} is currently the smallest source at ${formatMeasure(smallest.value, unit)}.`;
  } else {
    insight = `${largest.category} is currently the largest generation source at ${formatMeasure(largest.value, unit)}.`;
  }

  return { metrics, insight };
}

function buildTimeSeriesMetrics(
  dataset: SemanticDataset,
  valueField: string,
  timeField: string | undefined,
  unit: string | undefined,
): { metrics: VisualizationMetric[]; insight?: string } {
  const values = numericValues(dataset, valueField);
  if (!values.length) return { metrics: [] };
  const latest = values[values.length - 1]!;
  const high = Math.max(...values);
  const low = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const first = values[0]!;
  const changePct = first !== 0 ? ((latest - first) / Math.abs(first)) * 100 : null;

  const metrics: VisualizationMetric[] = [
    { label: "Latest", value: formatMeasure(latest, unit, unit?.includes("$") ? 2 : 0) },
    { label: "High", value: formatMeasure(high, unit, unit?.includes("$") ? 2 : 0) },
    { label: "Low", value: formatMeasure(low, unit, unit?.includes("$") ? 2 : 0) },
    { label: "Average", value: formatMeasure(avg, unit, unit?.includes("$") ? 2 : 1) },
  ];

  let insight: string | undefined;
  if (changePct != null && values.length > 1) {
    const direction = changePct >= 0 ? "increased" : "decreased";
    insight = `${dataset.title ?? "Series"} ${direction} ${formatPercent(Math.abs(changePct))} over the selected period.`;
  }
  if (timeField && dataset.rows.length) {
    const stamp = formatIntervalLabel(dataset.rows[dataset.rows.length - 1]?.[timeField]);
    metrics[0] = { ...metrics[0]!, helperText: stamp !== "—" ? stamp : undefined };
  }
  return { metrics, insight };
}

/**
 * Deterministic visualization planner. Does not emit JSX — only a plan.
 */
export function planVisualization(dataset: SemanticDataset, question = ""): VisualizationPlan {
  const meta = getEndpointSemanticMeta(dataset.endpointId);
  const intent = detectQuestionIntent(question);
  const categoryField = meta?.fields.category ?? fieldByRole(dataset, "dimension")?.name;
  const valueField = meta?.fields.value ?? fieldByRole(dataset, "measure")?.name;
  const timeField = meta?.fields.timestamp ?? fieldByRole(dataset, "time")?.name;
  const unit = dataset.metadata?.unit ?? meta?.unit;

  const categories =
    categoryField != null
      ? dataset.rows.map((row) => String(row[categoryField] ?? "")).filter(Boolean)
      : [];
  const highlights = extractMentionedCategories(question, Array.from(new Set(categories)));

  let type: VisualizationType = meta?.defaultVisualization ?? "table";
  if (dataset.semanticType === "time_series" || dataset.semanticType === "multi_time_series") {
    type = "line";
  } else if (dataset.semanticType === "categorical_comparison" || dataset.semanticType === "ranking") {
    type = intent === "percentage" || intent === "mix" ? "donut" : intent === "compare" && highlights.length >= 2 ? "comparison" : "horizontal_bar";
  } else if (dataset.semanticType === "single_metric") {
    type = "metric";
  } else if (dataset.semanticType === "generic_table" || dataset.metadata?.confidence === "low") {
    type = "table";
  }

  if (!valueField) type = "table";
  if ((type === "horizontal_bar" || type === "donut" || type === "comparison") && !categoryField) {
    type = "table";
  }

  const title = dataset.title ?? "MISO data";
  const subtitle = dataset.metadata?.timestamp
    ? `Interval ${dataset.metadata.timestamp}`
    : dataset.metadata?.source;

  let metrics: VisualizationMetric[] | undefined;
  let insight: string | undefined;

  if (categoryField && valueField && (dataset.semanticType === "categorical_comparison" || dataset.semanticType === "composition" || dataset.semanticType === "ranking")) {
    const built = buildCategoricalMetrics(dataset, categoryField, valueField, unit, intent, highlights);
    metrics = built.metrics;
    insight = built.insight;
  } else if (valueField && (dataset.semanticType === "time_series" || dataset.semanticType === "multi_time_series")) {
    const built = buildTimeSeriesMetrics(dataset, valueField, timeField, unit);
    metrics = built.metrics;
    insight = built.insight;
  }

  // For "most" intent keep ranked horizontal bar even if mix was default elsewhere.
  if (intent === "most" && categoryField && valueField) type = "horizontal_bar";
  if (intent === "compare" && highlights.length >= 2) type = "comparison";

  return {
    type,
    title,
    subtitle,
    categoryField,
    valueField,
    timeField,
    unit,
    sort: intent === "least" ? "asc" : "desc",
    highlightValues: highlights.length ? highlights : undefined,
    metrics,
    insight,
    useAuthoritativeTotal: dataset.metadata?.total != null,
  };
}
