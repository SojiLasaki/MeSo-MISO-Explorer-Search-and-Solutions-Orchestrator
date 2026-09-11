import { fillCatalogParams, normalizeNode, normalizeRegion } from "./catalog";
import { conversationMemory, isNewTopic, type ConversationTurnContext } from "./conversation";
import { extractMisoDate } from "./dates";
import { legacyReportBySourceId } from "./legacy-reports";
import { normalizeSource } from "./metadata";
import { getSource, isAmbiguousRanking, MISO_SOURCES, rankSources } from "./registry";
import { buildMisoRequest } from "./request-builder";
import type {
  MisoResolution,
  MisoSource,
  ParameterDetail,
  PipelineNode,
  PipelineNodeStatus,
  ResolutionStatus,
} from "./types";
import { questionForParameter, validateCatalogParameters } from "./validation";

const GENERIC_POWER = /\bpower results\b|\bgeneration results\b|\bpower data\b/;
const DATASET_CUES =
  /\b(load|lmp|demand|generation|fuel|interchange|forecast|price|prices|report|pnode|mcp|outage)\b/;
const LEGACY_REPORT_CUES =
  /\b(?:old(?:er)?|legacy|archiv(?:e|ed)|retired)\b[\s\w-]{0,48}\b(?:report|reports|file|files)\b|\breader'?s guide\b|\breport[- ]to[- ]endpoint\b|\breport mapping\b/i;

const HUBS: Array<{ re: RegExp; raw: string }> = [
  { re: /\bindiana\b/, raw: "indiana" },
  { re: /\bmichigan\b/, raw: "michigan" },
  { re: /\blouisiana\b/, raw: "louisiana" },
];

export interface ResolveOptions {
  now?: Date;
  history?: string[];
  llmSourceId?: string;
  /** Applied after NL extraction, then validated against catalog metadata. */
  parameterOverrides?: Record<string, string>;
  lastTurn?: ConversationTurnContext;
  lastSuccess?: ConversationTurnContext;
}

function lastUserQuestions(history: string[]): string[] {
  return history
    .filter((line) => line.toLowerCase().startsWith("user:"))
    .map((line) => line.replace(/^user:\s*/i, ""));
}

function isApiFollowUp(question: string): boolean {
  const q = question.toLowerCase();
  if (/\b(api|endpoint|curl)\b/.test(q)) return true;
  if (/give me the api request/.test(q)) return true;
  if (/how (did |do )?you (retriev|get|find|fetch|pull)/.test(q)) return true;
  if (/\b(this|that|the) (request|endpoint|call)\b/.test(q)) return true;
  return false;
}

/** Questions about persisting, scheduling, or wiring the last result into an
 * application are explanations, not another request for the underlying data. */
function isIntegrationFollowUp(question: string): boolean {
  return /\b(database|backend|postgres(?:ql)?|supabase|warehouse|data lake|sql|persist|save|sync|etl|pipeline|integration)\b/i.test(
    question,
  );
}

function isExplanationQuestion(question: string): boolean {
  return (
    isIntegrationFollowUp(question) ||
    /^(?:why|how|explain|can you explain|what (?:happens|keeps|should|does|is the))\b/i.test(
      question.trim(),
    )
  );
}

/** Handle a few common human-to-human prompts without accidentally re-running
 * the last MISO query. The response is intentionally warm but keeps the app's
 * purpose clear. */
function casualConversationReply(question: string): string | undefined {
  const q = question.trim().toLowerCase();
  if (/\bdo you love me\b/.test(q)) {
    return "I don't experience love, but I'm here to help you make sense of MISO data and build reliable energy-data workflows.";
  }
  if (/\bhow are you\b/.test(q)) {
    return "I'm ready to help with MISO data, market APIs, reports, or your integration workflow.";
  }
  if (/\bwho are you\b/.test(q)) {
    return "I'm MISO AI, a guide for finding MISO data and turning it into reliable integrations.";
  }
  return undefined;
}

function refersToPrevious(question: string): boolean {
  return /\b(this|that|it|same one|the same|for this|for that)\b/i.test(question);
}

function detectIntent(
  question: string,
  lastCtx?: ConversationTurnContext,
): { type: "retrieve_data" | "api_request" | "find_report" | "explain"; confidence: number } {
  const q = question.toLowerCase();
  if (
    (/\b(report|workbook|pdf|imm)\b/.test(q) || LEGACY_REPORT_CUES.test(q)) &&
    !/\bapi\b/.test(q)
  ) {
    return { type: "find_report", confidence: 0.8 };
  }
  if (isApiFollowUp(question)) {
    return { type: "api_request", confidence: 0.9 };
  }
  if (isExplanationQuestion(question)) {
    return { type: "explain", confidence: 0.88 };
  }
  if (lastCtx?.intent === "api_request" && lastCtx.status === "needs_clarification") {
    return { type: "api_request", confidence: 0.86 };
  }
  return { type: "retrieve_data", confidence: 0.85 };
}

function wantsLegacyReport(question: string): boolean {
  return LEGACY_REPORT_CUES.test(question);
}

function extractTimeResolution(question: string, source: MisoSource): string | undefined {
  const spec = (source.parameters ?? []).find((p) => p.name === "timeResolution");
  if (!spec?.options?.length) return undefined;
  const q = question.toLowerCase();
  if (/\bhourly\b/.test(q) && spec.options.includes("hourly")) return "hourly";
  if (/\bdaily\b/.test(q) && spec.options.includes("daily")) return "daily";
  return undefined;
}

function extractInterval(question: string, source: MisoSource): string | undefined {
  const spec = (source.parameters ?? []).find((p) => p.name === "interval");
  if (!spec) return undefined;
  const hour = question.match(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\b/);
  if (/\bhourly\b/.test(question.toLowerCase()) && !hour) return undefined;
  if (hour && /interval|at \d|hour \d|:/.test(question.toLowerCase())) {
    const h = hour[1]!.padStart(2, "0");
    return hour[2] ? `${h}:${hour[2]}` : hour[1];
  }
  return undefined;
}

interface Extracted {
  values: Record<string, string>;
  details: ParameterDetail[];
}

function extractFromText(
  question: string,
  source: MisoSource,
  now: Date,
  origin: ParameterDetail["source"],
): Extracted {
  const values: Record<string, string> = {};
  const details: ParameterDetail[] = [];
  const allowed = new Set((source.parameters ?? []).map((p) => p.name));

  const dated = extractMisoDate(question, now);
  if (dated && allowed.has("date")) {
    values["date"] = dated.value;
    details.push({
      name: "date",
      value: dated.value,
      source: origin,
      confidence: dated.confidence,
      required: true,
      status: "valid",
      error: null,
    });
  }
  if (dated && allowed.has("report_date") && !allowed.has("date")) {
    values["report_date"] = dated.value;
    details.push({
      name: "report_date",
      value: dated.value,
      source: origin,
      confidence: dated.confidence,
      required: false,
      status: "valid",
      error: null,
    });
  }

  const regionSpec = (source.parameters ?? []).find((p) => p.name === "region");
  const regionWords = question.match(/\b(north|central|south|miso)\b/i);
  if (regionWords && allowed.has("region")) {
    const region = normalizeRegion(regionWords[1]);
    if (region && (!regionSpec?.options || regionSpec.options.includes(region))) {
      values["region"] = region;
      details.push({
        name: "region",
        value: region,
        source: origin,
        confidence: 0.95,
        required: false,
        status: "valid",
        error: null,
      });
    }
  }

  if (allowed.has("node")) {
    for (const hub of HUBS) {
      if (hub.re.test(question.toLowerCase())) {
        const node = normalizeNode(hub.raw, source);
        if (node) {
          values["node"] = node;
          details.push({
            name: "node",
            value: node,
            source: origin,
            confidence: 0.96,
            required: false,
            status: "valid",
            error: null,
          });
        }
        break;
      }
    }
  }

  const timeResolution = extractTimeResolution(question, source);
  if (timeResolution) {
    values["timeResolution"] = timeResolution;
    details.push({
      name: "timeResolution",
      value: timeResolution,
      source: origin,
      confidence: 0.93,
      required: false,
      status: "valid",
      error: null,
    });
  }

  const interval = extractInterval(question, source);
  if (interval) {
    values["interval"] = interval;
    details.push({
      name: "interval",
      value: interval,
      source: origin,
      confidence: 0.8,
      required: false,
      status: "valid",
      error: null,
    });
  }

  if (/\blrz\s*(\d+)\b/i.test(question) && allowed.has("localResourceZone")) {
    const lrz = question.match(/\blrz\s*(\d+)\b/i)?.[1];
    if (lrz) {
      values["localResourceZone"] = lrz;
      if (allowed.has("geoResolution")) values["geoResolution"] = "localResourceZone";
      details.push({
        name: "localResourceZone",
        value: lrz,
        source: origin,
        confidence: 0.92,
        required: false,
        status: "valid",
        error: null,
      });
    }
  }

  return { values, details };
}

function mergeExtracted(base: Extracted, extra: Extracted): Extracted {
  const values = { ...extra.values, ...base.values };
  const seen = new Set(base.details.map((d) => d.name));
  const details = [...base.details, ...extra.details.filter((d) => !seen.has(d.name))];
  return { values, details };
}

function isParamFollowUp(question: string, rankedScore: number, now: Date): boolean {
  const q = question.toLowerCase();
  const hasDate = Boolean(extractMisoDate(q, now));
  const hasGeo = HUBS.some((h) => h.re.test(q)) || /\b(north|central|south)\b/.test(q);
  const hasDataset = DATASET_CUES.test(q) && rankedScore >= 5;
  return (hasDate || hasGeo) && !hasDataset;
}

function isBareAnswer(question: string, now: Date): boolean {
  const q = question.trim();
  if (q.length > 80) return false;
  if (/^(option\s*)?#?\d{1,2}$/i.test(q)) return true;
  if (extractMisoDate(q, now) && !DATASET_CUES.test(q.toLowerCase())) return true;
  if (HUBS.some((h) => h.re.test(q.toLowerCase())) && q.split(/\s+/).length <= 4) return true;
  return false;
}

function pickAmbiguousOption(
  message: string,
  options: { dataset: string; source_id: string }[],
): MisoSource | undefined {
  const q = message.trim().toLowerCase();
  const numbered = q.match(/^(?:option\s*)?#?(\d{1,2})$/);
  if (numbered) {
    const opt = options[Number(numbered[1]) - 1];
    return opt ? getSource(opt.source_id) : undefined;
  }
  const named = options.find(
    (opt) => q === opt.dataset.toLowerCase() || q.includes(opt.dataset.toLowerCase()),
  );
  return named ? getSource(named.source_id) : undefined;
}

function namesDifferentDataset(message: string, prior: MisoSource | undefined): boolean {
  const best = rankSources(message)[0];
  if (!best || best.score < 5) return false;
  if (!prior) return true;
  return best.source.source_id !== prior.source_id;
}

function shouldInheritSource(
  message: string,
  rankedScore: number,
  now: Date,
  lastStatus: string | undefined,
  prior: MisoSource | undefined,
): boolean {
  if (isNewTopic(message)) return false;
  if (
    namesDifferentDataset(message, prior) &&
    !isApiFollowUp(message) &&
    !refersToPrevious(message)
  ) {
    return false;
  }
  if (isParamFollowUp(message, rankedScore, now)) return true;
  if (isApiFollowUp(message) || refersToPrevious(message)) return true;
  if (isBareAnswer(message, now)) {
    return (
      lastStatus === "needs_parameters" ||
      lastStatus === "ambiguous" ||
      lastStatus === "resolved" ||
      lastStatus === "success" ||
      lastStatus === "needs_clarification"
    );
  }
  return Boolean(prior) && rankedScore < 5;
}

function genericPowerOptions(): { dataset: string; description: string; source_id: string }[] {
  const ids = [
    "get-v1-real-time-date-demand-actual",
    "get-v1-real-time-date-generation-fuel-type",
    "get-v1-real-time-date-generation-cleared",
    "get-v1-day-ahead-date-generation-cleared-physical",
    "get-v1-day-ahead-date-generation-fuel-type",
  ];
  return ids
    .map((id) => getSource(id))
    .filter((s): s is MisoSource => Boolean(s))
    .map((s) => ({ dataset: s.name, description: s.description, source_id: s.source_id }));
}

function isGenericPowerQuery(question: string): boolean {
  const q = question.toLowerCase();
  if (!GENERIC_POWER.test(q)) return false;
  return !/\b(fuel|physical|virtual|lmp|load|forecast|cleared demand)\b/.test(q);
}

function inheritSource(history: string[]): MisoSource | null {
  for (const prior of [...lastUserQuestions(history)].reverse()) {
    if (isGenericPowerQuery(prior)) continue;
    const ranked = rankSources(prior).filter(
      (row) => row.source.type === "api" || row.source.type === "report",
    );
    const best = ranked[0];
    if (best && best.score >= 5 && !isAmbiguousRanking(ranked) && !isGenericPowerQuery(prior)) {
      return best.source;
    }
  }
  return null;
}

function pipeline(args: {
  intent: string;
  dataset?: string;
  endpoint?: string;
  paramsOk: PipelineNodeStatus;
  validation: PipelineNodeStatus;
  request: PipelineNodeStatus;
  response: PipelineNodeStatus;
  paramDetail?: string;
}): PipelineNode[] {
  return [
    { id: "user_request", title: "USER REQUEST", status: "valid" },
    { id: "intent", title: "INTENT", status: "valid", detail: args.intent },
    {
      id: "dataset",
      title: "MISO DATASET",
      status: args.dataset ? "valid" : "unresolved",
      ...(args.dataset ? { detail: args.dataset } : {}),
    },
    {
      id: "endpoint",
      title: "API ENDPOINT",
      status: args.endpoint ? "valid" : "unresolved",
      ...(args.endpoint ? { detail: args.endpoint } : {}),
    },
    {
      id: "parameters",
      title: "PARAMETERS",
      status: args.paramsOk,
      ...(args.paramDetail ? { detail: args.paramDetail } : {}),
    },
    { id: "validation", title: "VALIDATION", status: args.validation },
    { id: "request", title: "REQUEST", status: args.request },
    { id: "response", title: "MISO RESPONSE", status: args.response },
  ];
}

function withEndpoint(source: MisoSource): { dataset: string; endpoint?: string } {
  return source.endpoint
    ? { dataset: source.name, endpoint: source.endpoint }
    : { dataset: source.name };
}

function sourceRef(source: MisoSource): Pick<MisoResolution, "dataset" | "api" | "source_id"> {
  return {
    dataset: source.name,
    api: source.endpoint ?? source.source_id,
    source_id: source.source_id,
  };
}

export function resolveMisoQuery(message: string, options: ResolveOptions = {}): MisoResolution {
  const now = options.now ?? new Date();
  const history = options.history ?? [];
  const memory = conversationMemory(history, options.lastTurn, options.lastSuccess);
  const ctx = memory.lastCtx;
  const success = memory.lastSuccess;
  const intent = detectIntent(message, ctx);
  const ranked = rankSources(message);
  const legacyReport = wantsLegacyReport(message)
    ? ranked.find((row) => Boolean(legacyReportBySourceId(row.source.source_id)))
    : undefined;
  const priorSource =
    (success?.source_id ? getSource(success.source_id) : undefined) ??
    inheritSource(history) ??
    (ctx?.source_id ? getSource(ctx.source_id) : undefined);
  const picked =
    ctx?.status === "ambiguous" && ctx.options?.length
      ? pickAmbiguousOption(message, ctx.options)
      : undefined;

  const casualReply = casualConversationReply(message);
  if (casualReply) {
    return {
      status: "needs_clarification",
      intent: "clarify",
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      reason: casualReply,
      pipeline: pipeline({
        intent: "clarify",
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  if (isNewTopic(message)) {
    return {
      status: "needs_clarification",
      intent: "retrieve_data",
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      reason:
        "Which MISO data do you need? For example: actual load, day-ahead cleared demand, real-time LMP, or fuel mix.",
      pipeline: pipeline({
        intent: "retrieve_data",
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  if (isGenericPowerQuery(message) && !priorSource && !picked) {
    const optionsList = genericPowerOptions();
    return {
      status: "ambiguous",
      intent: intent.type,
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      options: optionsList,
      reason: "Multiple MISO datasets could satisfy this request.",
      pipeline: pipeline({
        intent: intent.type,
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  let source: MisoSource | undefined = picked;
  const inherit = shouldInheritSource(
    message,
    ranked[0]?.score ?? 0,
    now,
    ctx?.status,
    priorSource,
  );
  if (!source && legacyReport) {
    source = legacyReport.source;
  } else if (!source && inherit && priorSource) {
    source = priorSource;
  } else if (!source && isAmbiguousRanking(ranked) && !options.llmSourceId && !inherit) {
    const optionsList = ranked.slice(0, 5).map((row) => ({
      dataset: row.source.name,
      description: row.source.description,
      source_id: row.source.source_id,
    }));
    return {
      status: "ambiguous",
      intent: intent.type,
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      options: optionsList,
      reason: "Multiple MISO datasets could satisfy this request.",
      pipeline: pipeline({
        intent: intent.type,
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  } else if (!source) {
    const hinted = options.llmSourceId ? getSource(options.llmSourceId) : undefined;
    const best = ranked[0];
    if (
      hinted &&
      ranked.some((row) => row.source.source_id === hinted.source_id && row.score >= 4)
    ) {
      source = hinted;
    } else if (best && best.score >= 5) {
      source = best.source;
    } else if (best && best.score >= 3 && !ranked[1]) {
      source = best.source;
    } else if (priorSource && inherit) {
      source = priorSource;
    }
  }

  if (!source && ctx?.status === "ambiguous" && ctx.options?.length) {
    return {
      status: "ambiguous",
      intent: intent.type,
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      options: ctx.options,
      reason: "Please pick one of these MISO datasets by number or name.",
      pipeline: pipeline({
        intent: intent.type,
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  if (!source) {
    const question =
      intent.type === "api_request"
        ? "Which MISO dataset's API do you need? For example: actual load, day-ahead LMP, or fuel mix."
        : "Which MISO data do you need? For example: actual load, day-ahead cleared demand, real-time LMP, or fuel mix.";
    return {
      status: "needs_clarification",
      intent: intent.type,
      parameters: {},
      known_parameters: {},
      missing_parameters: [],
      parameter_details: [],
      validation: { status: "pending" },
      reason: question,
      pipeline: pipeline({
        intent: intent.type,
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  const current = extractFromText(message, source, now, "user_message");
  let extracted = current;
  const remembered = success?.parameters ?? ctx?.parameters;
  if (remembered && Object.keys(remembered).length) {
    extracted = mergeExtracted(extracted, {
      values: remembered,
      details: Object.entries(remembered).map(([name, value]) => ({
        name,
        value,
        source: "conversation" as const,
        confidence: 0.92,
        required: false,
        status: "valid" as const,
        error: null,
      })),
    });
  }
  if (options.parameterOverrides) {
    extracted = mergeExtracted(
      {
        values: options.parameterOverrides,
        details: Object.entries(options.parameterOverrides).map(([name, value]) => ({
          name,
          value,
          source: "user_message" as const,
          confidence: 1,
          required: false,
          status: "valid" as const,
          error: null,
        })),
      },
      extracted,
    );
  }

  const filled = fillCatalogParams(source, extracted.values);
  const allowed = new Set((source.parameters ?? []).map((p) => p.name));
  allowed.add("start_date");
  allowed.add("end_date");
  const parameters = Object.fromEntries(
    Object.entries(filled).filter(([k, v]) => Boolean(v) && allowed.has(k)),
  );

  const metadata = normalizeSource(source);
  const validation = validateCatalogParameters(metadata, parameters);

  const parameter_details: ParameterDetail[] = metadata.parameters.map((param) => {
    const existing = extracted.details.find((d) => d.name === param.name);
    const value = parameters[param.name] ?? "";
    if (!value) {
      return {
        name: param.name,
        value: "",
        source: "trained_miso_metadata",
        confidence: param.required ? 0 : 1,
        required: param.required,
        status: param.required ? "unresolved" : "valid",
        error: param.required ? `Missing required parameter ${param.name}` : null,
      };
    }
    const issue = validation.errors.find((e) => e.parameter === param.name);
    return {
      name: param.name,
      value,
      source: existing?.source ?? "trained_miso_metadata",
      confidence: existing?.confidence ?? 0.9,
      required: param.required,
      status: issue ? "invalid" : "valid",
      error: issue?.message ?? null,
    };
  });

  const missing_parameters = validation.missing.map((param) => ({
    name: param.name,
    question: questionForParameter(param, source.name),
  }));

  const built = source.type === "api" ? buildMisoRequest(source, parameters) : undefined;
  const request = built
    ? { method: built.method, endpoint: built.endpoint, query: built.query }
    : undefined;

  if (validation.errors.length && !validation.missing.length) {
    return {
      status: "validation_error",
      intent: intent.type,
      ...sourceRef(source),
      parameters,
      known_parameters: parameters,
      missing_parameters: [],
      parameter_details,
      validation: { status: "failed", errors: validation.errors },
      ...(request ? { request } : {}),
      pipeline: pipeline({
        intent: intent.type,
        ...withEndpoint(source),
        paramsOk: "invalid",
        validation: "invalid",
        request: "pending",
        response: "pending",
        paramDetail: validation.errors.map((e) => e.message).join(" "),
      }),
    };
  }

  if (missing_parameters.length) {
    return {
      status: "needs_parameters",
      intent: intent.type,
      ...sourceRef(source),
      parameters,
      known_parameters: parameters,
      missing_parameters,
      parameter_details,
      validation: { status: "failed" },
      ...(request ? { request } : {}),
      pipeline: pipeline({
        intent: intent.type,
        ...withEndpoint(source),
        paramsOk: "unresolved",
        validation: "invalid",
        request: "pending",
        response: "pending",
        paramDetail: missing_parameters.map((m) => m.name).join(", "),
      }),
    };
  }

  const lowConfidence = parameter_details.some((d) => d.required && d.confidence < 0.7);
  if (lowConfidence) {
    return {
      status: "needs_clarification",
      intent: intent.type,
      ...sourceRef(source),
      parameters,
      known_parameters: parameters,
      missing_parameters: [],
      parameter_details,
      validation: { status: "pending" },
      reason: "Parameter confidence is too low to call MISO without confirmation.",
      pipeline: pipeline({
        intent: intent.type,
        ...withEndpoint(source),
        paramsOk: "unresolved",
        validation: "pending",
        request: "pending",
        response: "pending",
      }),
    };
  }

  const status: ResolutionStatus = "resolved";
  return {
    status,
    intent: intent.type,
    ...sourceRef(source),
    parameters,
    known_parameters: parameters,
    missing_parameters: [],
    parameter_details,
    validation: { status: "passed" },
    ...(request ? { request } : {}),
    pipeline: pipeline({
      intent: intent.type,
      ...withEndpoint(source),
      paramsOk: "valid",
      validation: "valid",
      request: "valid",
      response: "pending",
    }),
  };
}

export function sourceFromResolution(resolution: MisoResolution): MisoSource | undefined {
  if (resolution.source_id) return getSource(resolution.source_id);
  if (resolution.api) {
    return MISO_SOURCES.find((s) => s.endpoint === resolution.api || s.name === resolution.dataset);
  }
  if (resolution.dataset) {
    return MISO_SOURCES.find((s) => s.name === resolution.dataset);
  }
  return undefined;
}

export { detectIntent };
