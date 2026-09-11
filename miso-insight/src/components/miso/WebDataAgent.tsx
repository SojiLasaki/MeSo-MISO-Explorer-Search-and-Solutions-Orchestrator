import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  Clipboard,
  Database,
  Download,
  FileText,
  History,
  KeyRound,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SemanticVisualization } from "@/components/miso/semantics/SemanticVisualization";
import { ApiDocsAnswer } from "@/components/miso/ApiDocsAnswer";
import type { CatalogOperation } from "@/lib/miso/catalog";
import { buildAgentApiDocs } from "@/lib/miso/agent-api-docs";
import {
  buildSemanticView,
  downloadReadableCsv,
} from "@/lib/miso/semantics";
import { cn } from "@/lib/utils";
import { localAgentDownloadUrl, localApi, type AgentResult, type ConnectionState, type KeyState, type LocalBackendMode } from "@/lib/local-backend";

const generalPrompts = [
  "I need the API docs for actual load",
  "Show me actual load",
  "What was the actual load yesterday?",
  "Give me hourly power usage for the North region yesterday.",
  "Show me today’s market prices.",
];

const PTD_ENDPOINT_IDS = new Set([
  "actual_load",
  "day_ahead_demand",
  "realtime_lmp",
  "realtime_generation_fuel_type",
]);

function ptdHandoffHref(result: AgentResult) {
  const endpoint = result.endpoint?.id;
  if (!endpoint || !PTD_ENDPOINT_IDS.has(endpoint) || result.status !== "success") return null;
  const search = new URLSearchParams({ from: "miso-agent", endpoint });
  for (const [key, value] of Object.entries(result.parameters ?? {})) {
    if (value) search.set(key, value);
  }
  return `/power-trader?${search.toString()}`;
}

export interface ReportChatContext {
  sourceId: string;
  title: string;
  description: string;
  url: string;
  apiReplacement?: string;
  apiReplacementSourceId?: string;
  endpoint?: string;
  method?: string;
  requiredParameters?: string[];
}

interface SavedSession {
  session_id: string;
  preview: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface SavedSessionMessage {
  role: "user" | "assistant";
  content: string;
  payload: Record<string, unknown>;
}

type ChatTurn = { role: "user" | "agent"; text: string; result?: AgentResult };

function buildConversationSummary(history: ChatTurn[]) {
  if (!history.length) return "No conversation yet.";
  const lines = ["MISO AI conversation summary", "", "Conversation:"];
  history.forEach((turn) => {
    lines.push(`${turn.role === "user" ? "User" : "MeSo"}: ${turn.text}`);
    if (turn.role === "agent" && turn.result) {
      const result = turn.result;
      if (result.endpoint?.name) lines.push(`Data operation: ${result.endpoint.name}`);
      if (result.verification?.source) lines.push(`Source: ${result.verification.source}`);
      if (typeof result.verification?.status_code === "number") lines.push(`HTTP status: ${result.verification.status_code}`);
      if (result.simulated) lines.push("Data status: simulated; no MISO request was sent.");
      if (result.access_request) lines.push(`Access request: draft for ${result.access_request.recipient}; ${result.access_request.timeline}`);
    }
    lines.push("");
  });
  lines.push("Use this summary as context for a downstream assistant. Do not treat it as authorization to access restricted or personal information.");
  return lines.join("\n");
}

export function WebDataAgent({ powerTrader = false, initialReport, initialApi }: { powerTrader?: boolean; initialReport?: ReportChatContext; initialApi?: CatalogOperation }) {
  // `undefined` means the initial connection probe is still in flight. Keep
  // that separate from `null`, which is a real unavailable state.
  const [connection, setConnection] = useState<ConnectionState | null | undefined>();
  const [keyState, setKeyState] = useState<KeyState | null>(null);
  const [mode, setMode] = useState<LocalBackendMode>("simulation");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [result, setResult] = useState<AgentResult | null>(null);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [running, setRunning] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const submittedContext = useRef<string | null>(null);
  const messageInput = useRef<HTMLTextAreaElement | null>(null);
  const prompts = initialApi ? [
    `Show ${initialApi.name} for yesterday.`,
    `What parameters does ${initialApi.name} require?`,
    `Give me the API request for ${initialApi.name} yesterday.`,
    `How do I add ${initialApi.name} to my backend?`,
  ] : powerTrader ? [
    "What was the hourly actual load for the North region yesterday?",
    "Show today’s real-time LMP at Indiana Hub.",
    "Give me the API for hourly actual load yesterday.",
    "Add hourly Actual Load to my trading backend for yesterday.",
  ] : generalPrompts;

  const refreshConnection = async () => {
    try {
      const [nextConnection, nextKey] = await Promise.all([
        localApi<ConnectionState>("/health/"),
        localApi<KeyState>("/miso/subscription-key/"),
      ]);
      setConnection(nextConnection);
      setKeyState(nextKey);
      if (nextConnection.miso_mode === "live" || nextConnection.miso_mode === "public") {
        setMode(nextConnection.miso_mode);
      }
    } catch {
      setConnection(null);
    }
  };

  const refreshSavedSessions = async () => {
    setHistoryLoading(true);
    try {
      const next = await localApi<{ sessions: SavedSession[] }>("/agent/sessions/");
      setSavedSessions(next.sessions);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSavedSession = async (savedSessionId: string) => {
    setHistoryLoading(true);
    try {
      const next = await localApi<{ session: { session_id: string }; messages: SavedSessionMessage[] }>(`/agent/sessions/${savedSessionId}/`);
      setSessionId(next.session.session_id);
      setHistory(next.messages.map((item) => ({ role: item.role === "assistant" ? "agent" : "user", text: item.content, result: item.role === "assistant" && typeof item.payload?.["status"] === "string" ? item.payload as AgentResult : undefined })));
      const lastResult = [...next.messages].reverse().find((item) => item.role === "assistant" && typeof item.payload?.["status"] === "string");
      setResult(lastResult ? lastResult.payload as AgentResult : null);
      setHistoryOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void refreshConnection();
  }, []);

  useEffect(() => {
    const contextId = initialApi ? `api:${initialApi.source_id}` : initialReport ? `report:${initialReport.sourceId}` : null;
    if (!contextId || submittedContext.current === contextId) return;
    submittedContext.current = contextId;
    if (initialApi) {
      const required = initialApi.parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name);
      setHistory([{
        role: "agent",
        text: `API context loaded: ${initialApi.name}. This chat is scoped to ${initialApi.method} ${initialApi.endpoint}. ${required.length ? `Required input: ${required.join(", ")}.` : "No required parameters are listed."} Ask what you would like to do with this API.`,
      }]);
      return;
    }
    if (!initialReport) return;
    const mapped = initialReport.apiReplacement
      ? ` Its API-first replacement is ${initialReport.apiReplacement}${initialReport.endpoint ? ` (${initialReport.method ?? "GET"} ${initialReport.endpoint})` : ""}${initialReport.requiredParameters?.length ? `; required input: ${initialReport.requiredParameters.join(", ")}.` : "."}`
      : " No catalog-backed API replacement is recorded, so I will keep this as a report/archive request.";
    setHistory([{ role: "agent", text: `Report context loaded: ${initialReport.title}.${mapped}` }]);
  }, [initialApi, initialReport]);

  const send = async (question = message) => {
    const trimmed = question.trim();
    if (!trimmed || running) return;
    setHistory((items) => [...items, { role: "user", text: trimmed }]);
    setMessage("");
    if (messageInput.current) messageInput.current.style.height = "";
    setRunning(true);
    try {
      const selectedSourceId = initialApi?.source_id ?? initialReport?.apiReplacementSourceId;
      const next = await localApi<AgentResult>("/chat/", {
        method: "POST",
        // The selected source ID is the authoritative, server-allowlisted API
        // context. Do not repeat words such as "API" in the natural-language
        // question: the resolver correctly treats those as a request preview.
        body: JSON.stringify({ question: trimmed, session_id: sessionId, mode, selected_source_id: selectedSourceId }),
      });
      setResult(next);
      setSessionId(next.session_id ?? sessionId);
      setHistory((items) => [...items, { role: "agent", text: next.message, result: next }]);
      if (next.status === "error") setErrorOpen(true);
      void refreshSavedSessions();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Could not reach the Django backend.";
      const next = { status: "error" as const, message: text, events: [], error: { status_code: 503, category: "local_connection", what_happened: text, suggested_fix: "Start Django on port 8000, then refresh this page.", can_retry: true, safe_request_context: {} } };
      setResult(next);
      setHistory((items) => [...items, { role: "agent", text, result: next }]);
      setErrorOpen(true);
    } finally {
      setRunning(false);
    }
  };

  const conversationSummary = buildConversationSummary(history);
  const copySummary = async () => {
    await navigator.clipboard.writeText(conversationSummary);
    setSummaryCopied(true);
    window.setTimeout(() => setSummaryCopied(false), 1800);
  };

  const run505 = async () => {
    setRunning(true);
    try {
      const next = await localApi<AgentResult>("/errors/simulate/", {
        method: "POST",
        body: JSON.stringify({ status_code: 505, endpoint_id: "actual_load", parameters: { date: "2026-09-08" } }),
      });
      setResult(next);
      setErrorOpen(true);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="flex h-dvh min-h-[680px] flex-col overflow-hidden bg-[radial-gradient(circle_at_82%_0%,var(--color-accent-soft),transparent_35rem)]">
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b bg-background/80 px-5 py-3 backdrop-blur-xl sm:px-8">
        <Button asChild variant="ghost" size="sm" className="h-8 w-fit justify-self-start rounded-full px-2.5 text-[11.5px] text-muted-foreground">
          <Link to="/"><ArrowLeft className="size-3.5" />Go back</Link>
        </Button>
        <div className="min-w-0 text-center">
          <p className="text-[14px] font-medium">{powerTrader ? "Power Trader Data Agent" : "MeSo"}</p>
          {initialApi && <p className="max-w-56 truncate text-[11px] text-muted-foreground">Focused API: {initialApi.name}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-self-end gap-2">
          <Button variant="ghost" size="sm" className="h-8 rounded-full px-2.5 text-[11.5px]" onClick={() => { setHistoryOpen(true); void refreshSavedSessions(); }}><History className="size-3.5" />History</Button>
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-2.5 text-[11.5px]"><Link to="/reports"><FileText className="size-3.5" />Reports</Link></Button>
          <ModeToggle mode={mode} setMode={setMode} availableMode={connection?.miso_mode === "live" || connection?.miso_mode === "public" ? connection.miso_mode : null} />
        </div>
      </header>

      <button type="button" aria-expanded={summaryOpen} onClick={() => setSummaryOpen((open) => !open)} className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2 rounded-l-xl border border-r-0 bg-card px-2 py-3 text-[11px] font-medium shadow-lift [writing-mode:vertical-rl] hover:bg-accent-soft">
        <Clipboard className="size-3.5" />Agent summary
      </button>
      {summaryOpen && <aside role="dialog" aria-label="Agent summary" className="fixed inset-y-0 right-0 z-40 flex w-[min(92vw,30rem)] max-w-[30rem] flex-col border-l bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[15px] font-medium">Agent summary</p><p className="mt-0.5 text-[11.5px] text-muted-foreground">Copy this context into another assistant.</p></div><button type="button" onClick={() => setSummaryOpen(false)} className="rounded-lg px-2 py-1 text-[12px] text-muted-foreground hover:bg-muted">Close</button></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5"><textarea readOnly value={conversationSummary} className="min-h-[28rem] w-full resize-none rounded-xl border bg-muted/15 p-3 text-[12px] leading-relaxed outline-none" /></div>
        <div className="border-t p-4"><button type="button" onClick={() => void copySummary()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">{summaryCopied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}{summaryCopied ? "Copied" : "Copy summary"}</button></div>
      </aside>}

      {historyOpen && <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Chat history">
        <button type="button" aria-label="Close chat history" onClick={() => setHistoryOpen(false)} className="absolute inset-0 bg-foreground/15 backdrop-blur-[1px]" />
        <aside className="relative flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[15px] font-medium">Chat history</p><p className="mt-0.5 text-[11.5px] text-muted-foreground">Saved locally by the Web Data Agent</p></div><Button variant="ghost" size="icon" className="rounded-full" aria-label="Close chat history" onClick={() => setHistoryOpen(false)}><X className="size-4" /></Button></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {historyLoading && <p className="px-2 py-4 text-[12.5px] text-muted-foreground">Loading conversations…</p>}
            {!historyLoading && savedSessions.length === 0 && <p className="px-2 py-4 text-[12.5px] leading-relaxed text-muted-foreground">Your completed Web Data Agent conversations will appear here.</p>}
            {!historyLoading && <div className="space-y-2">{savedSessions.map((item) => <button type="button" key={item.session_id} onClick={() => void loadSavedSession(item.session_id)} className={cn("w-full rounded-2xl border p-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/20", item.session_id === sessionId && "border-accent bg-accent-soft/20")}><p className="truncate text-[12.5px] font-medium">{item.preview}</p><p className="mt-1 text-[10.5px] text-muted-foreground">{item.message_count} messages · {new Date(item.updated_at).toLocaleString()}</p></button>)}</div>}
          </div>
        </aside>
      </div>}

      <section className="min-h-0 flex-1 overflow-y-auto pb-36">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
          {!history.length && (
            <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-3xl flex-col justify-center text-center">
              <Sparkles className="mx-auto size-7 text-accent" />
              <h1 className="mt-4 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1] tracking-[-0.045em]">{initialApi ? `What would you like to do with ${initialApi.name}?` : "Hi, I’m MeSo, what would you like to do?"}</h1>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">{initialApi ? "The selected API’s verified catalog metadata is already in this conversation." : initialReport ? `Focused on ${initialReport.title}. Its report and API-replacement context is ready.` : "Ask for data, a chart, API guidance, or a report. Implementation work is sent to your local agent only when you request it."}</p>

              <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
                <ConnectionCard keyState={keyState} connection={connection} onRefresh={refreshConnection} />
                <ErrorCenter onRun505={() => void run505()} running={running} />
              </div>

              <div className="mt-8 border-t pt-6">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Recommended tasks</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {prompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => void send(prompt)} className="rounded-full border bg-background px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground">{prompt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && <div className="mx-auto max-w-4xl space-y-4 pt-4">
            {history.map((turn, index) => {
              const priorQuestion = [...history.slice(0, index)].reverse().find((item) => item.role === "user")?.text ?? "";
              return (
              <div key={index} className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed", turn.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border bg-card/90 text-foreground shadow-soft")}>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] opacity-65">{turn.role === "user" ? "You" : "MeSo"}</p>
                <p>{turn.text}</p>
                {turn.result && <div className="mt-4 border-t border-border/60 pt-4"><ResultPanel result={turn.result} question={priorQuestion} detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} onQuickReply={(text) => void send(text)} />{turn.result.handoff && <LocalAgentHandoff handoff={turn.result.handoff} />}<div className="mt-4"><AgentTimeline events={turn.result.events ?? []} statusLabel={agentStatusLabel(turn.result)} /></div></div>}
              </div>
              );
            })}
            {running && <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground"><Loader2 className="size-4 animate-spin text-accent" /> Agent is resolving parameters and preparing a request…</div>}
          </div>}

          {result && history.length === 0 && <section className="mx-auto mt-5 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]"><div className="rounded-3xl border bg-card p-5 shadow-soft sm:p-6"><ResultPanel result={result} question="" detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} onQuickReply={(text) => void send(text)} /></div><AgentTimeline events={result.events ?? []} statusLabel={agentStatusLabel(result)} /></section>}

          {result?.error && <section className="mx-auto mt-5 max-w-6xl rounded-3xl border border-destructive/25 bg-card p-5 shadow-soft sm:p-6"><button type="button" onClick={() => setErrorOpen((open) => !open)} className="flex w-full items-center justify-between text-left"><span className="flex items-center gap-2 text-[15px] font-medium"><CircleAlert className="size-4 text-destructive" /> Error Center — HTTP {result.error.status_code}</span><ChevronDown className={cn("size-4 transition-transform", errorOpen && "rotate-180")} /></button>{errorOpen && <ErrorDiagnosis error={result.error} request={result.request} />}</section>}
        </div>
      </section>

      <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 px-5 pb-6 pt-3 backdrop-blur-xl sm:px-8 sm:pb-7">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border bg-card p-2 shadow-lift">
          <textarea ref={messageInput} value={message} onChange={(event) => { setMessage(event.target.value); event.currentTarget.style.height = "auto"; event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 144)}px`; }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={1} placeholder="Ask about MISO data, a report, an endpoint, or a technical integration…" className="h-9 min-h-9 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-[13px] outline-none placeholder:text-muted-foreground" />
          <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={running || !message.trim()} aria-label="Send question"><ArrowUp className="size-4" /></Button>
        </div>
      </form>
    </main>
  );
}

function ModeToggle({ mode, setMode, availableMode }: { mode: LocalBackendMode; setMode: (mode: LocalBackendMode) => void; availableMode: "live" | "public" | null }) {
  const realLabel = availableMode === "live" ? "Live MISO" : "Public MISO";
  const realTitle = availableMode === "live"
    ? "Use configured MISO Data Exchange credentials"
    : availableMode === "public"
      ? "Use MISO's anonymous public Fuel Mix feed for supported endpoints"
      : "Configure MISO_SUBSCRIPTION_KEY in backend/.env, or use a public-mapped endpoint";
  return (
    <div className="flex rounded-full border bg-muted/20 p-0.5 text-[11px]">
      <button type="button" onClick={() => setMode("simulation")} className={cn("rounded-full px-2.5 py-1", mode === "simulation" && "bg-accent-soft text-accent")}>
        Simulation
      </button>
      <button
        type="button"
        disabled={!availableMode}
        title={realTitle}
        onClick={() => availableMode && setMode(availableMode)}
        className={cn(
          "rounded-full px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-45",
          (mode === "live" || mode === "public") && "bg-success-soft text-success",
        )}
      >
        {realLabel}
      </button>
    </div>
  );
}

function ConnectionCard({ keyState, connection, onRefresh }: { keyState: KeyState | null; connection: ConnectionState | null | undefined; onRefresh: () => Promise<void> }) {
  const checking = connection === undefined;
  const helper = keyState?.configured
    ? "Subscription key configured server-side. The browser and local agent cannot read it."
    : connection?.miso_mode === "public"
      ? "No Data Exchange key needed for Public MISO mode. Fuel Mix uses MISO's anonymous public API; other datasets stay simulated."
      : "Use simulation now, or configure a subscription key in the web service environment.";
  return <section className="rounded-3xl border bg-card p-5 shadow-soft"><div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><KeyRound className="size-4" /></span><div><p className="text-[14px] font-medium">Web Agent</p><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{helper}</p></div></div><button type="button" onClick={() => void onRefresh()} className={cn("mt-4 w-full rounded-xl border px-3 py-2 text-left text-[12px] transition-colors hover:border-accent", checking ? "bg-muted/20 text-muted-foreground" : connection ? "border-success/25 bg-success-soft text-success" : "border-destructive/25 bg-destructive-soft text-destructive")}><ShieldCheck className="mr-1.5 inline size-3.5" />{checking ? "Checking web agent connection…" : connection ? `Web agent online · ${connection.miso_mode} mode` : "Web agent unavailable — refresh to retry"}</button><a href={keyState?.portal_url ?? "https://data-exchange.misoenergy.org/products"} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-[12px] font-medium text-accent hover:underline">Manage subscription keys in MISO Data Exchange →</a></section>;
}

function ErrorCenter({ onRun505, running }: { onRun505: () => void; running: boolean }) {
  return <section className="rounded-3xl border bg-card p-5 shadow-soft"><div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive"><TerminalSquare className="size-4" /></span><div><p className="text-[14px] font-medium">505 Error Center</p><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Trigger an intentional HTTP Version Not Supported response. The web agent diagnoses it and sends only safe remediation instructions to the local agent.</p></div></div><Button variant="outline" size="sm" className="mt-4 w-full rounded-xl" disabled={running} onClick={onRun505}><Play className="size-3.5" />Simulate HTTP 505</Button></section>;
}

function downloadCsv(result: AgentResult, question = "") {
  downloadReadableCsv(result, question);
}

function MissingParameterPrompt({
  missing,
  message,
  onQuickReply,
}: {
  missing: NonNullable<AgentResult["missing_parameters"]>;
  message?: string;
  onQuickReply: (text: string) => void;
}) {
  const [customDate, setCustomDate] = useState("");
  const needsDate = missing.some((item) => item.name === "date");
  return (
    <div className="mt-5 rounded-2xl border border-accent/20 bg-accent-soft/25 p-4">
      <p className="text-[13px] font-medium">One detail is needed before I can continue.</p>
      {message ? <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{message}</p> : null}
      {needsDate ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onQuickReply("today")} className="rounded-full border bg-card px-3 py-1.5 text-[12px] hover:border-accent">
            Today
          </button>
          <button type="button" onClick={() => onQuickReply("yesterday")} className="rounded-full border bg-card px-3 py-1.5 text-[12px] hover:border-accent">
            Yesterday
          </button>
          <label className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[12px]">
            <span className="text-muted-foreground">Pick a date</span>
            <input
              type="date"
              value={customDate}
              onChange={(event) => setCustomDate(event.target.value)}
              className="bg-transparent text-[12px] outline-none"
            />
          </label>
          <button
            type="button"
            disabled={!customDate}
            onClick={() => onQuickReply(customDate)}
            className="rounded-full border bg-card px-3 py-1.5 text-[12px] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use selected date
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {missing.map((item) => (
            <span key={item.name} className="rounded-full border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  question,
  detailsOpen,
  setDetailsOpen,
  onQuickReply,
}: {
  result: AgentResult;
  question: string;
  detailsOpen: boolean;
  setDetailsOpen: (open: boolean) => void;
  onQuickReply: (text: string) => void;
}) {
  const semantic = result.data?.data?.length ? buildSemanticView(result, question) : null;
  const rows = result.data?.data?.slice(0, 6) ?? [];
  const allRows = result.data?.data ?? [];
  const handoffHref = ptdHandoffHref(result);
  const awaitingInput = Boolean(result.missing_parameters?.length);
  const apiDocs =
    result.api_only && result.endpoint?.id
      ? buildAgentApiDocs({
          endpointId: result.endpoint.id,
          endpointName: result.endpoint.name,
          parameters: result.parameters,
          documentationUrl: result.endpoint.documentation_url,
        })
      : null;
  return <><div className="flex flex-wrap items-start justify-between gap-3"><div>{(result.endpoint?.name || result.report?.title) && <h2 className="text-[20px] font-medium">{result.endpoint?.name ?? result.report?.title}</h2>}{result.message && !awaitingInput ? <p className="mt-1 text-[13px] text-muted-foreground">{result.message}</p> : null}</div>{typeof result.verification?.status_code === "number" && <span className="flex items-center gap-1.5 text-[11.5px] text-success"><CheckCircle2 className="size-3.5" />HTTP {result.verification.status_code}</span>}</div>
  {result.sources && result.sources.length > 0 && <div className="mt-4 rounded-2xl border bg-muted/10 p-3"><p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Sources</p><div className="mt-2 flex flex-wrap gap-2">{result.sources.map((source, index) => { const label = source.page ? `${source.title} · PDF p. ${source.page}` : source.title; return <div key={`${source.title}-${index}`} className="flex flex-col gap-2">{source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent">{label}<ArrowUpRight className="size-3" /></a> : <span title={source.document} className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-foreground">{label}</span>}{source.request_json && <details className="rounded-lg border bg-card px-2.5 py-1.5 text-[10.5px]"><summary className="cursor-pointer font-medium text-muted-foreground">View JSON request</summary><pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap text-[10px] leading-relaxed">{JSON.stringify(source.request_json, null, 2)}</pre></details>}</div>; })}</div></div>}
  {result.access_request && <div className="mt-5 rounded-2xl border border-dashed bg-muted/30 p-4"><p className="text-[13px] font-medium">Access request email generated</p><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{result.access_request.timeline}</p><a className="mt-3 inline-flex rounded-lg border bg-card px-3 py-1.5 text-[12px] font-medium" href={`mailto:${result.access_request.recipient}?subject=${encodeURIComponent(result.access_request.subject)}&body=${encodeURIComponent(result.access_request.body)}`}>Open email draft</a></div>}
  {result.report && <div className="mt-5 rounded-2xl border bg-muted/20 p-4"><p className="text-[12px] leading-relaxed text-muted-foreground">{result.report.description}</p><a href={result.report.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-[12px] font-medium text-accent hover:underline">Open official MISO report →</a></div>}
  {awaitingInput && result.missing_parameters ? <MissingParameterPrompt missing={result.missing_parameters} message={result.message} onQuickReply={onQuickReply} /> : null}

  {apiDocs ? <ApiDocsAnswer docs={apiDocs} onCallApi={onQuickReply} /> : null}

  {apiDocs ? null : semantic ? (
    <>
      <SemanticVisualization dataset={semantic.dataset} plan={semantic.plan} />
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={() => downloadCsv(result, question)} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent">
          <Download className="size-3.5" />Download CSV
        </button>
      </div>
    </>
  ) : (
    <>
      {result.summary && <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(result.summary).map(([label, value]) => <div key={label} className="rounded-xl border bg-muted/20 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-[16px] font-medium">{typeof value === "number" ? value.toLocaleString() : value}</p></div>)}</div>}
      {result.chart_requested && rows.length > 1 && <MiniChart rows={result.data?.data ?? []} />}
      {rows.length > 0 && <div className="mt-5 overflow-hidden rounded-2xl border"><div className="flex items-center justify-between border-b bg-muted/25 px-3 py-2"><span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Preview · {allRows.length.toLocaleString()} rows</span><button type="button" onClick={() => downloadCsv(result, question)} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent"><Download className="size-3.5" />Download CSV</button></div><div className="grid grid-cols-3 border-b bg-muted/25 px-3 py-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground"><span>Market date</span><span>Interval</span><span>Value</span></div>{rows.map((row, index) => <div key={index} className="grid grid-cols-3 border-b px-3 py-2 text-[12px] last:border-0"><span>{String(row.marketDate ?? "—")}</span><span>{String(row.interval ?? "—")}</span><span>{Number(row.value ?? 0).toLocaleString()}</span></div>)}</div>}
    </>
  )}

  {handoffHref && <a href={handoffHref} className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-accent-soft/20 px-4 py-3 transition-colors hover:bg-accent-soft/35"><div><p className="text-[13px] font-medium">Open in PTD Infographcs</p><p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">Transfer this non-secret endpoint and its resolved parameters to the separate chart workspace.</p></div><ArrowUpRight className="size-4 shrink-0 text-accent" /></a>}
  {!apiDocs && result.request && <div className="mt-5 overflow-hidden rounded-2xl border"><button type="button" onClick={() => setDetailsOpen(!detailsOpen)} className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-medium"><span className="flex items-center gap-2"><Code2 className="size-3.5 text-accent" /> Request verification</span><ChevronDown className={cn("size-4 transition-transform", detailsOpen && "rotate-180")} /></button>{detailsOpen && <div className="border-t bg-muted/10 p-4"><dl className="grid gap-3 text-[12px] sm:grid-cols-2"><Detail label="Method" value={result.request.method} /><Detail label="Authentication" value="Applied only server-side" /><Detail label="Endpoint" value={result.request.endpoint} mono /><Detail label="Parameters" value={Object.entries(result.parameters ?? {}).map(([key, value]) => `${key} = ${value}`).join(" · ") || "None"} mono /></dl></div>}</div>}
  </>;
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) { return <div><dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className={cn("mt-1 break-all", mono && "font-mono text-[10.5px]")}>{value}</dd></div>; }

function MiniChart({ rows }: { rows: Array<Record<string, string | number>> }) {
  const values = rows.map((row) => Number(row.value)).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 100;
    const y = 92 - ((value - min) / Math.max(max - min, 1)) * 78;
    return `${x},${y}`;
  }).join(" ");
  return <div className="mt-5 rounded-2xl border bg-muted/10 p-4"><div className="flex items-center justify-between"><p className="text-[12px] font-medium">Requested chart</p><p className="text-[10.5px] text-muted-foreground">Development data when labelled simulated</p></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-36 w-full overflow-visible"><path d="M0,92 H100" stroke="currentColor" className="text-border" strokeWidth="0.7" fill="none" /><polyline points={points} vectorEffect="non-scaling-stroke" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg><div className="flex justify-between text-[10.5px] text-muted-foreground"><span>{min.toLocaleString()}</span><span>{max.toLocaleString()}</span></div></div>;
}

function LocalAgentHandoff({ handoff }: { handoff: NonNullable<AgentResult["handoff"]> }) {
  const [status, setStatus] = useState(handoff.status);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const next = await localApi<{ status: typeof handoff.status; receipt: Record<string, unknown> }>(`/agent/handoffs/${handoff.id}/`);
        if (active) {
          setStatus(next.status);
          setReceipt(next.receipt);
        }
      } catch {
        // The web chat still works if the optional local agent is offline.
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 1500);
    return () => { active = false; window.clearInterval(timer); };
  }, [handoff.id]);
  const complete = status === "completed";
  const generatedDirectory = receipt?.["generated_directory"];
  return <section className={cn("mt-5 rounded-2xl border p-4", complete ? "border-success/25 bg-success-soft/25" : "border-accent/25 bg-accent-soft/20")}><p className="flex items-center gap-2 text-[13px] font-medium"><Database className={cn("size-4", complete ? "text-success" : "text-accent")} /> Local Integration Agent</p><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{complete ? generatedDirectory ? "The local agent verified the signed instruction and created a reviewable integration package. It did not receive a subscription key." : "The local agent verified the signed instruction and wrote a reviewable integration manifest. It did not receive a subscription key." : "The web agent has queued a signed, secret-free instruction. Run python local_agent/agent.py --once --apply to create the local integration package."}</p><a href={localAgentDownloadUrl()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent" download><Download className="size-3.5" />Download Local Agent</a><div className="mt-3 flex items-center justify-between rounded-xl border bg-card/60 px-3 py-2 text-[11.5px]"><span className="font-medium capitalize">{status}</span><code className="text-muted-foreground">handoff {handoff.id.slice(0, 8)}</code></div>{generatedDirectory && <p className="mt-2 break-all text-[11px] text-muted-foreground">Integration package: {String(generatedDirectory)}</p>}{receipt?.["manifest_path"] && <p className="mt-2 break-all text-[11px] text-muted-foreground">Manifest: {String(receipt["manifest_path"])}</p>}</section>;
}

function agentStatusLabel(result: AgentResult) {
  return result.status === "ignored" ? "IGNORED" : result.status === "needs_input" ? "DETAIL NEEDED" : result.status === "validation_error" ? "PARAMETER NEEDS ATTENTION" : result.simulated ? "SIMULATED RESPONSE" : result.status === "error" ? "REQUEST FAILED" : result.api_only ? "API REQUEST READY" : result.integration_guidance ? "INTEGRATION TEMPLATE" : result.report ? "OFFICIAL REPORT" : "REQUEST VERIFIED";
}

function AgentTimeline({ events, statusLabel }: { events: AgentResult["events"]; statusLabel?: string }) {
  const [open, setOpen] = useState(false);
  return <section className="rounded-2xl border bg-muted/10"><button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"><span className="flex items-center gap-2 text-[13px] font-medium"><Activity className="size-4 text-accent" /> Agent execution</span><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>{open && <div className="border-t px-4 py-4">{statusLabel && <p className="mb-4 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Status · {statusLabel}</p>}<ol className="space-y-4">{events.map((event, index) => <li key={index} className="flex gap-3"><span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", event.status === "error" ? "bg-destructive-soft text-destructive" : event.status === "warning" ? "bg-accent-soft text-accent" : "bg-success-soft text-success")}>{event.status === "error" ? <XCircle className="size-3.5" /> : event.status === "warning" ? <CircleAlert className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}</span><div><p className="text-[12.5px] font-medium capitalize">{event.stage}</p><p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{event.message}</p></div></li>)}</ol></div>}</section>;
}

function ErrorDiagnosis({ error, request }: { error: NonNullable<AgentResult["error"]>; request?: AgentResult["request"] }) { return <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2"><div className="rounded-2xl border bg-destructive-soft/25 p-4"><p className="text-[10.5px] font-medium uppercase tracking-wide text-destructive">What happened</p><p className="mt-2 text-[13px] leading-relaxed">{error.what_happened}</p><p className="mt-3 text-[11.5px] text-muted-foreground">Classification: {error.category.replace("_", " ")}</p></div><div className="rounded-2xl border bg-muted/20 p-4"><p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Agent recommendation</p><p className="mt-2 text-[13px] leading-relaxed">{error.suggested_fix}</p><p className="mt-3 text-[11.5px] text-muted-foreground">{error.can_retry ? "Retry is permitted after this check." : "A retry is not recommended until configuration is corrected."}</p></div>{request && <div className="sm:col-span-2 rounded-2xl border bg-muted/10 p-4"><p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">Safe request context</p><code className="mt-2 block break-all text-[11px]">{request.method} {request.url}</code><p className="mt-2 text-[11px] text-muted-foreground">No subscription key or authorization value was recorded.</p></div>}</div>; }
