import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { localApi, type AgentResult, type ConnectionState, type KeyState } from "@/lib/local-backend";

type PtdEndpointId =
  | "actual_load"
  | "day_ahead_demand"
  | "realtime_lmp"
  | "realtime_generation_fuel_type";

type DataMode = "simulation" | "live";
type Controls = { date: string; region: string; node: string };

type EndpointCard = {
  id: PtdEndpointId;
  name: string;
  category: string;
  unit: string;
  accent: string;
  parameters: (controls: Controls) => Record<string, string>;
};

function defaultMarketDate() {
  const value = new Date();
  value.setDate(value.getDate() - 1);
  return value.toISOString().slice(0, 10);
}

const ENDPOINTS: EndpointCard[] = [
  {
    id: "actual_load",
    name: "Actual Load",
    category: "Load, Generation & Interchange",
    unit: "MW",
    accent: "#B8FF36",
    parameters: ({ date, region }) => ({
      date,
      geoResolution: "region",
      region,
      timeResolution: "hourly",
      pageNumber: "1",
    }),
  },
  {
    id: "day_ahead_demand",
    name: "Day-Ahead Cleared Demand",
    category: "Load, Generation & Interchange",
    unit: "MW",
    accent: "#78C8FF",
    parameters: ({ date, region }) => ({
      date,
      region,
      timeResolution: "hourly",
      pageNumber: "1",
    }),
  },
  {
    id: "realtime_lmp",
    name: "Real-Time Ex-Post LMP",
    category: "Pricing",
    unit: "$/MWh",
    accent: "#C8A8FF",
    parameters: ({ date, node }) => ({
      date,
      node,
      timeResolution: "hourly",
      preliminaryFinal: "Final",
      pageNumber: "1",
    }),
  },
  {
    id: "realtime_generation_fuel_type",
    name: "Real-Time Generation Fuel Type",
    category: "Load, Generation & Interchange",
    unit: "MW",
    accent: "#FFB86B",
    parameters: ({ date, region }) => ({ date, region, pageNumber: "1" }),
  },
];

const ENDPOINT_IDS = new Set<PtdEndpointId>(ENDPOINTS.map((endpoint) => endpoint.id));

function isEndpointId(value: string | null): value is PtdEndpointId {
  return Boolean(value && ENDPOINT_IDS.has(value as PtdEndpointId));
}

function rowsFor(result: AgentResult | undefined) {
  return (result?.data?.data ?? [])
    .map((row) => ({ interval: String(row.interval ?? ""), value: Number(row.value ?? 0) }))
    .filter((row) => Number.isFinite(row.value));
}

function formatNumber(value: number, unit: string) {
  const maximumFractionDigits = unit === "$/MWh" ? 2 : 0;
  return `${value.toLocaleString(undefined, { maximumFractionDigits })} ${unit}`;
}

function CardChart({ card, result }: { card: EndpointCard; result?: AgentResult }) {
  const rows = useMemo(() => rowsFor(result), [result]);
  const values = rows.map((row) => row.value);
  const succeeded = result?.status === "success";
  const summary = values.length
    ? {
        peak: Math.max(...values),
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        minimum: Math.min(...values),
      }
    : null;

  return (
    <article className="overflow-hidden rounded-[22px] border border-white/10 bg-[#10151D] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{card.category}</p>
          <h2 className="mt-1 text-[17px] font-medium tracking-[-0.035em] text-white">{card.name}</h2>
        </div>
        {result ? (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold tracking-[0.08em] ${!succeeded ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : result.simulated ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-[#B8FF36]/25 bg-[#B8FF36]/10 text-[#D7FF8D]"}`}>
            {!succeeded ? "REQUEST ERROR" : result.simulated ? "SIMULATED" : "MISO VERIFIED"}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-white/35">READY</span>
        )}
      </div>

      {rows.length > 1 ? (
        <div className="mt-5 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id={`ptd-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={card.accent} stopOpacity={0.38} />
                  <stop offset="100%" stopColor={card.accent} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="interval" tickLine={false} axisLine={false} minTickGap={28} tick={{ fill: "rgba(255,255,255,0.36)", fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} width={42} tick={{ fill: "rgba(255,255,255,0.36)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#151B24", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff" }}
                labelStyle={{ color: "rgba(255,255,255,0.55)" }}
                formatter={(value) => [formatNumber(Number(value), card.unit), card.name]}
              />
              <Area type="monotone" dataKey="value" stroke={card.accent} strokeWidth={2.25} fill={`url(#ptd-${card.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 grid h-44 place-items-center rounded-xl border border-dashed border-white/10 bg-black/10 px-5 text-center">
          <p className="text-[12px] leading-relaxed text-white/40">{result?.error ? result.error.what_happened : "This endpoint will render when the MISO-shaped simulation is run."}</p>
        </div>
      )}

      {summary && (
        <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/15">
          {[
            ["Peak", summary.peak],
            ["Average", summary.average],
            ["Minimum", summary.minimum],
          ].map(([label, value]) => (
            <div key={String(label)} className="px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.1em] text-white/35">{label}</p>
              <p className="mt-1 text-[12px] font-medium tabular-nums text-white/80">{formatNumber(Number(value), card.unit)}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function PTDInfographics() {
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [keyState, setKeyState] = useState<KeyState | null>(null);
  const [date, setDate] = useState(defaultMarketDate);
  const [region, setRegion] = useState("NORTH");
  const [node, setNode] = useState("INDIANA.HUB");
  const [mode, setMode] = useState<DataMode>("simulation");
  const [results, setResults] = useState<Partial<Record<PtdEndpointId, AgentResult>>>({});
  const [loading, setLoading] = useState(false);
  const [handoffNotice, setHandoffNotice] = useState<string | null>(null);
  const handoffConsumed = useRef(false);

  const refreshConnection = useCallback(async () => {
    try {
      const [nextConnection, nextKey] = await Promise.all([
        localApi<ConnectionState>("/health/"),
        localApi<KeyState>("/miso/subscription-key/"),
      ]);
      setConnection(nextConnection);
      setKeyState(nextKey);
    } catch {
      setConnection(null);
      setKeyState(null);
    }
  }, []);

  useEffect(() => { void refreshConnection(); }, [refreshConnection]);

  const liveAvailable = connection?.miso_mode === "live" && keyState?.configured === true;
  const executeDashboard = useCallback(async (controls: Controls, requestedMode: DataMode) => {
    setLoading(true);
    try {
      const completed: Array<readonly [PtdEndpointId, AgentResult]> = [];
      for (const endpoint of ENDPOINTS) {
        try {
          const response = await localApi<AgentResult>("/agent/execute/", {
            method: "POST",
            body: JSON.stringify({
              endpoint_id: endpoint.id,
              parameters: endpoint.parameters(controls),
              mode: requestedMode,
            }),
          });
          completed.push([endpoint.id, response]);
        } catch (error) {
          const message = error instanceof Error ? error.message : "The MISO chart request could not be completed.";
          completed.push([endpoint.id, {
            status: "error",
            message,
            events: [],
            error: { status_code: 503, category: "connection", what_happened: message, suggested_fix: "Check the backend connection and retry.", can_retry: true, safe_request_context: {} },
          }]);
        }
      }
      setResults(Object.fromEntries(completed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (handoffConsumed.current || typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const endpoint = search.get("endpoint");
    if (search.get("from") !== "miso-agent" || !isEndpointId(endpoint)) return;
    handoffConsumed.current = true;
    const transferredControls: Controls = {
      date: search.get("date") || defaultMarketDate(),
      region: ["NORTH", "CENTRAL", "SOUTH", "MISO"].includes(search.get("region") || "") ? search.get("region")! : "NORTH",
      node: search.get("node") || "INDIANA.HUB",
    };
    setDate(transferredControls.date);
    setRegion(transferredControls.region);
    setNode(transferredControls.node);
    setHandoffNotice(`MISO Web Data Agent connected this dashboard with ${ENDPOINTS.find((item) => item.id === endpoint)?.name}. PTD is running the four chart requests in explicit simulation mode.`);
    void executeDashboard(transferredControls, "simulation");
  }, [executeDashboard]);

  const controls = { date, region, node };

  return (
    <main className="min-h-screen bg-[#080B10] text-[#F6F7F9]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080B10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#B8FF36] text-[#080B10]"><BarChart3 className="size-5" /></span>
            <div><p className="text-[15px] font-semibold tracking-[-0.03em]">PTD Infographcs</p><p className="text-[11px] text-white/45">MISO market-chart workspace</p></div>
          </div>
          <button type="button" onClick={() => void refreshConnection()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/70"><span className={`size-1.5 rounded-full ${liveAvailable ? "bg-[#B8FF36]" : "bg-amber-400"}`} />{liveAvailable ? "Live API available" : "Simulation mode"}<RefreshCw className="size-3.5 text-white/40" /></button>
        </div>
      </header>

      <div className="mx-auto max-w-[1580px] px-5 py-6 sm:px-8 sm:py-8">
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(184,255,54,0.15),transparent_28rem),#10151D] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8FF36]">MISO endpoint simulation studio</p>
              <h1 className="mt-4 text-[clamp(2.6rem,6vw,6.25rem)] font-semibold leading-[0.88] tracking-[-0.075em]">Four Feeds,<br /><span className="text-[#B8FF36]">One market view</span></h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/55">PTD is a visualization tool—not a chatbot. It calls the MISO agent backend for each selected endpoint, then turns the returned time series into charts. Simulation responses are always labeled and use the same endpoint paths and MISO parameter names as live requests.</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2 text-[12px] text-white/45 xl:max-w-[310px]">
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#B8FF36]" />Subscription keys stay server-side.</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#B8FF36]" />No conversation or agent controls live here.</div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="rounded-xl bg-white/[0.05] px-4 py-3"><span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">Market date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full bg-transparent text-[14px] text-white outline-none [color-scheme:dark]" /></label>
            <label className="rounded-xl bg-white/[0.05] px-4 py-3"><span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">Region</span><select value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1 w-full bg-transparent text-[14px] text-white outline-none"><option value="NORTH">North</option><option value="CENTRAL">Central</option><option value="SOUTH">South</option><option value="MISO">MISO</option></select></label>
            <label className="rounded-xl bg-white/[0.05] px-4 py-3"><span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">Pricing node</span><select value={node} onChange={(event) => setNode(event.target.value)} className="mt-1 w-full bg-transparent text-[14px] text-white outline-none"><option value="INDIANA.HUB">Indiana Hub</option><option value="MICHIGAN.HUB">Michigan Hub</option><option value="LOUISIANA.HUB">Louisiana Hub</option></select></label>
            <Button type="button" onClick={() => void executeDashboard(controls, mode)} disabled={loading || (mode === "live" && !liveAvailable)} className="h-auto min-h-16 rounded-xl bg-[#B8FF36] px-5 text-[#080B10] hover:bg-[#D0FF78] disabled:bg-white/10 disabled:text-white/35">{loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}{loading ? "Calling endpoints" : mode === "simulation" ? "Run simulations" : "Run live charts"}</Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setMode("simulation")} className={`rounded-full border px-3 py-1.5 text-[11px] ${mode === "simulation" ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-white/10 text-white/40"}`}>Simulation · labeled data</button>
            <button type="button" onClick={() => liveAvailable && setMode("live")} disabled={!liveAvailable} className={`rounded-full border px-3 py-1.5 text-[11px] ${mode === "live" ? "border-[#B8FF36]/35 bg-[#B8FF36]/10 text-[#D7FF8D]" : "border-white/10 text-white/40"} disabled:cursor-not-allowed disabled:opacity-50`}>Live MISO · server key required</button>
            {!liveAvailable && <span className="flex items-center gap-1.5 text-[11px] text-amber-100/65"><CircleAlert className="size-3.5" />Configure <code className="rounded bg-white/10 px-1.5 py-0.5">MISO_SUBSCRIPTION_KEY</code> to enable live requests.</span>}
          </div>
        </section>

        {handoffNotice && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#B8FF36]/25 bg-[#B8FF36]/10 px-4 py-3 text-[12px] leading-relaxed text-[#E4FFB2]"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{handoffNotice}</div>}

        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">Endpoint chart board</p><h2 className="mt-1 text-[24px] font-medium tracking-[-0.045em]">API calls and chart outputs</h2></div><p className="text-[12px] text-white/40">Each card is a separate request; no subscription key is shown in PTD.</p></div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {ENDPOINTS.map((endpoint) => {
              const parameters = endpoint.parameters(controls);
              return <div key={endpoint.id} className="space-y-2">
                <CardChart card={endpoint} result={results[endpoint.id]} />
                <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/35">Chart configuration received from MISO agent</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(parameters).map(([name, value]) => <span key={name} className="rounded-md bg-white/[0.06] px-1.5 py-1 font-mono text-[9.5px] text-white/55">{name}=<span className="text-white/80">{value}</span></span>)}</div>
                </div>
              </div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
