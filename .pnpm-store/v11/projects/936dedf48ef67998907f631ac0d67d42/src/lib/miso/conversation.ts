import type { MisoResponse } from "./types";

export const MISO_CTX_PREFIX = "[[miso_ctx:";
export const MISO_CTX_SUFFIX = "]]";

export interface ConversationTurnContext {
  source_id?: string | undefined;
  dataset?: string | undefined;
  parameters: Record<string, string>;
  status?: string | undefined;
  intent?: string | undefined;
  missing?: { name: string; question: string }[] | undefined;
  options?: { dataset: string; description: string; source_id: string }[] | undefined;
}

export function isNewTopic(text: string): boolean {
  return /^(hi|hello|hey|yo|thanks|thank you|thx|ok thanks|start over|new (chat|question|request|topic)|never mind|nvm)\b/i.test(
    text.trim(),
  );
}

export function snapshotFromResponse(response: MisoResponse): ConversationTurnContext {
  const ctx: ConversationTurnContext = {
    parameters: response.parameters ?? {},
  };
  const sourceId = response.source?.id ?? response.resolution?.source_id;
  if (sourceId) ctx.source_id = sourceId;
  const dataset = response.source?.name ?? response.resolution?.dataset;
  if (dataset) ctx.dataset = dataset;
  if (response.resolution?.status) ctx.status = response.resolution.status;
  else ctx.status = response.execution.status;
  if (response.intent.type) ctx.intent = response.intent.type;
  if (response.resolution?.missing_parameters?.length) {
    ctx.missing = response.resolution.missing_parameters;
  }
  if (response.resolution?.options?.length) {
    ctx.options = response.resolution.options;
  }
  return ctx;
}

export function encodeAssistantContext(response: MisoResponse): string {
  const visible = response.title || response.answer || response.clarification || "";
  return `${visible}\n${MISO_CTX_PREFIX}${JSON.stringify(snapshotFromResponse(response))}${MISO_CTX_SUFFIX}`;
}

export function parseAssistantContext(line: string): ConversationTurnContext | undefined {
  const start = line.lastIndexOf(MISO_CTX_PREFIX);
  const end = line.lastIndexOf(MISO_CTX_SUFFIX);
  if (start < 0 || end < 0 || end <= start) return undefined;
  try {
    return JSON.parse(line.slice(start + MISO_CTX_PREFIX.length, end)) as ConversationTurnContext;
  } catch {
    return undefined;
  }
}

function isSuccessCtx(ctx: ConversationTurnContext): boolean {
  return Boolean(ctx.source_id) && (ctx.status === "success" || ctx.status === "resolved");
}

export function conversationMemory(
  history: string[],
  clientLastTurn?: ConversationTurnContext,
  clientLastSuccess?: ConversationTurnContext,
): { lastCtx?: ConversationTurnContext; lastSuccess?: ConversationTurnContext } {
  let lastSuccess: ConversationTurnContext | undefined;
  let lastCtx: ConversationTurnContext | undefined;

  for (const line of history) {
    const lower = line.toLowerCase();
    if (lower.startsWith("user:") && isNewTopic(line.replace(/^user:\s*/i, ""))) {
      lastSuccess = undefined;
    }
    if (!lower.startsWith("assistant:")) continue;
    const ctx = parseAssistantContext(line);
    if (!ctx) continue;
    lastCtx = ctx;
    if (isSuccessCtx(ctx)) lastSuccess = ctx;
  }

  if (clientLastSuccess && isSuccessCtx(clientLastSuccess) && lastSuccess === undefined) {
    lastSuccess = clientLastSuccess;
  }
  if (clientLastTurn) {
    lastCtx = clientLastTurn;
    if (isSuccessCtx(clientLastTurn)) lastSuccess = clientLastTurn;
  }

  return {
    ...(lastCtx ? { lastCtx } : {}),
    ...(lastSuccess ? { lastSuccess } : {}),
  };
}

/**
 * Counts how many prior turns in this conversation successfully resolved to
 * the given MISO source. Used to power the "you keep asking this — here's
 * the API" nudge: MISO wants routine, repeated requests pushed toward
 * self-serve Data Exchange access instead of staying as one-off chat asks.
 */
export function countPriorSuccesses(history: string[], sourceId: string): number {
  let count = 0;
  for (const line of history) {
    if (!line.toLowerCase().startsWith("assistant:")) continue;
    const ctx = parseAssistantContext(line);
    if (ctx && ctx.source_id === sourceId && isSuccessCtx(ctx)) count += 1;
  }
  return count;
}

export function lastAssistantContext(history: string[]): ConversationTurnContext | undefined {
  return conversationMemory(history).lastCtx;
}

export function historyFromMessages(
  rows: { role: string; content: string; payload?: unknown }[],
): string[] {
  return rows.map((m) => {
    if (m.role.toLowerCase() === "user") return `user: ${m.content}`;
    if (m.payload && typeof m.payload === "object") {
      return `assistant: ${encodeAssistantContext(m.payload as MisoResponse)}`;
    }
    return `assistant: ${m.content}`;
  });
}
