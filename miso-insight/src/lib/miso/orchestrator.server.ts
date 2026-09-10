import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

import { fetchMisoData, findReport, hasLiveMisoCredentials } from "./client.server";
import { logMisoEvent } from "./logger";
import { userFacingApiError } from "./api-errors";
import { countPriorSuccesses, type ConversationTurnContext } from "./conversation";
import { withMisoTimestampNote } from "./dates";
import { legacyReportBySourceId } from "./legacy-reports";
import { resolveMisoQuery, sourceFromResolution } from "./resolver";
import { containsSecret, toApiRequestSpec } from "./request-builder";
import { buildAccessRequest, classifyAccessPolicy } from "./access-policy";
import type {
  ExecutionStep,
  MetricValue,
  MisoResolution,
  MisoResponse,
  MisoSource,
  OutputPlan,
  RequestMetadata,
} from "./types";

function wantsChart(question: string): boolean {
  return /\b(chart|graph|plot|visuali[sz]|trend|comparison)\b/i.test(question);
}

function wantsTechnical(question: string): boolean {
  return (
    /\b(api|endpoint|request|curl|python|javascript|code|parameters?)\b/i.test(question) ||
    /how (did |do )?you (retriev|get|find|fetch|pull)/i.test(question) ||
    /show me how/i.test(question) ||
    /give me the api request/i.test(question)
  );
}

function outputPlan(question: string, source: MisoSource | undefined, intent: string): OutputPlan {
  const chart = wantsChart(question);
  const technical = wantsTechnical(question);
  let mode: OutputPlan["mode"] = "metric";
  if (intent === "explain") mode = "answer";
  else if (source?.type === "report") mode = "report";
  else if (source?.type === "webpage") mode = "answer";
  else if (intent === "api_request" || (technical && !chart)) mode = "api";
  else if (chart) mode = "chart";
  return {
    mode,
    include_api: technical || mode === "api",
    include_chart: chart,
    include_table: false,
    include_download: /\b(csv|download|export)\b/i.test(question),
  };
}

function isDatabaseIntegrationQuestion(question: string): boolean {
  return /\b(database|backend|postgres(?:ql)?|supabase|warehouse|data lake|sql|persist|save|sync|etl|pipeline|integration)\b/i.test(
    question,
  );
}

function contextualGuidance(
  source: MisoSource,
  parameters: Record<string, string>,
  question: string,
): { title: string; explanation: string; showApi: boolean } {
  const when = humanDate(parameters["date"] ?? parameters["report_date"]);
  const dateContext = when ? ` for ${when}` : "";
  const integration = isDatabaseIntegrationQuestion(question);
  const pagination =
    /\b(page|pagination|partial|miss(?:ed|ing)?|all records|complete(?:ness)?|settlement extract)\b/i.test(
      question,
    );
  const reliability =
    /\b(retry|backoff|429|rate limit|timeout|5\d\d|unavailable|failure|fail(?:ed|ure)?)\b/i.test(
      question,
    );
  const time =
    /\b(time\s*zone|dst|daylight|offset|clock change|repeated (?:hour|interval)|timestamp)\b/i.test(
      question,
    );

  if (integration) {
    return {
      title: `${source.name} — backend integration`,
      showApi: true,
      explanation: [
        `Yes. Connect ${source.name}${dateContext} through a server-side job, then write the validated result to your database. Keep the MISO subscription key in server environment variables; never expose it in the browser.`,
        "1. Run the catalog-backed request from your backend on a schedule. The generated examples fetch every available page before returning records.",
        "2. Upsert each record with the source ID, market date, the endpoint's natural row keys, the original payload, and a retrieved-at timestamp. Make that source-and-row-key combination unique so reruns are safe.",
        "3. Preserve MISO's Eastern time basis and any API-provided UTC offset with the stored interval. That keeps repeated fall DST hours distinct in settlement data.",
        "4. Save the page count and request outcome with each run. Treat a successful empty result as no records, and retry only transient failures according to the integration safeguards below.",
      ].join("\n\n"),
    };
  }

  if (pagination) {
    return {
      title: `${source.name} — complete retrieval`,
      showApi: true,
      explanation: [
        `For ${source.name}${dateContext}, treat the result as complete only after MISO marks the final page. Do not use the number of rows in the first response as evidence that all records arrived.`,
        "Keep each page while the job runs, then write records and mark the run complete only after the final-page signal is received. Persist the page count and record count so a settlement rerun can be audited.",
        "The generated integration examples below already loop through pageNumber and stop only at MISO's final-page marker.",
      ].join("\n\n"),
    };
  }

  if (reliability) {
    return {
      title: `${source.name} — reliable ingestion`,
      showApi: true,
      explanation: [
        `For ${source.name}${dateContext}, a 429, timeout, or 5xx response is transient—not a successful empty dataset. Retry that page with exponential backoff and jitter, and honor Retry-After when MISO provides it.`,
        "Do not retry a normal 4xx request until its parameters are corrected. Only commit a run after every page succeeds, which prevents a retry from being mistaken for a complete settlement extract.",
        "The generated examples below follow those rules and keep a successful empty response distinct from an API failure.",
      ].join("\n\n"),
    };
  }

  if (time) {
    return {
      title: `${source.name} — time-safe storage`,
      showApi: true,
      explanation: [
        `Store ${source.name}${dateContext} with MISO's Eastern market-time basis and the API-provided UTC offset whenever a timestamp includes one. Do not derive that offset from the browser or database server.`,
        "When daylight saving time ends, the local clock hour repeats. The offset is what distinguishes those two intervals, so include it in the row's natural key before upserting settlement data.",
        "The API panel keeps this time basis visible beside the integration examples.",
      ].join("\n\n"),
    };
  }

  return {
    title: `${source.name} — follow-up`,
    showApi: false,
    explanation: `I’m keeping the previous ${source.name}${dateContext} request as context. Ask for a different date, an API example, a chart, or how to integrate the result, and I’ll respond to that follow-up rather than rerunning the prior request.`,
  };
}

function humanDate(iso?: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function templateExplanation(
  source: MisoSource,
  parameters: Record<string, string>,
  question: string,
): {
  title: string;
  explanation: string;
} {
  const when = humanDate(parameters["date"] ?? parameters["report_date"]);
  const title = `${source.name}${when ? ` — ${when}` : ""}`;
  if (wantsTechnical(question)) {
    return {
      title,
      explanation: withMisoTimestampNote(
        `Resolved from the trained MISO Data Exchange catalog: “${source.name}”. Parameters were validated against that operation’s metadata before the request was built.`,
      ),
    };
  }
  return {
    title,
    explanation: withMisoTimestampNote(
      `Here is ${source.name.toLowerCase()}${when ? ` for ${when}` : ""} from MISO.`,
    ),
  };
}

async function maybePolishExplanation(
  question: string,
  source: MisoSource,
  fallback: { title: string; explanation: string },
  metrics: MetricValue[],
): Promise<{ title: string; explanation: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallback;
  try {
    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey },
    });
    const result = await generateText({
      model: gateway("google/gemini-3.7-flash"),
      prompt: `You are MISO AI. Write a short title and 2-sentence plain-language answer for a MISO energy user. Only discuss public MISO information represented by the supplied dataset and metrics. Never provide personal information such as a person's salary, compensation, contact details, or personnel records. Never infer or reveal privileged/internal information about how MISO systems are connected. Do not mention API keys, endpoints, or invent numbers that are not listed.

Question: ${question}
Dataset: ${source.name}
Metrics: ${JSON.stringify(metrics)}
Fallback title: ${fallback.title}

Return JSON: {"title":"...","explanation":"..."}`,
    });
    const parsed = JSON.parse(result.text.replace(/```json|```/g, "").trim()) as {
      title?: string;
      explanation?: string;
    };
    return {
      title: parsed.title || fallback.title,
      explanation: parsed.explanation || fallback.explanation,
    };
  } catch {
    return fallback;
  }
}

function summarize(
  source: MisoSource,
  data: { rows: Record<string, string | number>[]; y_key?: string | undefined },
): MetricValue[] {
  const key = data.y_key ?? "value";
  const values = data.rows.map((r) => Number(r[key])).filter((n) => Number.isFinite(n));
  if (!values.length) return [];
  const peak = Math.max(...values);
  const low = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const unit = source.unit ?? "";
  const fmt = (n: number) =>
    unit === "$/MWh" ? `$${n.toFixed(2)}` : `${Math.round(n).toLocaleString()} ${unit}`;
  return [
    { label: "Peak", value: fmt(peak) },
    { label: "Average", value: fmt(avg) },
    { label: "Minimum", value: fmt(low) },
  ];
}

const NUDGE_THRESHOLD = 2; // nudge on the 3rd time a source is asked about (2 prior successes)

function apiNudge(
  source: MisoSource,
  history: string[],
  alreadyApiOutput: boolean,
): MisoResponse["api_nudge"] | undefined {
  if (!source.supports_api_generation || alreadyApiOutput) return undefined;
  const priorSuccesses = countPriorSuccesses(history, source.source_id);
  if (priorSuccesses < NUDGE_THRESHOLD) return undefined;
  return {
    message: `You've asked about ${source.name} ${priorSuccesses + 1} times now. You can pull this yourself anytime with MISO's Data Exchange API instead of asking here each time.`,
    cta_label: "Show me the API",
    ask: `Give me the API for ${source.name}`,
  };
}

function legacyReportNudge(source: MisoSource): MisoResponse["api_nudge"] | undefined {
  const legacy = legacyReportBySourceId(source.source_id);
  if (!legacy?.api_replacement) return undefined;
  return {
    message: `This is a legacy MISO report reference. For repeatable retrieval, use the ${legacy.api_replacement.name} Data Exchange API: it returns structured data on demand and avoids manual report handling.`,
    cta_label: "Show API replacement",
    ask: `Give me the API for ${legacy.api_replacement.name}`,
  };
}

function sourcePayload(source: MisoSource | undefined): MisoResponse["source"] {
  if (!source) return null;
  return {
    id: source.source_id,
    name: source.name,
    type: source.type,
    description: source.description,
  };
}

function requestMetadata(
  source: MisoSource,
  parameters: Record<string, string>,
  validation: RequestMetadata["validation"]["status"],
  executionStatus: string,
): RequestMetadata {
  return {
    source: "MISO",
    dataset: source.name,
    endpoint: source.endpoint ?? "",
    method: source.method ?? "GET",
    parameters,
    validation: { status: validation },
    execution: { status: executionStatus, timestamp: new Date().toISOString() },
  };
}

function assertNoSecrets(payload: unknown): void {
  const key = process.env["MISO_SUBSCRIPTION_KEY"];
  if (key && containsSecret(payload, key)) {
    throw new Error("Refusing to return a response that contains the MISO subscription key.");
  }
}

export async function runMisoRequest(
  question: string,
  history: string[],
  now: Date = new Date(),
  memory?: {
    lastTurn?: ConversationTurnContext;
    lastSuccess?: ConversationTurnContext;
    parameterOverrides?: Record<string, string>;
  },
): Promise<MisoResponse> {
  const startedAt = Date.now();
  const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
  const steps: ExecutionStep[] = [];

  const accessPolicy = classifyAccessPolicy(question);
  if (accessPolicy.category !== "public") {
    steps.push({ label: "Access policy checked", detail: accessPolicy.category, status: accessPolicy.category === "personal" ? "error" : "skipped" });
    const accessRequest = accessPolicy.category === "personal" ? undefined : buildAccessRequest(question, accessPolicy);
    const explanation = accessPolicy.category === "personal"
      ? "I can’t provide personal or personnel information, including a person’s salary, compensation, or private records."
      : accessPolicy.category === "business"
        ? "I can provide MISO data and explain what it shows, but I can’t provide business insights or make a business decision for you. Please contact MISO at support@askmiso.com for authorized assistance."
      : accessPolicy.category === "internal"
        ? "I can’t retrieve privileged internal information about MISO systems or how they are connected. Please contact MISO’s help desk for authorization and assistance."
        : "That information is not publicly accessible through this assistant. Log into the MISO portal and go to the DART database MISO or PI MISO. If you still need access, use the generated request below so MISO can confirm authorization and an access timeline.";
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "clarify", confidence: 1, summary: question.trim() },
      source: null,
      parameters: {},
      execution: { status: accessPolicy.category === "personal" ? "error" : "needs_auth", steps, duration_ms: Date.now() - startedAt },
      output: { mode: "answer", include_api: false, include_chart: false, include_table: false, include_download: false },
      title: accessPolicy.category === "personal" ? "Personal information request" : accessPolicy.category === "business" ? "Business decision support unavailable" : accessPolicy.category === "internal" ? "Internal access required" : "MISO portal access required",
      answer: explanation,
      explanation,
      ...(accessRequest ? { access_request: accessRequest } : {}),
    };
    assertNoSecrets(response);
    return response;
  }


  let resolution: MisoResolution;
  try {
    resolution = resolveMisoQuery(question, {
      history,
      now,
      ...(memory?.lastTurn ? { lastTurn: memory.lastTurn } : {}),
      ...(memory?.lastSuccess ? { lastSuccess: memory.lastSuccess } : {}),
      ...(memory?.parameterOverrides ? { parameterOverrides: memory.parameterOverrides } : {}),
    });
    steps.push({
      label: "Request understood",
      detail: resolution.intent,
      status: "success",
    });
  } catch (err) {
    logMisoEvent("miso.resolve_failed", {
      request_id: requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      request_id: requestId,
      intent: { type: "clarify", confidence: 0, summary: question.trim() },
      source: null,
      parameters: {},
      execution: { status: "error", steps, duration_ms: Date.now() - startedAt },
      output: {
        mode: "answer",
        include_api: false,
        include_chart: false,
        include_table: false,
        include_download: false,
      },
      answer: "",
      explanation: "",
      error: {
        message: "MISO catalog lookup failed.",
        reason: "The trained MISO API metadata could not be read for this request.",
        technical: err instanceof Error ? err.message : String(err),
        fixable: false,
        missing_parameters: [],
      },
    };
  }

  const source = sourceFromResolution(resolution);
  const output = outputPlan(question, source, resolution.intent);
  const parameters = resolution.parameters;
  const duration = () => Date.now() - startedAt;

  logMisoEvent("miso.resolved", {
    request_id: requestId,
    intent: resolution.intent,
    dataset: resolution.dataset,
    parameters,
    validation: resolution.validation.status,
    endpoint: resolution.api,
  });

  if (resolution.status === "ambiguous") {
    const options = (resolution.options ?? [])
      .map((opt, i) => `${i + 1}. ${opt.dataset} — ${opt.description.slice(0, 140)}`)
      .join("\n");
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "clarify", confidence: 0.45, summary: question.trim() },
      source: null,
      parameters: {},
      execution: { status: "needs_clarification", steps, duration_ms: duration() },
      output: { ...output, mode: "clarify", include_chart: false },
      title: "Which dataset?",
      answer: "",
      explanation: "",
      clarification: `${resolution.reason ?? "A few MISO datasets could match that request."}\n\n${options}\n\nReply with a number or the dataset name.`,
      resolution,
    };
    assertNoSecrets(response);
    return response;
  }

  if (resolution.status === "needs_clarification") {
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "clarify", confidence: 0.4, summary: question.trim() },
      source: sourcePayload(source),
      parameters,
      execution: { status: "needs_clarification", steps, duration_ms: duration() },
      output: { ...output, mode: "clarify", include_chart: false },
      title: "Need a bit more detail",
      answer: "",
      explanation: "",
      clarification:
        resolution.reason ??
        "Which MISO data do you need? For example: actual load, day-ahead cleared demand, real-time LMP, or fuel mix.",
      resolution,
    };
    assertNoSecrets(response);
    return response;
  }

  if (!source) {
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "clarify", confidence: 0.4, summary: question.trim() },
      source: null,
      parameters: {},
      execution: { status: "needs_clarification", steps, duration_ms: duration() },
      output: {
        mode: "clarify",
        include_api: false,
        include_chart: false,
        include_table: false,
        include_download: false,
      },
      answer: "",
      explanation: "",
      clarification:
        "Which MISO data do you need? For example: actual load, prices, fuel mix, interchange, or a market report.",
      resolution,
    };
    assertNoSecrets(response);
    return response;
  }

  steps.push({
    label: "Source selected",
    detail: `MISO ${source.name} (${source.type})`,
    status: "success",
  });

  if (resolution.status === "needs_parameters") {
    const missing = resolution.missing_parameters;
    steps.push({
      label: "Parameter validation",
      detail: `Missing: ${missing.map((m) => m.name).join(", ")}`,
      status: "error",
    });
    const first = missing[0];
    const known = Object.entries(parameters)
      .filter(([k]) => k === "date" || k === "region" || k === "node" || k === "timeResolution")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const response: MisoResponse = {
      request_id: requestId,
      intent: {
        type: resolution.intent as MisoResponse["intent"]["type"],
        confidence: 0.8,
        summary: question.trim(),
      },
      source: sourcePayload(source),
      parameters,
      execution: { status: "needs_clarification", steps, duration_ms: duration() },
      output: { ...output, mode: "clarify", include_chart: false },
      title: source.name,
      answer: "",
      explanation: "",
      clarification: [
        `I can get ${source.name} from MISO.`,
        known ? `I already have ${known}.` : null,
        first?.question ?? "I need one more parameter before I can call MISO.",
        missing.length > 1
          ? `After that I may also need: ${missing
              .slice(1)
              .map((m) => m.name)
              .join(", ")}.`
          : null,
      ]
        .filter(Boolean)
        .join(" "),
      resolution,
      request_metadata: requestMetadata(source, parameters, "failed", "needs_parameters"),
    };
    assertNoSecrets(response);
    return response;
  }

  if (resolution.status === "validation_error") {
    const errors = resolution.validation.errors ?? [];
    steps.push({
      label: "Parameter validation",
      detail: errors.map((e) => e.message).join(" · ") || "Invalid parameters",
      status: "error",
    });
    const first = errors[0];
    const response: MisoResponse = {
      request_id: requestId,
      intent: {
        type: resolution.intent as MisoResponse["intent"]["type"],
        confidence: 0.8,
        summary: question.trim(),
      },
      source: sourcePayload(source),
      parameters,
      execution: { status: "error", steps, duration_ms: duration() },
      output,
      title: source.name,
      answer: "",
      explanation: "",
      error: {
        message: first?.message ?? "Invalid MISO parameter.",
        reason: first
          ? `${first.parameter} value “${first.provided}” is not valid${first.expected?.length ? `; expected ${first.expected.join(", ")}` : ""}.`
          : "One or more parameters failed catalog validation.",
        technical: JSON.stringify(errors),
        fixable: true,
        missing_parameters: [],
      },
      resolution,
      request_metadata: requestMetadata(source, parameters, "failed", "REQUEST_VALIDATION_FAILED"),
    };
    assertNoSecrets(response);
    return response;
  }

  steps.push({
    label: "Parameters validated",
    detail:
      Object.entries(parameters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ") || "No parameters required",
    status: "success",
  });

  steps.push({
    label: "Authentication",
    detail: source.requires_authentication
      ? hasLiveMisoCredentials()
        ? "MISO access authorized"
        : "MISO access authorized (simulated data source)"
      : "Not required for this source",
    status: source.requires_authentication ? "success" : "skipped",
  });

  const api = source.supports_api_generation ? toApiRequestSpec(source, parameters) : undefined;
  const prose = templateExplanation(source, parameters, question);

  if (resolution.intent === "explain") {
    const guidance = contextualGuidance(source, parameters, question);
    steps.push({
      label: "Contextual guidance generated",
      detail: `Follow-up for ${source.name}; no MISO data request was rerun`,
      status: "success",
    });
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "explain", confidence: 0.9, summary: question.trim() },
      source: sourcePayload(source),
      parameters,
      execution: { status: "success", steps, duration_ms: duration() },
      output: {
        ...output,
        mode: "answer",
        include_api: guidance.showApi && Boolean(api),
        include_chart: false,
        include_table: false,
        include_download: false,
      },
      title: guidance.title,
      answer: guidance.explanation,
      explanation: guidance.explanation,
      ...(api && guidance.showApi ? { api } : {}),
      resolution: {
        ...resolution,
        status: "success",
        pipeline: resolution.pipeline.map((node) =>
          node.id === "response" ? { ...node, status: "completed" as const } : node,
        ),
      },
      request_metadata: requestMetadata(source, parameters, "passed", "FOLLOW_UP_GUIDANCE"),
    };
    assertNoSecrets(response);
    return response;
  }

  if ((resolution.intent === "api_request" || output.mode === "api") && !wantsChart(question)) {
    steps.push({
      label: "API request generated",
      detail: "Not executed — you asked for the request only",
      status: "skipped",
    });
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "api_request", confidence: 0.9, summary: question.trim() },
      source: sourcePayload(source),
      parameters,
      execution: { status: "success", steps, duration_ms: duration() },
      output: { ...output, mode: "api", include_api: true, include_chart: false },
      title: prose.title,
      answer: `Here is the MISO ${source.name} API request.`,
      explanation: prose.explanation,
      ...(api ? { api } : {}),
      resolution: {
        ...resolution,
        status: "resolved",
        pipeline: resolution.pipeline.map((n) =>
          n.id === "response" ? { ...n, status: "pending" as const } : n,
        ),
      },
      request_metadata: requestMetadata(source, parameters, "passed", "REQUEST_RESOLVED"),
    };
    logMisoEvent("miso.request_built", {
      request_id: requestId,
      dataset: source.name,
      endpoint: resolution.request?.endpoint,
      duration_ms: duration(),
    });
    assertNoSecrets(response);
    return response;
  }

  if (source.type !== "api") {
    const report = findReport(source, parameters);
    steps.push({ label: "MISO source retrieved", detail: report.title, status: "success" });
    steps.push({ label: "Result generated", detail: "Report located", status: "success" });
    const response: MisoResponse = {
      request_id: requestId,
      intent: { type: "find_report", confidence: 0.85, summary: question.trim() },
      source: sourcePayload(source),
      parameters,
      execution: { status: "success", steps, duration_ms: duration() },
      output: { ...output, mode: "report", include_chart: false },
      title: prose.title,
      answer: report.title,
      explanation: prose.explanation,
      report,
      resolution: { ...resolution, status: "success" },
      request_metadata: requestMetadata(source, parameters, "passed", "REQUEST_EXECUTED"),
    };
    const reportNudge = legacyReportNudge(source) ?? apiNudge(source, history, false);
    if (reportNudge) response.api_nudge = reportNudge;
    assertNoSecrets(response);
    return response;
  }

  try {
    const { data, live, pagination } = await fetchMisoData(source, parameters);
    steps.push({
      label: "MISO request executed",
      detail: live
        ? `${source.method ?? "GET"} ${source.endpoint}`
        : "Request executed against MISO data source",
      status: "success",
    });
    steps.push({
      label: "Response validated",
      detail: `${data.rows.length} record${data.rows.length === 1 ? "" : "s"} received`,
      status: "success",
    });
    const metrics = summarize(source, data);
    const copy = await maybePolishExplanation(question, source, prose, metrics);
    const baseExplanation = withMisoTimestampNote(copy.explanation);
    const paginationExplanation =
      pagination && pagination.pages_fetched > 1
        ? ` MISO split this result across ${pagination.pages_fetched} pages; every page was retrieved.`
        : "";
    if (api?.pagination && pagination) {
      api.pagination = {
        ...api.pagination,
        ...(pagination.total_pages != null ? { total_pages: pagination.total_pages } : {}),
        ...(pagination.page_size != null ? { page_size: pagination.page_size } : {}),
      };
    }
    steps.push({
      label: "Result generated",
      detail: `Presented as ${output.mode}`,
      status: "success",
    });

    const response: MisoResponse = {
      request_id: requestId,
      intent: {
        type: resolution.intent as MisoResponse["intent"]["type"],
        confidence: 0.9,
        summary: question.trim(),
      },
      source: sourcePayload(source),
      parameters,
      execution: { status: "success", steps, duration_ms: duration() },
      output,
      title: copy.title,
      answer: metrics.length ? `${metrics[0]!.label} ${metrics[0]!.value}` : copy.explanation,
      explanation: `${baseExplanation}${paginationExplanation}`,
      metrics,
      data,
      ...(api && (output.include_api || output.mode === "api") ? { api } : {}),
      resolution: {
        ...resolution,
        status: "success",
        pipeline: resolution.pipeline.map((n) =>
          n.id === "response" ? { ...n, status: "completed" as const } : n,
        ),
      },
      request_metadata: requestMetadata(source, parameters, "passed", "REQUEST_EXECUTED"),
    };
    const dataNudge = apiNudge(source, history, output.mode === "api");
    if (dataNudge) response.api_nudge = dataNudge;
    logMisoEvent("miso.executed", {
      request_id: requestId,
      dataset: source.name,
      endpoint: resolution.request?.endpoint,
      duration_ms: duration(),
      http_status: 200,
      result_count: data.rows.length,
      live,
    });
    assertNoSecrets(response);
    return response;
  } catch (err) {
    const apiErr = userFacingApiError(err);
    steps.push({ label: "MISO request executed", detail: apiErr.message, status: "error" });
    const empty = apiErr.type === "empty";
    const response: MisoResponse = {
      request_id: requestId,
      intent: {
        type: resolution.intent as MisoResponse["intent"]["type"],
        confidence: 0.85,
        summary: question.trim(),
      },
      source: sourcePayload(source),
      parameters,
      execution: { status: "error", steps, duration_ms: duration() },
      output,
      title: prose.title,
      answer: "",
      explanation: prose.explanation,
      error: {
        message: apiErr.message,
        reason: empty
          ? `MISO returned no records for ${source.name}${parameters["date"] ? ` on ${parameters["date"]}` : ""}.`
          : apiErr.message,
        technical: err instanceof Error ? err.message : String(err),
        fixable: false,
        missing_parameters: [],
      },
      resolution: {
        ...resolution,
        status: empty ? "no_data" : "api_error",
        pipeline: resolution.pipeline.map((n) =>
          n.id === "response" ? { ...n, status: "invalid" as const } : n,
        ),
      },
      request_metadata: requestMetadata(
        source,
        parameters,
        "passed",
        empty ? "NO_DATA" : "REQUEST_FAILED",
      ),
    };
    logMisoEvent("miso.execute_failed", {
      request_id: requestId,
      dataset: source.name,
      endpoint: resolution.request?.endpoint,
      duration_ms: duration(),
      error_type: apiErr.type,
    });
    assertNoSecrets(response);
    return response;
  }
}

export { toApiRequestSpec as buildApiSpec };
export { resolveMisoQuery } from "./resolver";
