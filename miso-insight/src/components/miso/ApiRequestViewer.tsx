import { useState } from "react";
import { Bot, Clock3, Lock, RefreshCw, ShieldCheck } from "lucide-react";

import { CodeBlock } from "./CodeBlock";
import { LocalAgentDialog } from "./LocalAgentDialog";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_KEY_PLACEHOLDER } from "@/lib/miso/request-builder";
import type { ApiRequestSpec } from "@/lib/miso/types";

function safeHeaderValue(key: string, value: string) {
  if (
    /subscription[-_]?key/i.test(key) ||
    value === SUBSCRIPTION_KEY_PLACEHOLDER ||
    /YOUR_.*KEY/i.test(value)
  ) {
    return "[not shown — injected server-side from env only]";
  }
  return value;
}

export function ApiRequestViewer({
  api,
  /** When embedding under a docs answer that already shows params/auth/timezone. */
  variant = "full",
}: {
  api: ApiRequestSpec;
  variant?: "full" | "code-only";
}) {
  const [tab, setTab] = useState(api.examples[0]?.language ?? "cURL");
  const [agentOpen, setAgentOpen] = useState(false);
  const active = api.examples.find((e) => e.language === tab) ?? api.examples[0];
  const codeOnly = variant === "code-only";

  return (
    <div className="animate-rise overflow-hidden rounded-xl border bg-card">
      {!codeOnly && (
        <div className="border-b px-5 py-4">
          <p className="text-[13px] font-medium">{api.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-medium text-accent">
              {api.method}
            </span>
            <span className="break-all font-mono text-[12.5px] text-muted-foreground">{api.url}</span>
          </div>
        </div>
      )}

      {!codeOnly && api.parameters.length > 0 && (
        <div className="border-b px-5 py-4">
          <p className="mb-2 text-[12px] uppercase tracking-wide text-muted-foreground">
            Parameters
          </p>
          <div className="space-y-1.5">
            {api.parameters.map((p) => (
              <div
                key={p.key}
                className="flex flex-wrap items-baseline gap-x-3 font-mono text-[12.5px]"
              >
                <span className="min-w-[132px] text-foreground">{p.key}</span>
                <span className="text-muted-foreground">{p.value || "—"}</span>
                {!p.required && (
                  <span className="font-sans text-[11px] text-muted-foreground/70">optional</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!codeOnly && (
        <div className="border-b px-5 py-4">
          <p className="mb-2 text-[12px] uppercase tracking-wide text-muted-foreground">
            Authentication
          </p>
          <div className="space-y-1.5">
            {api.headers.map((h) => (
              <div
                key={h.key}
                className="flex flex-wrap items-baseline gap-x-3 font-mono text-[12.5px]"
              >
                <span className="min-w-[132px] text-foreground">{h.key}</span>
                <span className="text-muted-foreground">{safeHeaderValue(h.key, h.value)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[12.5px] text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            {api.auth_note}
          </p>
        </div>
      )}

      {!codeOnly && (
        <div className="border-b bg-muted/20 px-5 py-4">
          <p className="mb-3 text-[12px] uppercase tracking-wide text-muted-foreground">
            Settlement-safe integration
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Safeguard
              icon={ShieldCheck}
              title="Complete records"
              copy={
                api.pagination
                  ? api.pagination.total_pages != null
                    ? `This response required ${api.pagination.total_pages} pages. The examples collect every one.`
                    : `This operation can span pages. The examples continue until ${api.pagination.last_page_path} is true.`
                  : "This operation has no paginated response modeled in the MISO catalog."
              }
            />
            <Safeguard icon={Clock3} title="Time basis" copy={api.timezone_note} />
            <Safeguard icon={RefreshCw} title="Recovery behavior" copy={api.reliability_note} />
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        {!codeOnly && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-accent-soft/30 px-3.5 py-3">
            <div>
              <p className="text-[12.5px] font-medium">Connect this to your backend</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Use a local AI agent to implement this validated request in your repository.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAgentOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-card px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Bot className="size-3.5" />
              Use local agent
            </button>
          </div>
        )}
        <div className="mb-3 flex gap-1">
          {api.examples.map((e) => (
            <button
              key={e.language}
              type="button"
              onClick={() => setTab(e.language)}
              className={cn(
                "rounded-full px-3 py-1 text-[12.5px] transition-colors",
                tab === e.language
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {e.language}
            </button>
          ))}
        </div>
        {active && <CodeBlock code={active.code} />}
        {codeOnly && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Samples read the subscription key from the server environment variable only; no key value is embedded.
          </p>
        )}
      </div>
      <LocalAgentDialog api={api} open={agentOpen} onOpenChange={setAgentOpen} />
    </div>
  );
}

function Safeguard({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof ShieldCheck;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-accent" />
        <p className="text-[12.5px] font-medium">{title}</p>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}
