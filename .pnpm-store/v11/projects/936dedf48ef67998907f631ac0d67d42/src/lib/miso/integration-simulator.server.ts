import {
  getExternalUserPersona,
  type ExternalUserPersonaId,
  type IntegrationSimulationMode,
} from "./integration-lab";
import {
  executeBackendGateway,
  type GatewayErrorAdvice,
  type GatewayEvent,
} from "./backend-gateway.server";

export interface IntegrationSimulationResult {
  persona: ReturnType<typeof getExternalUserPersona>;
  mode: IntegrationSimulationMode;
  events: GatewayEvent[];
  chatTranscript: IntegrationChatTurn[];
  localChanges: SimulatedLocalChange[];
  status: "success" | "needs_input" | "error";
  request: {
    sourceId: string;
    url?: string;
    method?: string;
    parameters: Record<string, string>;
  };
  analysis?: {
    records: number;
    numericSummary?: { minimum: number; average: number; maximum: number };
    note: string;
  };
  errorAdvice?: GatewayErrorAdvice;
  backendWrite: {
    path: string;
    status: "ready";
    note: string;
  };
}

export interface IntegrationChatTurn {
  actor: "agent" | "chat";
  kind: "question" | "answer" | "action" | "safety" | "error";
  message: string;
}

export interface SimulatedLocalChange {
  path: string;
  action: string;
}

function analyzeRows(rows: Record<string, string | number>[]) {
  const values = rows
    .flatMap((row) => Object.values(row))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return undefined;
  return {
    minimum: Math.min(...values),
    average:
      Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100,
    maximum: Math.max(...values),
  };
}

function describeParameters(parameters: Record<string, string>) {
  return Object.entries(parameters)
    .map(([name, value]) => `${name} = ${value}`)
    .join(", ");
}

function createChatTranscript(
  persona: ReturnType<typeof getExternalUserPersona>,
  mode: IntegrationSimulationMode,
): IntegrationChatTurn[] {
  const parameterValues = describeParameters(persona.parameters);
  const parameterNames = Object.keys(persona.parameters).join(", ");
  const transcript: IntegrationChatTurn[] = [
    {
      actor: "agent",
      kind: "question",
      message: `I can prepare the ${persona.title} backend integration. What values should I use for the required API parameters: ${parameterNames}?`,
    },
    {
      actor: "chat",
      kind: "answer",
      message: `Simulation user response: ${parameterValues}.`,
    },
    {
      actor: "agent",
      kind: "action",
      message:
        "I validated those values against the MISO catalog and will use the server-only request path.",
    },
    {
      actor: "agent",
      kind: "safety",
      message:
        "Which saved credential reference should this backend use? Please provide its label or environment-variable name only—never paste a subscription-key value here.",
    },
    {
      actor: "chat",
      kind: "answer",
      message:
        "Simulation user response: use the Production MISO reference (MISO_SUBSCRIPTION_KEY). The secret is already configured in the backend environment.",
    },
    {
      actor: "agent",
      kind: "action",
      message:
        "I staged the typed server integration and focused tests in a local sandbox. The generated code reads process.env.MISO_SUBSCRIPTION_KEY only at runtime.",
    },
  ];

  if (mode === "http_505") {
    transcript.push(
      {
        actor: "chat",
        kind: "question",
        message: "Simulation user response: the gateway returned HTTP 505. Should the agent retry?",
      },
      {
        actor: "agent",
        kind: "error",
        message:
          "No. I stopped the retry, preserved the safe diagnostics, and asked for proxy/TLS protocol configuration to be reviewed before another request.",
      },
    );
  } else {
    transcript.push({
      actor: "agent",
      kind: "action",
      message:
        "The simulated request completed. I returned a structured response summary to the web chat and kept the credential out of the transcript, code, and logs.",
    });
  }

  return transcript;
}

function createLocalChanges(
  persona: ReturnType<typeof getExternalUserPersona>,
): SimulatedLocalChange[] {
  return [
    {
      path: "src/lib/miso/backend-gateway.server.ts",
      action: `Stage a typed, server-only ${persona.sourceId} request using the approved parameters.`,
    },
    {
      path: "src/lib/miso/backend-gateway.test.ts",
      action: "Stage mocked success and gateway-failure coverage; tests make no live MISO request.",
    },
    {
      path: ".env.example",
      action:
        "Document MISO_SUBSCRIPTION_KEY by name only; do not place a key value in a file or source control.",
    },
  ];
}

/**
 * End-to-end, no-credential simulation of the exact server boundary used for
 * MISO ingestion. It is intentionally deterministic so users can inspect the
 * full flow safely before connecting a subscription key or database.
 */
export async function runIntegrationSimulation(
  personaId: ExternalUserPersonaId,
  mode: IntegrationSimulationMode,
): Promise<IntegrationSimulationResult> {
  const persona = getExternalUserPersona(personaId);
  const chatTranscript = createChatTranscript(persona, mode);
  const localChanges = createLocalChanges(persona);
  const agentEvents: GatewayEvent[] = [
    {
      stage: "agent",
      status: "info",
      message: `Agent selected the ${persona.title} workflow and asked its scoped integration questions.`,
    },
    {
      stage: "agent",
      status: "success",
      message: `Agent matched ${persona.sourceId} from the catalog instead of guessing an endpoint.`,
    },
    {
      stage: "backend",
      status: "success",
      message:
        "Agent wrote the approved server-only gateway module plan; subscription keys remain environment-only.",
    },
  ];
  const gateway = await executeBackendGateway({
    sourceId: persona.sourceId,
    parameters: persona.parameters,
    transport: "simulation",
    ...(mode === "http_505" ? { simulatedHttpStatus: 505 } : {}),
  });

  const request = {
    sourceId: persona.sourceId,
    ...(gateway.requestUrl ? { url: gateway.requestUrl } : {}),
    ...(gateway.source?.method ? { method: gateway.source.method } : {}),
    parameters: persona.parameters,
  };

  if (gateway.status === "success" && gateway.data) {
    const numericSummary = analyzeRows(gateway.data.rows);
    return {
      persona,
      mode,
      status: "success",
      events: [...agentEvents, ...gateway.events],
      chatTranscript,
      localChanges,
      request,
      analysis: {
        records: gateway.data.rows.length,
        ...(numericSummary ? { numericSummary } : {}),
        note: "Simulation result only. It exercises catalog validation and the backend response path without calling MISO or using a key.",
      },
      backendWrite: {
        path: "src/lib/miso/backend-gateway.server.ts",
        status: "ready",
        note: "This typed server-only module is ready for a live environment variable and downstream persistence adapter.",
      },
    };
  }

  return {
    persona,
    mode,
    status: gateway.status,
    events: [...agentEvents, ...gateway.events],
    chatTranscript,
    localChanges,
    request,
    ...(gateway.errorAdvice ? { errorAdvice: gateway.errorAdvice } : {}),
    backendWrite: {
      path: "src/lib/miso/backend-gateway.server.ts",
      status: "ready",
      note: "The gateway blocks unsafe retries and exposes a safe diagnostics path before a live rollout.",
    },
  };
}
