import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";

import { ApiRequestViewer } from "@/components/miso/ApiRequestViewer";
import type { AgentApiDocsModel } from "@/lib/miso/agent-api-docs";
import { Button } from "@/components/ui/button";

function ParamTable({
  title,
  rows,
}: {
  title: string;
  rows: AgentApiDocsModel["requiredParameters"];
}) {
  if (!rows.length) return null;
  return (
    <div className="mt-4">
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2 overflow-hidden rounded-xl border">
        {rows.map((row) => (
          <div key={row.name} className="border-b px-3 py-2.5 last:border-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-[12px] font-medium">{row.name}</span>
              <span className="text-[11px] text-muted-foreground">{row.label}</span>
            </div>
            {row.description ? <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{row.description}</p> : null}
            {(row.example || row.options?.length) && (
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {row.example ? `example: ${row.example}` : null}
                {row.example && row.options?.length ? " · " : null}
                {row.options?.length ? `options: ${row.options.join(", ")}` : null}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApiDocsAnswer({
  docs,
  onCallApi,
}: {
  docs: AgentApiDocsModel;
  onCallApi: (prompt: string) => void;
}) {
  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-2xl border bg-muted/15 p-4">
        <p className="flex items-center gap-2 text-[13px] font-medium">
          <BookOpen className="size-4 text-accent" />
          API documentation
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{docs.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {docs.documentationUrl ? (
            <a
              href={docs.documentationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent"
            >
              Official Data Exchange docs
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
          <Link
            to="/api-docs/$sourceId"
            params={{ sourceId: docs.sourceId }}
            className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium hover:border-accent"
          >
            Open in-app API page
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      <div>
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Endpoint</p>
        <p className="mt-1 font-mono text-[12.5px]">
          <span className="mr-2 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">{docs.api.method}</span>
          {docs.source.endpoint}
        </p>
      </div>

      <ParamTable title="Required parameters" rows={docs.requiredParameters} />
      <ParamTable title="Optional parameters" rows={docs.optionalParameters} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-muted/10 p-3">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Auth</p>
          <p className="mt-1.5 font-mono text-[11.5px]">Ocp-Apim-Subscription-Key</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            Required Data Exchange subscription key. It is injected only on the server from the{" "}
            <span className="font-mono text-[11px]">MISO_SUBSCRIPTION_KEY</span> environment variable
            and is never returned to the browser.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/10 p-3">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Time zone</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{docs.api.timezone_note}</p>
        </div>
        <div className="rounded-xl border bg-muted/10 p-3">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Pagination</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            {docs.api.pagination
              ? `Supports ${docs.api.pagination.param_name}. Continue until ${docs.api.pagination.last_page_path} is true so settlement pages are not dropped.`
              : "No pageNumber parameter is modeled for this operation in the catalog."}
          </p>
          {docs.api.reliability_note ? (
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{docs.api.reliability_note}</p>
          ) : null}
        </div>
      </div>

      {docs.related.length > 0 && (
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Related endpoints</p>
          <div className="mt-2 space-y-2">
            {docs.related.map((item) => (
              <Link
                key={item.sourceId}
                to="/api-docs/$sourceId"
                params={{ sourceId: item.sourceId }}
                className="block rounded-xl border bg-card px-3 py-2.5 transition-colors hover:border-accent"
              >
                <p className="text-[12.5px] font-medium">{item.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {docs.legacyReport && (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Older report equivalent</p>
          <p className="mt-1 text-[13px] font-medium">{docs.legacyReport.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{docs.legacyReport.description}</p>
          <a
            href={docs.legacyReport.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
          >
            Open legacy report guide
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      )}

      <div>
        <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Example response shape</p>
        <pre className="overflow-auto rounded-xl border bg-muted/15 p-3 font-mono text-[11px] leading-relaxed">
          {JSON.stringify(docs.exampleResponse, null, 2)}
        </pre>
        <p className="mt-1.5 text-[11px] text-muted-foreground">Illustrative JSON only — values are examples, not a live MISO response.</p>
      </div>

      <div>
        <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Example request & code</p>
        <ApiRequestViewer api={docs.api} variant="code-only" />
      </div>

      <div className="rounded-2xl border border-accent/25 bg-accent-soft/30 p-4">
        <p className="text-[13px] font-medium">Ready to see real data?</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          I can call this catalog-backed API for you next (still using your selected simulation / public / live mode).
        </p>
        <Button
          type="button"
          className="mt-3 rounded-xl"
          onClick={() => onCallApi(docs.callPrompt)}
        >
          <Sparkles className="size-3.5" />
          Have the AI call this API for you
        </Button>
      </div>
    </div>
  );
}
