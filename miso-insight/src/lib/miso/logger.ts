const SECRET_KEY =
  /subscription[-_]?key|authorization|api[-_]?key|password|passwd|token|secret|credential/i;

function redactValue(key: string, value: unknown): unknown {
  if (SECRET_KEY.test(key)) return "[redacted]";
  if (typeof value === "string" && SECRET_KEY.test(value)) return "[redacted]";
  if (Array.isArray(value)) return value.map((item) => redactValue(key, item));
  if (value && typeof value === "object") return redactSecrets(value as Record<string, unknown>);
  return value;
}

export function redactSecrets<T>(payload: T): T {
  if (payload === null || typeof payload !== "object") return payload;
  if (Array.isArray(payload)) return payload.map((item) => redactSecrets(item)) as T;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    out[key] = redactValue(key, value);
  }
  return out as T;
}

export function logMisoEvent(event: string, payload: Record<string, unknown>): void {
  const safe = redactSecrets({
    event,
    ts: new Date().toISOString(),
    ...payload,
  });
  console.info(JSON.stringify(safe));
}
