import type { VisualizationMetric } from "@/lib/miso/semantics/types";

export function MetricCards({ metrics }: { metrics: VisualizationMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-[15px] font-medium leading-snug sm:text-[16px]">{metric.value}</p>
          {metric.helperText ? (
            <p className="mt-1 text-[10.5px] text-muted-foreground">{metric.helperText}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
