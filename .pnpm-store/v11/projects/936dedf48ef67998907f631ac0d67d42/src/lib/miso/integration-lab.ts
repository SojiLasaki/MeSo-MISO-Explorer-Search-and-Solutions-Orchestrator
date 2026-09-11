export type ExternalUserPersonaId =
  | "market_participant"
  | "transmission_owner"
  | "interconnection_customer"
  | "reliability_provider"
  | "operations_planner"
  | "backend_integrator";

export type IntegrationSimulationMode = "success" | "http_505";

export interface AgentQuestion {
  question: string;
  answer: string;
  reason: string;
}

export interface ExternalUserPersona {
  id: ExternalUserPersonaId;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  sourceId: string;
  parameters: Record<string, string>;
  questions: AgentQuestion[];
  complianceNote?: string;
}

/**
 * These scenarios use only APIs present in the checked-in MISO catalog. The
 * Transmission Owner scenario deliberately treats ICCP and EMS as a design
 * decision: they are not represented as Data Exchange endpoints in this app's
 * catalog, so the agent does not promise a nonexistent feed.
 */
export const EXTERNAL_USER_PERSONAS: ExternalUserPersona[] = [
  {
    id: "market_participant",
    title: "Market Participant / Trader",
    shortTitle: "Trader",
    description: "Validate nodal LMPs for billing, settlement, forecasting, and price-risk analysis.",
    outcome: "A paginated, server-side LMP ingestion plan with a settlement-ready result summary.",
    sourceId: "get-v1-real-time-date-lmp-expost",
    parameters: { date: "2026-09-08", node: "INDIANA.HUB", timeResolution: "hourly" },
    questions: [
      {
        question: "Which pricing node and market date should be validated?",
        answer: "INDIANA.HUB for 2026-09-08",
        reason: "Pins the settlement extract to an auditable node and date.",
      },
      {
        question: "Do you need five-minute or hourly values?",
        answer: "Hourly",
        reason: "Keeps the first billing join small while retaining the time-resolution choice.",
      },
    ],
    complianceNote: "Preserve MISO time offsets and every page for settlement auditability.",
  },
  {
    id: "transmission_owner",
    title: "Transmission Owner",
    shortTitle: "Transmission owner",
    description: "Review operational state-estimator load while deciding whether ICCP telemetry or EMS visualization is required.",
    outcome: "A catalog-backed load integration plus a clear escalation for non-catalog ICCP/EMS needs.",
    sourceId: "get-v1-real-time-date-demand-load-state-estimator",
    parameters: { date: "2026-09-08" },
    questions: [
      {
        question: "Do you need your own ICCP telemetry feed or an EMS visualization?",
        answer: "EMS visualization for operations review",
        reason: "ICCP and EMS access are operational-tool decisions, not assumed Data Exchange API capabilities.",
      },
      {
        question: "Which operating day should be reconciled?",
        answer: "2026-09-08",
        reason: "The catalog operation requires a market date.",
      },
    ],
    complianceNote: "Escalate ICCP/EMS access through the appropriate MISO operational channel; do not treat this API as telemetry control.",
  },
  {
    id: "interconnection_customer",
    title: "Interconnection Customer",
    shortTitle: "Interconnection",
    description: "Use forecasts and operational data to support resource testing, modeling, and commissioning preparation.",
    outcome: "A forecast request prepared for model input with date and time-basis checks.",
    sourceId: "get-v1-forecast-date-load",
    parameters: { date: "2026-09-09" },
    questions: [
      {
        question: "Is this for commissioning preparation, modeling, or post-test validation?",
        answer: "Commissioning preparation",
        reason: "Keeps the output scoped to planning support rather than declaring commercial-operation readiness.",
      },
      {
        question: "What forecast issue date should the model use?",
        answer: "2026-09-09",
        reason: "The forecast endpoint is date-scoped.",
      },
    ],
  },
  {
    id: "reliability_provider",
    title: "Reliability Services Recipient / Data Provider",
    shortTitle: "Reliability",
    description: "Check fuel-mix and generation inputs used for reliability workflows, settlement support, and compliance evidence.",
    outcome: "A repeatable real-time fuel-mix ingestion run with validation and traceable diagnostics.",
    sourceId: "get-v1-real-time-date-generation-fuel-type",
    parameters: { date: "2026-09-08" },
    questions: [
      {
        question: "Which reliability data needs a repeatable audit trail?",
        answer: "Real-time generation fuel mix",
        reason: "Selects a structured catalog operation rather than a legacy report copy.",
      },
      {
        question: "What operating date should be reconciled?",
        answer: "2026-09-08",
        reason: "Enables parameter validation before any data call.",
      },
    ],
    complianceNote: "Store source ID, parameters, response timestamps, and retry decisions—never the subscription key.",
  },
  {
    id: "operations_planner",
    title: "Operations Planner",
    shortTitle: "Planner",
    description: "Plan around forward-looking demand and outages as reports migrate to structured APIs.",
    outcome: "An API-first planning request with a clear legacy-report migration path.",
    sourceId: "get-v1-forecast-date-outage",
    parameters: { date: "2026-09-09" },
    questions: [
      {
        question: "Are you replacing a historical report or planning from the API going forward?",
        answer: "Planning from the API going forward",
        reason: "The workflow favors structured API ingestion while preserving report references when explicitly requested.",
      },
      {
        question: "Which forecast date should drive today’s plan?",
        answer: "2026-09-09",
        reason: "Identifies the required endpoint parameter immediately.",
      },
    ],
  },
  {
    id: "backend_integrator",
    title: "Backend Integrator",
    shortTitle: "Developer",
    description: "Build a secure, typed ingestion service for a downstream database, chart, or internal application.",
    outcome: "A server-only request plan with pagination, retry, and secret-handling safeguards.",
    sourceId: "get-v1-real-time-date-demand-actual",
    parameters: { date: "2026-09-08", region: "MISO" },
    questions: [
      {
        question: "Where will the data be used after ingestion?",
        answer: "A Postgres-backed operations dashboard",
        reason: "The agent can tailor a server-side ingestion plan without receiving database credentials.",
      },
      {
        question: "Should the backend fetch a page or the complete data set?",
        answer: "Complete data set",
        reason: "Avoids silently partial exports when pagination is present.",
      },
    ],
    complianceNote: "The subscription key is read only by the backend environment at runtime and is never sent to the browser or agent prompt.",
  },
];

export function getExternalUserPersona(id: ExternalUserPersonaId): ExternalUserPersona {
  return EXTERNAL_USER_PERSONAS.find((persona) => persona.id === id) ?? EXTERNAL_USER_PERSONAS[0]!;
}
