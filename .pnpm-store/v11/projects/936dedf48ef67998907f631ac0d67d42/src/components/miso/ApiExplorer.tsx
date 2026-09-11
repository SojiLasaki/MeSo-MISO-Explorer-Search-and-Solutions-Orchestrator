import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  Braces,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Database,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

import { CATALOG_OPERATIONS, type CatalogOperation } from "@/lib/miso/catalog";
import { cn } from "@/lib/utils";

export type ApiExplorerGroup = "all" | "pricing" | "operations";
export const API_DIRECTORY_GROUP_KEY = "miso-api-directory-group";

const groups: { id: ApiExplorerGroup; label: string; description: string }[] = [
  {
    id: "all",
    label: "All APIs",
    description: "Browse the full catalog of MISO market and operational data.",
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Day-ahead and real-time LMP and ancillary-service price APIs.",
  },
  {
    id: "operations",
    label: "Load, generation & interchange",
    description: "Operational demand, generation, outage, forecast, and interchange APIs.",
  },
];

function belongsToGroup(operation: CatalogOperation, group: ApiExplorerGroup) {
  if (group === "all") return true;
  return group === "pricing"
    ? operation.endpoint.includes("/pricing/")
    : !operation.endpoint.includes("/pricing/");
}

function matchesSearch(operation: CatalogOperation, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    operation.name,
    operation.description,
    operation.endpoint,
    ...operation.supports,
    ...operation.required,
    ...operation.optional,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function apiPath(endpoint: string) {
  try {
    return new URL(endpoint).pathname;
  } catch {
    return endpoint;
  }
}

function conciseDescription(description: string) {
  const sentences = description.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [description];
  return sentences.slice(0, 2).join(" ").trim();
}

export function ApiExplorer({
  initialGroup,
  onClose,
  onOpenChat,
}: {
  initialGroup: ApiExplorerGroup;
  onClose: () => void;
  onOpenChat: (operation?: CatalogOperation) => void;
}) {
  const [group, setGroup] = useState<ApiExplorerGroup>(initialGroup);
  const [query, setQuery] = useState("");
  const selectedGroup = groups.find((item) => item.id === group)!;
  const results = useMemo(
    () =>
      CATALOG_OPERATIONS.filter(
        (operation) => belongsToGroup(operation, group) && matchesSearch(operation, query),
      ),
    [group, query],
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_75%_0%,var(--color-accent-soft),transparent_32rem)]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Data Exchange
        </button>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              API directory <ChevronRight className="size-3" /> {selectedGroup.label}
            </div>
            <h1 className="mt-3 text-[clamp(2.35rem,5vw,4.25rem)] font-medium leading-[1] tracking-[-0.045em]">
              {selectedGroup.label} APIs
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
              {selectedGroup.description} Each entry shows its purpose, availability, endpoint, and
              inputs before you run it.
            </p>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search APIs, data, or parameters"
              className="h-12 w-full rounded-xl border bg-card pl-11 pr-4 text-[13.5px] outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/15"
              aria-label="Search MISO APIs"
              autoFocus
            />
          </label>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {groups.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGroup(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                group === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{results.length}</span> API
            {results.length === 1 ? "" : "s"} found
            {query ? ` for “${query}”` : ""}
          </p>
          <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <CalendarDays className="size-3.5 text-accent" />
            Market times use Eastern Prevailing Time
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {results.map((operation) => (
            <ApiEntry
              key={operation.source_id}
              operation={operation}
              directoryGroup={group}
              onOpenChat={onOpenChat}
            />
          ))}
          {results.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-card px-5 py-12 text-center">
              <Search className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-[14px] font-medium">No API matched that search.</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Try “load”, “LMP”, “generation”, “outage”, or a parameter such as “region”.
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenChat()}
        aria-label="Open MISO AI chat"
        className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:right-8"
      >
        <Bot className="size-4" />
        Chat with MISO AI
      </button>
    </main>
  );
}

function ApiEntry({
  operation,
  directoryGroup,
  onOpenChat,
}: {
  operation: CatalogOperation;
  directoryGroup: ApiExplorerGroup;
  onOpenChat: (operation?: CatalogOperation) => void;
}) {
  const pricing = operation.endpoint.includes("/pricing/");
  const details = conciseDescription(operation.description);

  return (
    <article className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift sm:p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              {pricing ? <CircleDollarSign className="size-4.5" /> : <Zap className="size-4.5" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[16px] font-medium">{operation.name}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                  {pricing ? "Pricing" : "Operations"}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                {details}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoBlock icon={Braces} label="Endpoint">
              <code className="break-all text-[11px]">{apiPath(operation.endpoint)}</code>
            </InfoBlock>
            <InfoBlock icon={SlidersHorizontal} label="Inputs">
              <ParameterSummary operation={operation} />
            </InfoBlock>
          </div>

          {operation.availability_note && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/45 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-accent" />
              {operation.availability_note}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-stretch md:justify-start">
          <button
            type="button"
            onClick={() => onOpenChat(operation)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 md:flex-none"
          >
            Ask MISO AI
            <Bot className="size-3.5" />
          </button>
          <Link
            to="/api-docs/$sourceId"
            params={{ sourceId: operation.source_id }}
            onClick={() => {
              try {
                window.sessionStorage.setItem(API_DIRECTORY_GROUP_KEY, directoryGroup);
              } catch {
                // Returning to the landing page is still a safe fallback when storage is unavailable.
              }
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex-none"
          >
            Official docs
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Braces;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 text-accent" />
        {label}
      </p>
      <div className="mt-1.5 text-[12px] text-foreground">{children}</div>
    </div>
  );
}

function ParameterSummary({ operation }: { operation: CatalogOperation }) {
  if (!operation.parameters.length) return <span>No inputs required</span>;

  return (
    <span className="leading-relaxed">
      {operation.required.length > 0 && (
        <span>
          <strong>{operation.required.join(", ")}</strong> required
        </span>
      )}
      {operation.optional.length > 0 && (
        <span className="text-muted-foreground">
          {operation.required.length > 0 ? " · " : ""}
          {operation.optional.length} optional
        </span>
      )}
    </span>
  );
}
