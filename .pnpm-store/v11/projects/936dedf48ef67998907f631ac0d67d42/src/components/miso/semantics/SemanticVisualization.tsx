import { MetricCards } from "./MetricCards";
import { ComparisonChart, HorizontalBarChart } from "./HorizontalBarChart";
import { DonutChart } from "./DonutChart";
import { LineChartView } from "./LineChartView";
import { SemanticTable } from "./SemanticTable";
import type { SemanticDataset, VisualizationPlan } from "@/lib/miso/semantics/types";

export function SemanticVisualization({
  dataset,
  plan,
}: {
  dataset: SemanticDataset;
  plan: VisualizationPlan;
}) {
  return (
    <div className="mt-2">
      {plan.metrics?.length ? <MetricCards metrics={plan.metrics} /> : null}
      {plan.insight ? (
        <p className="mt-4 rounded-2xl border border-accent/15 bg-accent-soft/20 px-4 py-3 text-[13px] leading-relaxed text-foreground">
          {plan.insight}
        </p>
      ) : null}

      {plan.type === "horizontal_bar" || plan.type === "vertical_bar" ? (
        <HorizontalBarChart dataset={dataset} plan={plan} />
      ) : null}
      {plan.type === "comparison" ? <ComparisonChart dataset={dataset} plan={plan} /> : null}
      {plan.type === "donut" ? <DonutChart dataset={dataset} plan={plan} /> : null}
      {plan.type === "line" || plan.type === "multi_line" ? (
        <LineChartView dataset={dataset} plan={plan} />
      ) : null}
      {plan.type === "metric" && !plan.metrics?.length ? (
        <p className="mt-4 text-[13px] text-muted-foreground">No metric could be derived from this response.</p>
      ) : null}

      {/* Always keep a readable semantic table under the chart for provenance of rows. */}
      <SemanticTable dataset={dataset} />
    </div>
  );
}
