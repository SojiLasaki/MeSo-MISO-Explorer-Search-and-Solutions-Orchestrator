import { formatIntervalLabel, formatNumber, toNumber } from "@/lib/miso/semantics/format";
import { semanticDisplayFields } from "@/lib/miso/semantics";
import type { SemanticDataset } from "@/lib/miso/semantics/types";

export function SemanticTable({
  dataset,
  maxRows = 12,
}: {
  dataset: SemanticDataset;
  maxRows?: number;
}) {
  const fields = semanticDisplayFields(dataset);
  const rows = dataset.rows.slice(0, maxRows);
  if (!fields.length || !rows.length) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border">
      <div className="border-b bg-muted/25 px-3 py-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {dataset.title ? `${dataset.title} · ` : ""}
        {dataset.rows.length.toLocaleString()} rows
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b bg-muted/15 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
              {fields.map((field) => (
                <th key={field.name} className="px-3 py-2 font-medium">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b last:border-0">
                {fields.map((field) => {
                  const raw = row[field.name];
                  let display: string;
                  if (field.role === "time") display = formatIntervalLabel(raw);
                  else if (field.dataType === "number" || field.role === "measure") {
                    const n = toNumber(raw);
                    display = n == null ? "—" : formatNumber(n, field.unit?.includes("$") ? 2 : 0);
                  } else display = raw == null || raw === "" ? "—" : String(raw);
                  return (
                    <td key={field.name} className="px-3 py-2">
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
