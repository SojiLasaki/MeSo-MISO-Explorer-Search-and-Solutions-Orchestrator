import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatIntervalLabel, formatMeasure, toNumber } from "@/lib/miso/semantics/format";
import type { SemanticDataset, VisualizationPlan } from "@/lib/miso/semantics/types";

export function LineChartView({
  dataset,
  plan,
}: {
  dataset: SemanticDataset;
  plan: VisualizationPlan;
}) {
  if (!plan.valueField) return null;
  const timeField = plan.timeField;
  const data = dataset.rows
    .map((row, index) => ({
      label: timeField ? formatIntervalLabel(row[timeField]) : String(index + 1),
      value: toNumber(row[plan.valueField!]),
    }))
    .filter((row): row is { label: string; value: number } => row.value != null);

  if (data.length < 2) return null;

  return (
    <div className="mt-5 rounded-2xl border bg-muted/10 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium">{plan.title}</p>
          {plan.subtitle ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{plan.subtitle}</p> : null}
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                fontSize: 12,
              }}
              formatter={(value: number | string) => [
                formatMeasure(Number(value), plan.unit, plan.unit?.includes("$") ? 2 : 0),
                "",
              ]}
            />
            <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
