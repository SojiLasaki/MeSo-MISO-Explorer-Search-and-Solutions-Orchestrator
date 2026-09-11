import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Braces,
  Database,
  LineChart,
  MessageCircle,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { API_DIRECTORY_GROUP_KEY, ApiExplorer, type ApiExplorerGroup } from "./ApiExplorer";
import type { CatalogOperation } from "@/lib/miso/catalog";

function restoredDirectoryGroup(): ApiExplorerGroup | null {
  if (typeof window === "undefined") return null;
  try {
    const group = window.sessionStorage.getItem(API_DIRECTORY_GROUP_KEY);
    window.sessionStorage.removeItem(API_DIRECTORY_GROUP_KEY);
    return group === "all" || group === "pricing" || group === "operations" ? group : null;
  } catch {
    return null;
  }
}

export function DataExchangeHome({
  onOpenChat,
  liveStatus,
}: {
  onOpenChat: (operation?: CatalogOperation) => void;
  liveStatus?: { mode: "live" | "simulated"; checkedAt: string; connected: boolean };
}) {
  const [explorerGroup, setExplorerGroup] = useState<ApiExplorerGroup | null>(
    restoredDirectoryGroup,
  );

  if (explorerGroup) {
    return (
      <ApiExplorer
        initialGroup={explorerGroup}
        onClose={() => setExplorerGroup(null)}
        onOpenChat={onOpenChat}
      />
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_75%_0%,var(--color-accent-soft),transparent_32rem)]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
          <div className="animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-success" />
              MISO Data Exchange, simplified
            </div>
            <h1 className="max-w-3xl text-[clamp(2.7rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.055em]">
              Find the market data you need.{" "}
              <span className="text-accent">Use it with confidence.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
              Search MISO APIs in plain language, complete every required field in one place, and
              bring a production-safe request to your own system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenChat()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="size-4" />
                Ask MISO AI
                <ArrowRight className="size-4" />
              </button>
              <a
                href="#apis"
                className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-[14px] font-medium transition-colors hover:bg-muted"
              >
                Explore API groups
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] text-muted-foreground">
              <TrustItem icon={ShieldCheck} text="Complete pagination" />
              <TrustItem icon={LineChart} text="MISO time clarity" />
              <TrustItem icon={Database} text="Backend-ready" />
            </div>
          </div>

          <div className="animate-rise rounded-3xl border bg-card p-5 shadow-lift [animation-delay:120ms] sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b pb-5">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Start with a question
                </p>
                <p className="mt-1 text-[17px] font-medium">MISO AI request builder</p>
              </div>
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success">
                Guided
              </span>
            </div>
            <div className="mt-6 rounded-2xl border bg-surface/60 p-4">
              <p className="text-[12px] text-muted-foreground">Example request</p>
              <p className="mt-2 text-[16px] font-medium leading-snug">
                “Give me real-time LMP for Indiana yesterday.”
              </p>
            </div>
            {liveStatus && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border bg-muted/25 px-3 py-2.5 text-[11.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${liveStatus.connected && liveStatus.mode === "live" ? "animate-pulse bg-success" : "bg-accent"}`}
                  />
                  {liveStatus.mode === "live" ? "Live MISO connection" : "Preview data connection"}
                </span>
                <span>
                  Checked{" "}
                  {new Date(liveStatus.checkedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <ol className="mt-5 space-y-4">
              <WorkflowStep
                number="1"
                title="Match the right API"
                copy="Finds the catalog-backed MISO source."
              />
              <WorkflowStep
                number="2"
                title="Complete required fields"
                copy="Shows every required parameter together."
              />
              <WorkflowStep
                number="3"
                title="Take it to production"
                copy="Includes pagination, time, and retry guidance."
              />
            </ol>
            <button
              type="button"
              onClick={() => onOpenChat()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-[13.5px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Build a request with MISO AI
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <section id="apis" className="mt-20 scroll-mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
                API groups
              </p>
              <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.7rem)] font-medium tracking-tight">
                Start from the data you need
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setExplorerGroup("all")}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-muted"
            >
              <Search className="size-3.5" />
              Search APIs
            </button>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <ApiGroup
              icon={BarChart3}
              title="Pricing"
              copy="Day-ahead and real-time LMP and ancillary-service prices."
              examples="LMP · MCP · pricing nodes"
              onExplore={() => setExplorerGroup("pricing")}
            />
            <ApiGroup
              icon={Zap}
              title="Load, generation & interchange"
              copy="Operational demand, fuel mix, generation, and interchange data."
              examples="Actual load · fuel type · outages"
              onExplore={() => setExplorerGroup("operations")}
            />
            <ApiGroup
              icon={Braces}
              title="Integration support"
              copy="Build a durable ingestion workflow without losing records."
              examples="Pagination · retries · time basis"
              onExplore={() => setExplorerGroup("all")}
            />
          </div>
        </section>
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

function TrustItem({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 text-accent" />
      {text}
    </span>
  );
}

function WorkflowStep({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground">
        {number}
      </span>
      <div>
        <p className="text-[13.5px] font-medium">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{copy}</p>
      </div>
    </li>
  );
}

function ApiGroup({
  icon: Icon,
  title,
  copy,
  examples,
  onExplore,
}: {
  icon: typeof ShieldCheck;
  title: string;
  copy: string;
  examples: string;
  onExplore: () => void;
}) {
  return (
    <article className="group rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
      <div className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 text-[17px] font-medium">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{copy}</p>
      <p className="mt-5 font-mono text-[11px] text-muted-foreground">{examples}</p>
      <button
        type="button"
        onClick={onExplore}
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        Explore APIs{" "}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}
