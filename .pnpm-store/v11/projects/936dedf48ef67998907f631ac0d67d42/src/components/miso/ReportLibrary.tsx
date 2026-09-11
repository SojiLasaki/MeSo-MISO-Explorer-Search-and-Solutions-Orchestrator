import { useMemo, useState } from "react";
import { ArrowUpRight, Bot, CheckCircle2, ChevronRight, Code2, FileText, KeyRound, MessageCircle, Search, Sparkles, Wrench, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  LEGACY_REPORTS,
  searchLegacyReports,
  type LegacyReport,
  type LegacyReportCategory,
} from "@/lib/miso/legacy-reports";
import { getSource } from "@/lib/miso/registry";
import { cn } from "@/lib/utils";

type Filter = "All" | LegacyReportCategory;

const filters: Filter[] = ["All", "Pricing", "Load & generation", "Guidance", "Archive"];

export function ReportLibrary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [aiReport, setAiReport] = useState<LegacyReport | null>(null);
  const reports = useMemo(
    () =>
      searchLegacyReports(query).filter((report) => filter === "All" || report.category === filter),
    [filter, query],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_72%_0%,var(--color-accent-soft),transparent_34rem)]">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
          <Link to="/" className="min-w-0 text-[14.5px] font-medium tracking-tight transition-colors hover:text-accent">MISO AI</Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-1.5 text-[12px]">
            <Link to="/integration-lab" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><MessageCircle className="size-3.5" /><span className="hidden sm:inline">Ask MISO AI</span></Link>
            <Link to="/reports" activeProps={{ className: "bg-accent-soft text-accent" }} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><FileText className="size-3.5" /><span className="hidden sm:inline">Reports</span></Link>
            <Link to="/subscription-keys" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><KeyRound className="size-3.5" /><span className="hidden md:inline">Keys</span></Link>
            <Link to="/integration-lab" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Wrench className="size-3.5" /><span className="hidden md:inline">Integration</span></Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-12">

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_330px] lg:items-end">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
              Report library
            </p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.35rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.05em]">
              Find the report. <span className="text-accent">Or move to the API.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
              Search official MISO report references, archives, reader guides, and
              report-to-endpoint mappings. For recurring data, MISO AI prioritizes the matching Data
              Exchange API.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-[13px] font-medium">How MISO AI searches</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  API first for live, structured data. Archive-first only when you explicitly ask
                  for a legacy report, older file, reader’s guide, or mapping.
                </p>
              </div>
            </div>
          </div>
        </div>

        <label className="relative mt-9 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reports, archives, reader guides, or API replacements"
            className="h-13 w-full rounded-2xl border bg-card pl-11 pr-4 text-[14px] outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                filter === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 border-b pb-4">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{reports.length}</span> official MISO
            reference{reports.length === 1 ? "" : "s"}
          </p>
          <a
            href="https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 text-[12.5px] font-medium text-accent hover:underline sm:inline-flex"
          >
            MISO market reports <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.source_id} report={report} onAskAi={setAiReport} />
          ))}
        </div>

        {reports.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed bg-card px-5 py-12 text-center">
            <Search className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-[14px] font-medium">No report reference matched that search.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try “pricing”, “actual load”, “archive”, “mapping”, or “retired”.
            </p>
          </div>
        )}

        <p className="mt-8 text-[12px] leading-relaxed text-muted-foreground">
          This library indexes official MISO URLs and reader guides; it does not copy protected
          report contents. Ask MISO AI for a chart to retrieve the appropriate API data when an API
          replacement is available.
        </p>
      </div>
      {aiReport && <ReportAiDrawer report={aiReport} onClose={() => setAiReport(null)} />}
    </main>
  );
}

function ReportCard({ report, onAskAi }: { report: LegacyReport; onAskAi: (report: LegacyReport) => void }) {
  const replacement = report.api_replacement
    ? getSource(report.api_replacement.source_id)
    : undefined;

  return (
    <article className="flex min-h-72 flex-col rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <FileText className="size-5" />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground">
          {report.category}
        </span>
      </div>
      <h2 className="mt-5 text-[17px] font-medium tracking-tight">{report.title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{report.description}</p>

      <div className="mt-5 rounded-xl border bg-muted/25 p-3">
        {replacement ? (
          <>
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
              API replacement
            </p>
            <p className="mt-1 text-[12.5px] font-medium">{replacement.name}</p>
            <p className="mt-1 break-all font-mono text-[10.5px] text-muted-foreground">
              {replacement.endpoint}
            </p>
          </>
        ) : (
          <>
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
              Official reference
            </p>
            <p className="mt-1 text-[12.5px]">{report.format}</p>
          </>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={report.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open MISO file <ArrowUpRight className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={() => onAskAi(report)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bot className="size-3.5" />
          Ask AI
        </button>
      </div>
    </article>
  );
}

function ReportAiDrawer({ report, onClose }: { report: LegacyReport; onClose: () => void }) {
  const mappedSource = report.api_replacement ? getSource(report.api_replacement.source_id) : undefined;
  const required = (mappedSource?.parameters ?? []).filter((parameter) => parameter.required);
  const optional = (mappedSource?.parameters ?? []).filter((parameter) => !parameter.required);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Ask MISO AI about this report">
      <button type="button" aria-label="Close report AI" onClick={onClose} className="absolute inset-0 bg-foreground/15 backdrop-blur-[1px]" />
      <aside className="relative flex h-full w-full max-w-[500px] flex-col border-l bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent"><Bot className="size-4" /></span><div><p className="text-[14px] font-medium">Ask MISO AI</p><p className="text-[11px] text-muted-foreground">Report-aware endpoint mapping</p></div></div>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="rounded-2xl border bg-muted/20 p-4"><p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent">Selected report</p><h2 className="mt-2 text-[19px] font-medium tracking-tight">{report.title}</h2><p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{report.description}</p></div>

          <section className="mt-5 rounded-2xl border border-accent/20 bg-accent-soft/20 p-4">
            <div className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-accent" /><div><p className="text-[13px] font-medium">MISO AI mapping response</p><p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{mappedSource ? <>For recurring data, this report maps to <span className="font-medium text-foreground">{mappedSource.name}</span>. I’ll use the mapped endpoint metadata—not a guessed URL—to explain the replacement.</> : <>This report does not have a catalog-backed API replacement. Use the official report reference or archive path rather than inventing an endpoint.</>}</p></div></div>
          </section>

          {mappedSource ? <>
            <section className="mt-5 rounded-2xl border bg-card p-4"><p className="flex items-center gap-2 text-[13px] font-medium"><CheckCircle2 className="size-4 text-success" /> Endpoint mapping</p><dl className="mt-4 space-y-3 text-[12px]"><div><dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Mapped API</dt><dd className="mt-1 font-medium">{mappedSource.name}</dd></div><div><dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Method</dt><dd className="mt-1 font-mono text-[11px]">{mappedSource.method ?? "GET"}</dd></div><div><dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Endpoint</dt><dd className="mt-1 break-all rounded-lg bg-muted/40 p-2 font-mono text-[10.5px] leading-relaxed">{mappedSource.endpoint}</dd></div></dl></section>

            <section className="mt-5"><p className="flex items-center gap-2 text-[13px] font-medium"><Code2 className="size-4 text-accent" /> Parameters from the mapped endpoint</p><div className="mt-3 space-y-2">{required.map((parameter) => <ParameterRow key={parameter.name} name={parameter.name} label={parameter.label} detail={parameter.description} required />)}{optional.map((parameter) => <ParameterRow key={parameter.name} name={parameter.name} label={parameter.label} detail={parameter.description} options={parameter.options} />)}</div></section>
          </> : <section className="mt-5 rounded-2xl border border-dashed p-4 text-[12.5px] leading-relaxed text-muted-foreground">No structured endpoint details are available for this report. The side AI will keep it as a report/archive request.</section>}
        </div>

        <footer className="border-t p-5 sm:px-6"><Link to="/integration-lab" search={{ report: report.source_id }} className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"><span>Continue with this report in MISO AI</span><ChevronRight className="size-4" /></Link><p className="mt-2 text-center text-[10.5px] text-muted-foreground">The full agent receives the report context and its mapped endpoint details.</p></footer>
      </aside>
    </div>
  );
}

function ParameterRow({ name, label, detail, options, required = false }: { name: string; label: string; detail: string; options?: string[]; required?: boolean }) {
  return <div className="rounded-xl border bg-card p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-medium">{label}</p><p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{name}</p></div><span className={cn("rounded-full px-2 py-1 text-[9.5px] font-medium", required ? "bg-destructive-soft text-destructive" : "bg-muted text-muted-foreground")}>{required ? "Required" : "Optional"}</span></div>{detail && <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{detail}</p>}{options?.length ? <p className="mt-2 text-[10.5px] text-muted-foreground">Allowed: {options.join(", ")}</p> : null}</div>;
}
