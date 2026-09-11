import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatMeasure, formatPercent, toNumber } from "@/lib/miso/semantics/format";
import type { SemanticDataset, VisualizationPlan } from "@/lib/miso/semantics/types";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-muted-foreground)",
];

export function DonutChart({
  dataset,
  plan,
}: {
  dataset: SemanticDataset;
  plan: VisualizationPlan;
}) {
  if (!plan.categoryField || !plan.valueField) return null;

  const rows = dataset.rows
    .map((row) => ({
      name: String(row[plan.categoryField!] ?? ""),
      value: toNumber(row[plan.valueField!]),
    }))
    .filter((row): row is { name: string; value: number } => Boolean(row.name) && row.value != null)
    // Donut composition uses non-negative shares; keep negatives out of the pie but note them.
    .filter((row) => row.value >= 0)
    .sort((a, b) => b.value - a.value);

  if (!rows.length) return null;

  const sum = rows.reduce((acc, row) => acc + row.value, 0);
  const total = plan.useAuthoritativeTotal && dataset.metadata?.total != null ? dataset.metadata.total : sum;
  const highlights = new Set((plan.highlightValues ?? []).map((h) => h.toLowerCase()));

  return (
    <div className="mt-5 rounded-2xl border bg-muted/10 p-4">
      <div className="mb-2">
        <p className="text-[13px] font-medium">{plan.title}</p>
        {plan.subtitle ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{plan.subtitle}</p> : null}
      </div>
      <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
        <div className="mx-auto h-52 w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2}>
                {rows.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={highlights.size && !highlights.has(entry.name.toLowerCase()) ? 0.35 : 0.95}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                  fontSize: 12,
                }}
                formatter={(value: number | string, name: string) => {
                  const numeric = Number(value);
                  const pct = total ? formatPercent((numeric / total) * 100) : "—";
                  return [`${formatMeasure(numeric, plan.unit)} (${pct})`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-[12px]">
          {rows.slice(0, 8).map((row, index) => {
            const pct = total ? (row.value / total) * 100 : 0;
            const active = !highlights.size || highlights.has(row.name.toLowerCase());
            return (
              <li
                key={row.name}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${active ? "bg-card" : "bg-muted/20 opacity-60"}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                  <span className="truncate font-medium">{row.name}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatMeasure(row.value, plan.unit)} · {formatPercent(pct)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
