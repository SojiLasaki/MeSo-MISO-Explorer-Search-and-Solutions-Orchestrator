export type LocalBackendMode = "simulation" | "public" | "live";

/**
 * Production points to the deployed Web Data Agent. The loopback fallback is
 * only for this development workspace; it is not the Local Integration Agent.
 */
const baseUrl =
  (import.meta.env.VITE_MISO_WEB_AGENT_URL as string | undefined) ??
  (import.meta.env.VITE_MISO_BACKEND_URL as string | undefined) ??
  "http://127.0.0.1:8000/api";

export function localAgentDownloadUrl() {
  return `${baseUrl}/local-agent/download/`;
}

export async function localApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = (await response.json()) as T & { detail?: string };
  if (!response.ok) throw new Error(payload.detail ?? `Local backend request failed (${response.status}).`);
  return payload;
}

export interface AgentEvent {
  stage: string;
  status: "success" | "warning" | "error";
  message: string;
}

export interface AgentResult {
  session_id?: string;
  status: "success" | "needs_input" | "validation_error" | "error" | "ignored";
  message: string;
  sources?: Array<{ title: string; url?: string; page?: number; document?: string; request_json?: { method: string; url: string; params: Record<string, string> } }>;
  endpoint?: { id: string; name: string; unit: string; parameters: Array<{ name: string; label: string; required: boolean; options: string[] }> };
  parameters?: Record<string, string>;
  missing_parameters?: Array<{ name: string; label: string; question: string }>;
  request?: { method: string; url: string; endpoint: string; params: Record<string, string>; headers: Record<string, string> };
  events: AgentEvent[];
  summary?: { peak: number; average: number; minimum: number; records: number };
  data?: { data?: Array<Record<string, string | number>>; simulated?: boolean };
  simulated?: boolean;
  api_only?: boolean;
  integration_guidance?: boolean;
  chart_requested?: boolean;
  delivery?: { target: "web_data_agent" | "local_integration_agent"; reason: string; requires_local_agent: boolean };
  report?: { title: string; url: string; description: string; api_replacement?: string | null };
  handoff?: { id: string; status: "queued" | "received" | "completed" | "failed"; agent_id: string; instruction: string };
  access_request?: { status: "draft" | "sent"; recipient: string; subject: string; body: string; timeline: string };
  verification?: { tested: boolean; status_code: number | null; source: string; authentication: string };
  error?: { status_code: number; category: string; what_happened: string; suggested_fix: string; can_retry: boolean; safe_request_context: { method?: string; url?: string } };
}

export interface ConnectionState {
  ok: boolean;
  service: string;
  miso_mode: "live" | "public" | "simulation";
}

export interface KeyState {
  configured: boolean;
  reference: string | null;
  portal_url: string;
  message: string;
}
