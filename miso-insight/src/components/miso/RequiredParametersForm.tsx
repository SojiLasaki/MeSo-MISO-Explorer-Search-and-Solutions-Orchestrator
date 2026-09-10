import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";

import { getSource } from "@/lib/miso/registry";
import type { MisoParameterSpec, MisoResponse } from "@/lib/miso/types";

export function RequiredParametersForm({
  response,
  onSubmit,
  mode = "required",
}: {
  response: MisoResponse;
  onSubmit: (question: string, overrides: Record<string, string>) => void;
  mode?: "required" | "repair";
}) {
  const invalidNames = useMemo(
    () => new Set((response.resolution?.validation.errors ?? []).map((issue) => issue.parameter)),
    [response.resolution?.validation.errors],
  );
  const specs = useMemo(() => {
    const sourceId = response.source?.id ?? response.resolution?.source_id;
    const parameters = sourceId ? getSource(sourceId)?.parameters : undefined;
    if (mode === "required") return parameters?.filter((spec) => spec.required) ?? [];

    return (
      parameters?.filter(
        (spec) =>
          spec.required || invalidNames.has(spec.name) || response.parameters[spec.name] != null,
      ) ?? []
    );
  }, [
    invalidNames,
    mode,
    response.parameters,
    response.source?.id,
    response.resolution?.source_id,
  ]);
  const [values, setValues] = useState<Record<string, string>>(response.parameters);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setValues(response.parameters);
    setSubmitted(false);
  }, [response.request_id, response.parameters]);

  if (
    (mode === "required" && response.resolution?.status !== "needs_parameters") ||
    !specs.length
  ) {
    return null;
  }

  const missing = specs.filter((spec) => !values[spec.name]?.trim());
  const update = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };
  const submit = () => {
    setSubmitted(true);
    if (missing.length) return;
    onSubmit(`Use these parameters for ${response.source?.name ?? "this MISO request"}.`, values);
  };

  const repair = mode === "repair";

  return (
    <section className="animate-rise overflow-hidden rounded-xl border bg-card shadow-soft">
      <div className="border-b bg-accent-soft/45 px-4 py-3">
        <div className="flex items-center gap-2">
          <CircleAlert className="size-4 text-accent" />
          <div>
            <p className="text-[13px] font-medium">
              {repair ? "Update request values" : "Complete this request"}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {repair
                ? "Correct the highlighted values, then retry the same MISO request."
                : "Enter every required value once, then run the API."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {specs.map((spec) => (
          <ParameterField
            key={spec.name}
            spec={spec}
            value={values[spec.name] ?? ""}
            validationError={invalidNames.has(spec.name)}
            showError={submitted && spec.required && !values[spec.name]?.trim()}
            onChange={(value) => update(spec.name, value)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-muted/25 px-4 py-3">
        <p className="text-[12px] text-muted-foreground">
          {missing.length
            ? `${missing.length} required field${missing.length === 1 ? "" : "s"} left`
            : repair
              ? "Ready to retry"
              : "Ready to run"}
        </p>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {repair ? "Retry request" : "Run request"}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </section>
  );
}

function ParameterField({
  spec,
  value,
  showError,
  validationError,
  onChange,
}: {
  spec: MisoParameterSpec;
  value: string;
  showError: boolean;
  validationError: boolean;
  onChange: (value: string) => void;
}) {
  const inputClass = `mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-[13px] outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15 ${showError || validationError ? "border-destructive" : "border-input"}`;

  return (
    <label className="block min-w-0">
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium">
        {spec.label}
        <span className="rounded bg-destructive-soft px-1.5 py-0.5 text-[10px] font-medium text-destructive">
          Required
        </span>
      </span>
      {spec.options?.length ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select {spec.label.toLowerCase()}</option>
          {spec.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={
            spec.type === "date"
              ? "date"
              : spec.type === "number" || spec.type === "integer"
                ? "number"
                : "text"
          }
          value={value}
          placeholder={spec.example ?? spec.description}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      <span
        className={
          showError || validationError
            ? "mt-1 block text-[11px] text-destructive"
            : "mt-1 block text-[11px] text-muted-foreground"
        }
      >
        {showError
          ? `${spec.label} is required.`
          : validationError
            ? "This value needs to be corrected before retrying."
            : spec.description}
      </span>
    </label>
  );
}
