import { ArrowUpRight } from "lucide-react";

import { ApiRequestViewer } from "./ApiRequestViewer";
import { ChartViewer } from "./ChartViewer";
import { DataTable } from "./DataTable";
import { DownloadButton } from "./DownloadButton";
import { ErrorResolution } from "./ErrorResolution";
import { ErrorState } from "./ErrorState";
import { ExecutionTimeline } from "./ExecutionTimeline";
import { SourceIndicator } from "./SourceIndicator";
import { RequiredParametersForm } from "./RequiredParametersForm";
import type { MisoResponse } from "@/lib/miso/types";

const PTD_ENDPOINT_BY_SOURCE_ID: Record<string, string> = {
  "get-v1-real-time-date-demand-actual": "actual_load",
  "get-v1-day-ahead-date-demand": "day_ahead_demand",
  "get-v1-real-time-date-lmp-expost": "realtime_lmp",
  "get-v1-real-time-date-generation-fuel-type": "realtime_generation_fuel_type",
};

function ptdHandoffHref(response: MisoResponse) {
  const endpoint = response.source ? PTD_ENDPOINT_BY_SOURCE_ID[response.source.id] : undefined;
  if (!endpoint || response.execution.status !== "success") return null;
  const search = new URLSearchParams({ from: "miso-agent", endpoint });
  for (const [key, value] of Object.entries(response.parameters)) {
    if (value) search.set(key, value);
  }
  return `/power-trader?${search.toString()}`;
}

export function ResultViewer({
  response,
  onFix,
  onEdit,
  onRetry,
  onSubmitParameters,
}: {
  response: MisoResponse;
  onFix?: (question: string) => void;
  onEdit?: () => void;
  onRetry?: (question: string, overrides: Record<string, string>) => void;
  onSubmitParameters?: (question: string, overrides: Record<string, string>) => void;
}) {
  const { output, data, api, report, metrics, error } = response;

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState error={error} {...(onEdit ? { onEdit } : {})} />
        <ErrorResolution
          response={response}
          {...(onRetry ? { onRetry } : {})}
          {...(onSubmitParameters ? { onSubmitParameters } : {})}
        />
        <div className="lg:hidden">
          <ExecutionTimeline
            steps={response.execution.steps}
            durationMs={response.execution.duration_ms}
          />
        </div>
      </div>
    );
  }

  if (response.clarification) {
    return (
      <div className="animate-rise space-y-3">
        <p className="whitespace-pre-line text-[15.5px] leading-relaxed">
          {response.clarification}
        </p>
        {onSubmitParameters && (
          <RequiredParametersForm response={response} onSubmit={onSubmitParameters} />
        )}
      </div>
    );
  }

  const showChart =
    output.mode === "chart" || (output.include_chart && (data?.rows.length ?? 0) > 1);
  const showTable =
    output.mode === "table" ||
    output.mode === "csv" ||
    (output.include_table && (data?.rows.length ?? 0) > 1);
  const showMetrics = Boolean(metrics?.length) && output.mode !== "api";
  const showAnswerFirst = output.mode === "answer" && !data && !report;
  const handoffHref = ptdHandoffHref(response);

  return (
    <div className="animate-rise space-y-5">
      {response.title && (
        <div className="space-y-2">
          <h3 className="text-[19px] font-medium tracking-tight">{response.title}</h3>
          {response.source && (
            <SourceIndicator name={response.source.name} type={response.source.type} />
          )}
        </div>
      )}

      {showMetrics && (
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics!.map((m) => (
            <div key={m.label} className="rounded-xl border bg-card px-4 py-3">
              <p className="text-[12px] text-muted-foreground">{m.label}</p>
              <p className="mt-0.5 text-[21px] font-medium tabular-nums tracking-tight">
                {m.value}
              </p>
              {m.sub && <p className="text-[12px] text-muted-foreground">{m.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {showChart && data && <ChartViewer data={data} />}
      {showTable && data && <DataTable data={data} />}

      {handoffHref && (
        <a
          href={handoffHref}
          className="group flex items-center justify-between gap-4 rounded-xl border border-dashed bg-muted/35 px-4 py-3 transition-colors hover:bg-muted/55"
        >
          <div>
            <p className="text-[13px] font-medium">Open in PTD Infographcs</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              Send these non-secret MISO parameters to the separate chart workspace.
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}

      {report && (
        <a
          href={report.url}
          target="_blank"
          rel="noreferrer"
          className="group block rounded-xl border bg-card p-5 transition-shadow hover:shadow-soft"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium">{report.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{report.description}</p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Published {report.published} · {report.format}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </a>
      )}

      {showAnswerFirst && response.explanation && (
        <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground">
          {response.explanation}
        </p>
      )}

      {api && (output.include_api || output.mode === "api") && <ApiRequestViewer api={api} />}

      {data && (output.include_download || output.mode === "csv") && (
        <DownloadButton data={data} filename={response.source?.id ?? "miso-data"} />
      )}

      {!showAnswerFirst && response.explanation && (
        <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground">
          {response.explanation}
        </p>
      )}

      {response.api_nudge && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {response.api_nudge.message}
          </p>
          {onFix && (
            <button
              type="button"
              onClick={() => onFix(response.api_nudge!.ask)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-card"
            >
              {response.api_nudge.cta_label}
            </button>
          )}
        </div>
      )}

      <div className="lg:hidden">
        <ExecutionTimeline
          steps={response.execution.steps}
          durationMs={response.execution.duration_ms}
        />
      </div>
    </div>
  );
}
