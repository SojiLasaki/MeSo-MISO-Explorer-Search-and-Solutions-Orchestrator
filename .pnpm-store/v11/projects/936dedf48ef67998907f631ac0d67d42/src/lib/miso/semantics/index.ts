import { adaptAgentResultToSemanticDataset, semanticDisplayFields } from "./adapt";
import { downloadReadableCsv, buildReadableCsv } from "./csv";
import { getEndpointSemanticMeta } from "./endpoint-catalog";
import { formatIntervalLabel, formatMeasure, formatNumber, formatPercent, toNumber } from "./format";
import { inferSemanticDataset } from "./infer";
import { detectQuestionIntent, extractMentionedCategories, planVisualization } from "./plan";
import type { SemanticDataset, VisualizationPlan } from "./types";
import { validateVisualizationPlan } from "./validate";

export type { SemanticDataset, VisualizationPlan } from "./types";
export {
  adaptAgentResultToSemanticDataset,
  semanticDisplayFields,
  downloadReadableCsv,
  buildReadableCsv,
  getEndpointSemanticMeta,
  formatIntervalLabel,
  formatMeasure,
  formatNumber,
  formatPercent,
  toNumber,
  inferSemanticDataset,
  detectQuestionIntent,
  extractMentionedCategories,
  planVisualization,
  validateVisualizationPlan,
};

/** End-to-end: AgentResult → validated VisualizationPlan + dataset. */
export function buildSemanticView(
  result: Parameters<typeof adaptAgentResultToSemanticDataset>[0],
  question: string,
): { dataset: SemanticDataset; plan: VisualizationPlan } | null {
  const dataset = adaptAgentResultToSemanticDataset(result);
  if (!dataset) return null;
  const plan = validateVisualizationPlan(dataset, planVisualization(dataset, question));
  return { dataset, plan };
}
