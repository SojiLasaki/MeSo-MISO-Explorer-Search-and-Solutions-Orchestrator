import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Braces,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  Layers3,
  ListChecks,
  ShieldCheck,
  Zap,
} from "lucide-react";

import type { CatalogOperation } from "@/lib/miso/catalog";
import type { MisoParameterSpec } from "@/lib/miso/types";

function categoryFor(operation: CatalogOperation) {
  return operation.endpoint.includes("/pricing/") ? "Pricing" : "Load, generation & interchange";
}

function ParameterTable({
  title,
  copy,
  parameters,
}: {
  title: string;
  copy: string;
  parameters: MisoParameterSpec[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="border-b px-5 py-4 sm:px-6">
        <h2 className="text-[17px] font-medium">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
      </div>
      {parameters.length ? (
        <div className="divide-y">
          {parameters.map((parameter) => (
            <div key={parameter.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(160px,0.7fr)_minmax(0,1.3fr)] sm:px-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] font-medium text-foreground">
                    {parameter.name}
                  </code>
                  <span className="rounded-full border px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                    {parameter.in ?? "query"}
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">{parameter.type}</p>
              </div>
              <div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {parameter.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
                  {parameter.example && (
                    <span className="rounded-md bg-accent-soft px-2 py-1 text-accent">
                      Example: <code>{parameter.example}</code>
                    </span>
                  )}
                  {parameter.options?.map((option) => (
                    <span key={option} className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-7 text-[13px] text-muted-foreground sm:px-6">
          This operation does not expose parameters in the catalog.
        </p>
      )}
    </section>
  );
}

export function ApiDocumentation({ operation }: { operation: CatalogOperation }) {
  const required = operation.parameters.filter((parameter) => parameter.required);
  const optional = operation.parameters.filter((parameter) => !parameter.required);
  const isPricing = operation.endpoint.includes("/pricing/");
  const hasPagination = operation.parameters.some((parameter) => parameter.name === "pageNumber");
  const category = categoryFor(operation);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_84%_0%,var(--color-accent-soft),transparent_34rem)]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to MISO AI
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <span>API directory</span>
              <span>/</span>
              <span>{category}</span>
              <span>/</span>
              <span>Official documentation</span>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                {isPricing ? <CircleDollarSign className="size-5" /> : <Zap className="size-5" />}
              </span>
              <div>
                <h1 className="max-w-4xl text-[clamp(2.25rem,5vw,4.35rem)] font-medium leading-[0.98] tracking-[-0.045em]">
                  {operation.name}
                </h1>
                <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted-foreground">
                  {operation.description}
                </p>
              </div>
            </div>
          </div>

          <a
            href={operation.documentation_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border bg-card px-4 py-3 text-[13px] font-medium text-accent shadow-soft transition-colors hover:bg-muted"
          >
            Open on MISO Data Exchange
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-y py-4 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
            <CheckCircle2 className="size-3.5" />
            Official MISO catalog metadata
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1">{operation.api_name}</span>
          <span className="rounded-full bg-muted px-2.5 py-1">{operation.method}</span>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border bg-card shadow-soft">
              <div className="border-b px-5 py-4 sm:px-6">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                  <Braces className="size-3.5 text-accent" />
                  Request endpoint
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-success-soft px-2 py-1 font-mono text-[12px] font-medium text-success">
                    {operation.method}
                  </span>
                  <code className="min-w-0 break-all text-[12.5px] text-foreground">
                    {operation.endpoint}
                  </code>
                </div>
              </div>
              <div className="px-5 py-4 sm:px-6">
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Use this endpoint with the inputs below. Values in the path replace braces; query
                  values are appended to the request URL.
                </p>
              </div>
            </section>

            <ParameterTable
              title="Required parameters"
              copy={
                required.length
                  ? "Enter every one of these before sending the request."
                  : "No required parameters are listed for this operation."
              }
              parameters={required}
            />
            <ParameterTable
              title="Optional parameters"
              copy="Use these only when you need to narrow, page, or shape the response."
              parameters={optional}
            />
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                <KeyRound className="size-3.5 text-accent" />
                Authentication
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {operation.requires_authentication
                  ? "Send a MISO subscription key from your backend. Do not put a production key in browser code."
                  : "This operation is marked as not requiring authentication in the catalog."}
              </p>
              {operation.requires_authentication && (
                <code className="mt-3 block break-all rounded-lg bg-muted px-2.5 py-2 text-[11px] text-foreground">
                  {operation.auth_header}: $&#123;MISO_SUBSCRIPTION_KEY&#125;
                </code>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                <CalendarDays className="size-3.5 text-accent" />
                Availability & time
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {operation.availability_note || "Check the live MISO response for data availability."}
              </p>
              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
                MISO market time is Eastern Prevailing Time. Preserve the API-provided UTC offset
                around daylight-saving changes.
              </p>
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                <Layers3 className="size-3.5 text-accent" />
                Pagination
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {hasPagination
                  ? "Use pageNumber and continue until the response page metadata indicates the final page. Do not assume a fixed page size."
                  : "The catalog does not list pageNumber for this operation."}
              </p>
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                <ListChecks className="size-3.5 text-accent" />
                Use with MISO AI
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Open a focused chat for this operation. Its endpoint and catalog parameters are
                passed to the agent without exposing any credential.
              </p>
              <Link
                to="/integration-lab"
                search={{ api: operation.source_id }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[12.5px] font-medium text-primary-foreground"
              >
                Ask MISO AI about this API
                <ArrowUpRight className="size-3.5" />
              </Link>
            </section>
          </aside>
        </div>

        <p className="mt-8 flex items-center gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0 text-accent" />
          This redesigned reference is populated from the official MISO Data Exchange catalog. Use
          the source link above for MISO’s live documentation and service updates.
        </p>
      </div>
    </main>
  );
}
