import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, CircleAlert, RotateCcw, SlidersHorizontal } from "lucide-react";

import { RequiredParametersForm } from "./RequiredParametersForm";
import { ExecutionTimeline } from "./ExecutionTimeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MisoResponse, ParameterDetail } from "@/lib/miso/types";

function statusLabel(status: ParameterDetail["status"]) {
  if (status === "valid") return "Checked";
  if (status === "invalid") return "Needs correction";
  return "Needs input";
}

function statusClass(status: ParameterDetail["status"]) {
  if (status === "valid") return "bg-success-soft text-success";
  if (status === "invalid") return "bg-destructive-soft text-destructive";
  return "bg-accent-soft text-accent";
}

export function ErrorResolution({
  response,
  onRetry,
  onSubmitParameters,
}: {
  response: MisoResponse;
  onRetry?: (question: string, overrides: Record<string, string>) => void;
  onSubmitParameters?: (question: string, overrides: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const { error, execution, resolution, request_metadata: requestMetadata } = response;

  const parameterDetails = useMemo<ParameterDetail[]>(() => {
    if (resolution?.parameter_details.length) return resolution.parameter_details;
    return Object.entries(response.parameters).map(([name, value]) => ({
      name,
      value,
      source: "user_message",
      confidence: 1,
      required: false,
      status: "valid",
    }));
  }, [resolution?.parameter_details, response.parameters]);

  const failedStep = execution.steps.find((step) => step.status === "error");
  const endpoint = requestMetadata?.endpoint ?? resolution?.request?.endpoint;
  const canRetryUnchanged = resolution?.status !== "validation_error";

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CircleAlert className="size-3.5" />
          </span>
          <span>
            <span className="block text-[13px] font-medium">Resolve this issue</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
              Review the request, input checks, and full execution trace.
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="animate-fade space-y-4 border-t px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DiagnosticCard title="Failure point">
              <p>{failedStep?.label ?? error?.message ?? "Request could not complete."}</p>
              <p className="mt-1 text-muted-foreground">{failedStep?.detail ?? error?.reason}</p>
            </DiagnosticCard>
            <DiagnosticCard title="Request context">
              <p>{response.source?.name ?? requestMetadata?.dataset ?? "MISO request"}</p>
              {endpoint && (
                <p className="mt-1 break-all font-mono text-[10.5px] text-muted-foreground">
                  {endpoint}
                </p>
              )}
            </DiagnosticCard>
          </div>

          {parameterDetails.length > 0 && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Parameter check
              </p>
              <ul className="mt-2.5 space-y-2">
                {parameterDetails.map((parameter) => (
                  <li
                    key={parameter.name}
                    className="flex items-start justify-between gap-3 text-[12px]"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{parameter.name}</span>
                      <span className="ml-1.5 break-all font-mono text-muted-foreground">
                        {parameter.value || "—"}
                      </span>
                      {parameter.error && (
                        <span className="mt-0.5 block text-destructive">{parameter.error}</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                        statusClass(parameter.status),
                      )}
                    >
                      {statusLabel(parameter.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {onSubmitParameters && (
              <Button
                type="button"
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={() => setEditing((value) => !value)}
              >
                <SlidersHorizontal className="size-3.5" />
                {editing ? "Hide inputs" : "Review and update inputs"}
              </Button>
            )}
            {onRetry && canRetryUnchanged && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-full"
                onClick={() => onRetry(response.intent.summary, response.parameters)}
              >
                <RotateCcw className="size-3.5" />
                Retry unchanged
              </Button>
            )}
          </div>

          {editing && onSubmitParameters && (
            <RequiredParametersForm
              response={response}
              onSubmit={onSubmitParameters}
              mode="repair"
            />
          )}

          <ExecutionTimeline
            steps={execution.steps}
            durationMs={execution.duration_ms}
            label="Full execution trace"
          />
        </div>
      )}
    </section>
  );
}

function DiagnosticCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-[12px] leading-relaxed">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}
