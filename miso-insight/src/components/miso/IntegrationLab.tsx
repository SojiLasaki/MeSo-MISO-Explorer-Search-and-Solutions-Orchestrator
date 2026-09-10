import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Bot,
  ClipboardCheck,
  CheckCircle2,
  Code2,
  Database,
  FileWarning,
  KeyRound,
  Play,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocalAgentDialog } from "@/components/miso/LocalAgentDialog";
import {
  EXTERNAL_USER_PERSONAS,
  getExternalUserPersona,
  type ExternalUserPersonaId,
  type IntegrationSimulationMode,
} from "@/lib/miso/integration-lab";
import { runIntegrationSimulation } from "@/lib/miso.functions";
import { toApiRequestSpec } from "@/lib/miso/request-builder";
import { getSource } from "@/lib/miso/registry";
import type {
  IntegrationChatTurn,
  IntegrationSimulationResult,
  SimulatedLocalChange,
} from "@/lib/miso/integration-simulator.server";
import { cn } from "@/lib/utils";

const EVENT_ICON = {
  agent: Bot,
  validation: CheckCircle2,
  backend: Code2,
  api: Activity,
  analysis: Database,
  error: TriangleAlert,
} as const;

export function IntegrationLab() {
  const [personaId, setPersonaId] = useState<ExternalUserPersonaId>("market_participant");
  const [mode, setMode] = useState<IntegrationSimulationMode>("success");
  const [result, setResult] = useState<IntegrationSimulationResult | null>(null);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [running, setRunning] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const runSimulation = useServerFn(runIntegrationSimulation);
  const persona = getExternalUserPersona(personaId);

  useEffect(
    () => () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    },
    [],
  );

  const run = async () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRunning(true);
    setResult(null);
    setVisibleEvents(0);
    try {
      const next = await runSimulation({ data: { persona: personaId, mode } });
      setResult(next);
      let count = 0;
      intervalRef.current = window.setInterval(() => {
        count += 1;
        setVisibleEvents(count);
        if (count >= next.events.length && intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
        }
      }, 360);
    } catch {
      setRunning(false);
    }
  };

  const events = result?.events.slice(0, visibleEvents) ?? [];
  const complete = Boolean(result && visibleEvents >= result.events.length);
  const selectedSource = result ? getSource(result.request.sourceId) : undefined;
  const localAgentApi =
    result && selectedSource ? toApiRequestSpec(selectedSource, result.request.parameters) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,var(--color-accent-soft),transparent_35rem)]">
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-soft">
            <span className="size-1.5 rounded-full bg-accent" />
            Safe backend preflight
          </div>
          <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.05em]">
            Prove the data workflow <span className="text-accent">before production.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Simulate how different MISO external users ask questions, choose a catalog-backed API,
            validate inputs, run a server-only integration, and recover from gateway failures. This
            lab is deterministic: it never uses a subscription key or sends a live MISO request.
          </p>
        </div>

        <section className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-3xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-accent" />
              <h2 className="text-[16px] font-medium">External user workflow</h2>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Choose a role; the agent questions and API selection remain explicitly scoped.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {EXTERNAL_USER_PERSONAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPersonaId(item.id);
                    setResult(null);
                    setVisibleEvents(0);
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    personaId === item.id
                      ? "border-accent bg-accent-soft"
                      : "bg-background hover:bg-muted/60",
                  )}
                >
                  <p className="text-[12.5px] font-medium">{item.shortTitle}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border bg-muted/25 p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Agent discovery
              </p>
              <div className="mt-3 space-y-3">
                {persona.questions.map((item) => (
                  <div key={item.question} className="rounded-xl bg-background p-3">
                    <p className="flex gap-2 text-[12.5px] font-medium">
                      <Bot className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      {item.question}
                    </p>
                    <p className="mt-2 ml-5 text-[12px] text-muted-foreground">
                      <span className="font-medium text-foreground">Persona answer:</span>{" "}
                      {item.answer}
                    </p>
                    <p className="mt-1 ml-5 text-[11.5px] leading-relaxed text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-background p-4">
              <div className="flex items-center gap-2">
                <FileWarning className="size-4 text-accent" />
                <p className="text-[13px] font-medium">Gateway recovery test</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ModeButton
                  active={mode === "success"}
                  onClick={() => setMode("success")}
                  title="Successful response"
                  copy="Validate and analyze a simulated API response."
                />
                <ModeButton
                  active={mode === "http_505"}
                  onClick={() => setMode("http_505")}
                  title="Simulate HTTP 505"
                  copy="Review a protocol error without an unsafe retry."
                />
              </div>
            </div>

            <Button
              className="mt-5 w-full rounded-xl"
              disabled={running}
              onClick={() => void run()}
            >
              <Play className="size-4" />
              {running ? "Agent is analyzing…" : "Run backend simulation"}
            </Button>
          </div>

          <div className="min-h-[620px] rounded-3xl border bg-card p-5 shadow-lift sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Live simulation timeline
                </p>
                <h2 className="mt-1 text-[18px] font-medium">{persona.title}</h2>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  mode === "http_505"
                    ? "bg-destructive-soft text-destructive"
                    : "bg-success-soft text-success",
                )}
              >
                {mode === "http_505" ? "505 diagnostic" : "Simulation only"}
              </span>
            </div>

            {!result && !running && (
              <div className="grid min-h-[480px] place-items-center text-center">
                <div className="max-w-sm">
                  <Wrench className="mx-auto size-7 text-accent" />
                  <p className="mt-4 text-[15px] font-medium">Ready to inspect the full path</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    The run will select <code>{persona.sourceId}</code>, validate its catalog
                    parameters, use the server gateway, and analyze a safe simulated response.
                  </p>
                </div>
              </div>
            )}

            {(running || result) && (
              <div className="pt-5">
                <ol className="space-y-3">
                  {events.map((event, index) => {
                    const Icon = EVENT_ICON[event.stage];
                    return (
                      <li key={`${event.stage}-${index}`} className="flex gap-3 animate-rise">
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full",
                            event.status === "error"
                              ? "bg-destructive-soft text-destructive"
                              : event.status === "warning"
                                ? "bg-accent-soft text-accent"
                                : "bg-success-soft text-success",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <p className="pt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                          {event.message}
                        </p>
                      </li>
                    );
                  })}
                  {running && !events.length && (
                    <li className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
                      <span className="size-2 animate-pulse rounded-full bg-accent" />
                      Validating the user’s requested workflow…
                    </li>
                  )}
                </ol>

                {complete && result.status === "success" && result.analysis && (
                  <SimulationAnalysis result={result} />
                )}
                {complete && result.errorAdvice && <GatewayAdvice result={result} />}
                {complete && <AgentChatTranscript turns={result.chatTranscript} />}
                {complete && (
                  <section className="mt-6 rounded-2xl border bg-muted/20 p-4">
                    <p className="flex items-center gap-2 text-[12.5px] font-medium">
                      <ClipboardCheck className="size-4 text-accent" />
                      Simulated local edits ready
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                      {result.backendWrite.note} This is a sandbox simulation; it does not alter a
                      user repository. The local coding agent can apply reviewed changes after
                      download.
                    </p>
                    <LocalChanges changes={result.localChanges} />
                    <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
                      <KeyRound className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      For a real run, configure the subscription key only in the backend
                      environment. A signed-in API result can then use the existing local-agent
                      download handoff.
                    </p>
                    {result.status === "success" && localAgentApi && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full rounded-full"
                        onClick={() => setAgentOpen(true)}
                      >
                        <Bot className="size-3.5" />
                        Hand off to local coding agent
                      </Button>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
      {localAgentApi && (
        <LocalAgentDialog api={localAgentApi} open={agentOpen} onOpenChange={setAgentOpen} />
      )}
    </main>
  );
}

function ModeButton({
  active,
  title,
  copy,
  onClick,
}: {
  active: boolean;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors",
        active ? "border-accent bg-accent-soft" : "hover:bg-muted/60",
      )}
    >
      <p className="text-[12.5px] font-medium">{title}</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{copy}</p>
    </button>
  );
}

function SimulationAnalysis({ result }: { result: IntegrationSimulationResult }) {
  const { analysis, request, persona } = result;
  if (!analysis) return null;
  return (
    <section className="mt-6 rounded-2xl border border-success/20 bg-success-soft/30 p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-medium text-success">
        <CheckCircle2 className="size-4" />
        Response analysis complete
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Metric label="Rows" value={String(analysis.records)} />
        <Metric label="Minimum" value={formatMetric(analysis.numericSummary?.minimum)} />
        <Metric label="Average" value={formatMetric(analysis.numericSummary?.average)} />
        <Metric label="Maximum" value={formatMetric(analysis.numericSummary?.maximum)} />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{analysis.note}</p>
      <p className="mt-2 text-[11.5px] text-muted-foreground">
        {persona.outcome} Request:{" "}
        <code>
          {request.method} {request.url}
        </code>
      </p>
    </section>
  );
}

function AgentChatTranscript({ turns }: { turns: IntegrationChatTurn[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-accent/20 bg-accent-soft/20 p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-medium">
        <Bot className="size-4 text-accent" />
        Web chat ↔ local-agent transcript
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Deterministic test conversation. The agent asks for parameter values and a safe credential
        reference—not a subscription key.
      </p>
      <ol className="mt-4 space-y-3">
        {turns.map((turn, index) => (
          <li
            key={`${turn.actor}-${index}`}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed",
              turn.actor === "agent" ? "bg-background" : "border-accent/20 bg-card",
              turn.kind === "error" && "border-destructive/30 bg-destructive-soft/25",
            )}
          >
            <p className="mb-1 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {turn.actor === "agent" ? <Bot className="size-3" /> : <Users className="size-3" />}
              {turn.actor === "agent" ? "Local agent" : "Web chat"}
            </p>
            <p>{turn.message}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LocalChanges({ changes }: { changes: SimulatedLocalChange[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {changes.map((change) => (
        <li key={change.path} className="rounded-xl border bg-background px-3 py-2.5">
          <code className="block break-all text-[11.5px] text-foreground">{change.path}</code>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            {change.action}
          </p>
        </li>
      ))}
    </ul>
  );
}

function GatewayAdvice({ result }: { result: IntegrationSimulationResult }) {
  const advice = result.errorAdvice;
  if (!advice) return null;
  return (
    <section className="mt-6 rounded-2xl border border-destructive/20 bg-destructive-soft/25 p-4">
      <p className="flex items-center gap-2 text-[13px] font-medium text-destructive">
        <XCircle className="size-4" />
        {advice.title}
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
        {advice.explanation}
      </p>
      <p className="mt-3 rounded-lg bg-background/70 px-3 py-2 text-[11.5px] font-medium text-foreground">
        Agent decision: {advice.retry.replace(/_/g, " ")}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Suggested fix
          </p>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
            {advice.actions.map((action) => (
              <li key={action}>• {action}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Safe support context
          </p>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
            {advice.safeSupportContext.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
        Never paste a subscription key, authentication header, or private infrastructure details
        into a support ticket or agent chat.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background px-3 py-2.5">
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-medium">{value}</p>
    </div>
  );
}

function formatMetric(value: number | undefined) {
  return value == null
    ? "—"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}
