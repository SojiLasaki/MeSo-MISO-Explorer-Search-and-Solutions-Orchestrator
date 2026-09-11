import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMeasure, toNumber } from "@/lib/miso/semantics/format";
import type { SemanticDataset, VisualizationPlan } from "@/lib/miso/semantics/types";

function chartRows(dataset: SemanticDataset, plan: VisualizationPlan) {
  const categoryField = plan.categoryField!;
  const valueField = plan.valueField!;
  const rows = dataset.rows
    .map((row) => ({
      category: String(row[categoryField] ?? ""),
      value: toNumber(row[valueField]),
    }))
    .filter((row): row is { category: string; value: number } => Boolean(row.category) && row.value != null);

  const sorted = [...rows].sort((a, b) => (plan.sort === "asc" ? a.value - b.value : b.value - a.value));
  if (plan.type === "comparison" && plan.highlightValues?.length) {
    const wanted = new Set(plan.highlightValues.map((h) => h.toLowerCase()));
    return sorted.filter((row) => wanted.has(row.category.toLowerCase()));
  }
  return sorted;
}

export function HorizontalBarChart({
  dataset,
  plan,
}: {
  dataset: SemanticDataset;
  plan: VisualizationPlan;
}) {
  if (!plan.categoryField || !plan.valueField) return null;
  const data = chartRows(dataset, plan);
  if (!data.length) return null;
  const highlights = new Set((plan.highlightValues ?? []).map((h) => h.toLowerCase()));
  const height = Math.max(220, data.length * 36);

  return (
    <div className="mt-5 rounded-2xl border bg-muted/10 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium">{plan.title}</p>
          {plan.subtitle ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{plan.subtitle}</p> : null}
        </div>
        {plan.unit ? <span className="text-[10.5px] text-muted-foreground">{plan.unit}</span> : null}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="var(--color-border)" horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={118}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <ReferenceLine x={0} stroke="var(--color-border)" />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                fontSize: 12,
              }}
              formatter={(value: number | string) => [
                formatMeasure(Number(value), plan.unit, plan.unit?.includes("$") ? 2 : 0),
                plan.unit ? "Value" : "Value",
              ]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((entry) => {
                const highlighted = highlights.size > 0 && highlights.has(entry.category.toLowerCase());
                const negative = entry.value < 0;
                return (
                  <Cell
                    key={entry.category}
                    fill={
                      negative
                        ? "var(--color-destructive)"
                        : highlighted
                          ? "var(--color-accent)"
                          : "var(--color-chart-1)"
                    }
                    fillOpacity={highlights.size && !highlighted ? 0.35 : 0.9}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ComparisonChart(props: { dataset: SemanticDataset; plan: VisualizationPlan }) {
  return <HorizontalBarChart {...props} />;
}
