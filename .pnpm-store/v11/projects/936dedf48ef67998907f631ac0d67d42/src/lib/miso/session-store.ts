import type { MisoResponse } from "./types";

const PENDING_REQUEST_KEY = "miso:pending-request";

export interface PendingMisoRequest {
  question: string;
  starterApi?: { sourceId: string; name: string } | null;
}

/**
 * Tiny client-side store holding the most recent orchestration response so the
 * Canvas experience can inspect and edit it. No credentials are ever stored.
 */
let current: MisoResponse | null = null;
const listeners = new Set<() => void>();

export function setLastResponse(response: MisoResponse) {
  current = response;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("miso:last-response", JSON.stringify(response));
  }
  listeners.forEach((l) => l());
}

export function getLastResponse(): MisoResponse | null {
  if (current) return current;
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("miso:last-response");
  if (!raw) return null;
  try {
    current = JSON.parse(raw) as MisoResponse;
    return current;
  } catch {
    return null;
  }
}

export function subscribeLastResponse(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Carries a draft through sign-in without storing credentials, keys, or response data.
 * The record is deliberately consumed once the user returns to the workspace.
 */
export function savePendingRequest(request: PendingMisoRequest) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_REQUEST_KEY, JSON.stringify(request));
}

export function consumePendingRequest(): PendingMisoRequest | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PENDING_REQUEST_KEY);
  window.sessionStorage.removeItem(PENDING_REQUEST_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingMisoRequest>;
    if (!parsed.question || typeof parsed.question !== "string") return null;
    const starterApi = parsed.starterApi;
    if (
      starterApi &&
      (typeof starterApi.sourceId !== "string" || typeof starterApi.name !== "string")
    ) {
      return { question: parsed.question };
    }
    return { question: parsed.question, starterApi: starterApi ?? null };
  } catch {
    return null;
  }
}
