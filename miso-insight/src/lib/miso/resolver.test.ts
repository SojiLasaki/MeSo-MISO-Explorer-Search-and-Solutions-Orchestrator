import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeAssistantContext } from "./conversation";
import { fetchMisoData } from "./client.server";
import { createLocalAgentScript } from "./agent-package";
import { extractMisoDate, MISO_TIMESTAMP_NOTE, misoCalendarDate } from "./dates";
import { classifyHttpError } from "./api-errors";
import { executeBackendGateway, reviewGatewayFailure } from "./backend-gateway.server";
import { redactSecrets } from "./logger";
import { runIntegrationSimulation } from "./integration-simulator.server";
import { EXTERNAL_USER_PERSONAS } from "./integration-lab";
import { getNormalizedApi } from "./metadata";
import { runMisoRequest } from "./orchestrator.server";
import { getSource } from "./registry";
import { resolveMisoQuery } from "./resolver";
import { consumePendingRequest, savePendingRequest } from "./session-store";
import {
  buildMisoRequest,
  containsSecret,
  SUBSCRIPTION_KEY_PLACEHOLDER,
  toApiRequestSpec,
} from "./request-builder";
import type { MisoResponse } from "./types";

const NOW = new Date("2026-09-08T16:00:00Z");
const LATE_NIGHT_ET = new Date("2026-09-08T04:30:00Z"); // 12:30 AM EDT on Sept 8

function historyAfter(question: string, response: MisoResponse, prior: string[] = []): string[] {
  return [...prior, `user: ${question}`, `assistant: ${encodeAssistantContext(response)}`];
}

describe("MISO date utility", () => {
  it("uses the Eastern civil calendar for yesterday, including late night EDT", () => {
    expect(misoCalendarDate(NOW)).toBe("2026-09-08");
    expect(extractMisoDate("yesterday", NOW)?.value).toBe("2026-09-07");
    expect(misoCalendarDate(LATE_NIGHT_ET)).toBe("2026-09-08");
    expect(extractMisoDate("yesterday", LATE_NIGHT_ET)?.value).toBe("2026-09-07");
  });

  it("makes DST-safe Eastern market time explicit", () => {
    expect(MISO_TIMESTAMP_NOTE).toContain("Eastern Prevailing Time");
    expect(MISO_TIMESTAMP_NOTE).toContain("America/New_York");
    expect(MISO_TIMESTAMP_NOTE).toContain("repeated local hour");
  });
});

describe("parameter resolver", () => {
  it("identifies actual load and yesterday's date", () => {
    const result = resolveMisoQuery("Give me actual load for yesterday", { now: NOW });
    expect(result.status).toBe("resolved");
    expect(result.dataset).toBe("Actual Load");
    expect(result.source_id).toBe("get-v1-real-time-date-demand-actual");
    expect(result.parameters["date"]).toBe("2026-09-07");
    expect(result.missing_parameters).toEqual([]);
    expect(result.validation.status).toBe("passed");
    expect(result.parameter_details.find((p) => p.name === "date")?.source).toBe("user_message");
  });

  it("asks for the required date instead of inventing one", () => {
    const result = resolveMisoQuery("Show me actual load", { now: NOW });
    expect(result.status).toBe("needs_parameters");
    expect(result.dataset).toBe("Actual Load");
    expect(result.parameters["date"]).toBeUndefined();
    expect(result.missing_parameters.some((p) => p.name === "date")).toBe(true);
    expect(result.missing_parameters[0]?.question.toLowerCase()).toMatch(/date/);
  });

  it("accepts every required field as explicit parameter overrides", () => {
    const result = resolveMisoQuery("Show actual load", {
      now: NOW,
      parameterOverrides: { date: "2026-09-07" },
    });
    expect(result.status).toBe("resolved");
    expect(result.parameters["date"]).toBe("2026-09-07");
    expect(result.parameter_details.find((parameter) => parameter.name === "date")?.source).toBe(
      "user_message",
    );
  });

  it("resolves day-ahead cleared demand for September 5", () => {
    const result = resolveMisoQuery("Give me day-ahead cleared demand for September 5", {
      now: NOW,
    });
    expect(result.status).toBe("resolved");
    expect(result.dataset).toBe("Day-Ahead Cleared Demand");
    expect(result.source_id).toBe("get-v1-day-ahead-date-demand");
    expect(result.api).toContain("/v1/day-ahead/{date}/demand");
    expect(result.parameters["date"]).toBe("2026-09-05");
    expect(result.request?.method).toBe("GET");
    expect(result.request?.endpoint).toContain("/v1/day-ahead/2026-09-05/demand");
  });

  it("treats generic power results as ambiguous", () => {
    const result = resolveMisoQuery("Give me power results", { now: NOW });
    expect(result.status).toBe("ambiguous");
    expect(result.options?.length).toBeGreaterThan(1);
    expect(result.options?.some((o) => o.dataset === "Actual Load")).toBe(true);
  });

  it("fails validation for an invalid catalog enum", () => {
    const result = resolveMisoQuery("Give me actual load for yesterday", {
      now: NOW,
      parameterOverrides: { region: "daily" },
    });
    expect(result.status).toBe("validation_error");
    expect(result.validation.status).toBe("failed");
    const regionError = result.validation.errors?.find((e) => e.parameter === "region");
    expect(regionError?.provided).toBe("daily");
    expect(regionError?.expected).toEqual(["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]);
  });

  it("constructs a catalog-backed API request without executing it", () => {
    const result = resolveMisoQuery("Give me actual load for yesterday", { now: NOW });
    expect(result.status).toBe("resolved");
    expect(result.request).toMatchObject({
      method: "GET",
      endpoint: "https://apim.misoenergy.org/lgi/v1/real-time/2026-09-07/demand/actual",
    });
    expect(JSON.stringify(result)).not.toMatch(/Ocp-Apim-Subscription-Key.: (?!YOUR_MISO)/);
    const source = getSource(result.source_id!);
    const built = buildMisoRequest(source!, result.parameters);
    expect(built.headers.find((h) => h.key === "Ocp-Apim-Subscription-Key")?.value).toBe(
      SUBSCRIPTION_KEY_PLACEHOLDER,
    );
  });

  it("inherits dataset on a date follow-up", () => {
    const result = resolveMisoQuery("Now do September 6", {
      now: NOW,
      history: ["user: Show me actual load for September 5"],
    });
    expect(result.status).toBe("resolved");
    expect(result.dataset).toBe("Actual Load");
    expect(result.parameters["date"]).toBe("2026-09-06");
  });

  it("routes explicit legacy report requests to an official report reference", () => {
    const result = resolveMisoQuery("Show the old day-ahead pricing report", { now: NOW });
    expect(result.status).toBe("resolved");
    expect(result.source_id).toBe("legacy_day_ahead_pricing_report");
    expect(result.dataset).toContain("Day-Ahead Pricing");
  });
});

describe("legacy reports and local-agent handoff", () => {
  it("returns a direct official report URL and an API migration nudge", async () => {
    const response = await runMisoRequest("Show the old day-ahead pricing report", [], NOW);
    expect(response.execution.status).toBe("success");
    expect(response.report?.url).toContain("docs.misoenergy.org");
    expect(response.api_nudge?.ask).toContain("Day-Ahead Ex-Post LMP");
  });

  it("places every resolved parameter in a local agent plan without key material", () => {
    const source = getSource("get-v1-real-time-date-demand-actual")!;
    const api = toApiRequestSpec(source, { date: "2026-09-07", region: "MISO" });
    const script = createLocalAgentScript(api, {
      id: "key-reference-id",
      label: "Production MISO",
      environment_variable: "MISO_PROD_KEY",
      status: "active",
      created_at: "2026-09-09T00:00:00Z",
      updated_at: "2026-09-09T00:00:00Z",
    });
    expect(script).toContain('"date"');
    expect(script).toContain('"2026-09-07"');
    expect(script).toContain("MISO_PROD_KEY");
    expect(script).toContain("never a MISO subscription");
    expect(script).toContain("sandboxOptions: { enabled: sandboxEnabled }");
    expect(script).toContain("autoReview: true");
    const executableBody = script.replace(
      /import \{ Agent, CursorAgentError \} from "@cursor\/sdk";/,
      "",
    );
    expect(() => new Function(`async function localAgent() {${executableBody}}`)).not.toThrow();
  });
});

describe("trader request continuity", () => {
  it("restores a selected API and draft exactly once after sign-in", () => {
    const entries = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => entries.set(key, value),
        removeItem: (key: string) => entries.delete(key),
      },
    });

    savePendingRequest({
      question: "Use Real-Time Ex-Post LMP to make a chart",
      starterApi: {
        sourceId: "get-v1-real-time-date-lmp-expost",
        name: "Real-Time Ex-Post LMP",
      },
    });

    expect(consumePendingRequest()).toEqual({
      question: "Use Real-Time Ex-Post LMP to make a chart",
      starterApi: {
        sourceId: "get-v1-real-time-date-lmp-expost",
        name: "Real-Time Ex-Post LMP",
      },
    });
    expect(consumePendingRequest()).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("integration backend and error-review simulation", () => {
  it("runs the catalog-backed backend gateway without live credentials in simulation mode", async () => {
    const result = await executeBackendGateway({
      sourceId: "get-v1-real-time-date-demand-actual",
      parameters: { date: "2026-09-08", region: "MISO" },
      transport: "simulation",
    });
    expect(result.status).toBe("success");
    expect(result.live).toBe(false);
    expect(result.data?.rows).toHaveLength(24);
    expect(
      result.events.some((event) => event.stage === "validation" && event.status === "success"),
    ).toBe(true);
  });

  it("has the local agent request parameters and a safe key reference through the web-chat simulation", async () => {
    const result = await runIntegrationSimulation("backend_integrator", "success");
    const transcript = result.chatTranscript.map((turn) => turn.message).join(" ");

    expect(transcript).toContain("date");
    expect(transcript).toContain("MISO_SUBSCRIPTION_KEY");
    expect(transcript).toContain("never paste a subscription-key value");
    expect(result.localChanges.map((change) => change.path)).toContain(
      "src/lib/miso/backend-gateway.server.ts",
    );
    expect(transcript).not.toContain("Ocp-Apim-Subscription-Key:");
  });

  it("stops on HTTP 505 and provides a safe, non-secret transport recovery plan", async () => {
    expect(classifyHttpError(505)).toMatchObject({ type: "http_version", retryable: false });
    const advice = reviewGatewayFailure(505, getSource("get-v1-real-time-date-lmp-expost"));
    expect(advice.retry).toBe("do_not_retry");
    expect(advice.actions.join(" ")).toContain("HTTP/2");
    expect(advice.safeSupportContext.join(" ")).not.toContain("subscription key");

    const result = await runIntegrationSimulation("market_participant", "http_505");
    expect(result.status).toBe("error");
    expect(result.errorAdvice?.status).toBe(505);
    expect(result.events.some((event) => event.stage === "error")).toBe(true);
    expect(result.chatTranscript.at(-1)?.message).toContain("stopped the retry");
  });

  it("runs every documented external-user workflow through success and safe 505 recovery", async () => {
    for (const persona of EXTERNAL_USER_PERSONAS) {
      const success = await runIntegrationSimulation(persona.id, "success");
      const transcript = success.chatTranscript.map((turn) => turn.message).join(" ");

      expect(success.status).toBe("success");
      expect(success.request.sourceId).toBe(persona.sourceId);
      expect(success.request.parameters).toEqual(persona.parameters);
      expect(success.analysis?.records).toBeGreaterThan(0);
      expect(
        success.events.some((event) => event.stage === "validation" && event.status === "success"),
      ).toBe(true);
      for (const parameterName of Object.keys(persona.parameters)) {
        expect(transcript).toContain(parameterName);
      }
      expect(transcript).toContain("never paste a subscription-key value");
      expect(transcript).not.toContain("Ocp-Apim-Subscription-Key:");

      const protocolFailure = await runIntegrationSimulation(persona.id, "http_505");
      expect(protocolFailure.status).toBe("error");
      expect(protocolFailure.errorAdvice?.retry).toBe("do_not_retry");
      expect(protocolFailure.chatTranscript.at(-1)?.message).toContain("stopped the retry");
    }
  });
});

describe("trained metadata schema", () => {
  it("normalizes Actual Load from catalog.json", () => {
    const meta = getNormalizedApi("get-v1-real-time-date-demand-actual");
    expect(meta?.dataset).toBe("Actual Load");
    expect(meta?.method).toBe("GET");
    expect(meta?.timezone).toBe("EST");
    expect(meta?.parameters.find((p) => p.name === "date")?.required).toBe(true);
    expect(meta?.parameters.find((p) => p.name === "region")?.allowed_values).toContain("NORTH");
    expect(meta?.authentication.env_var).toBe("MISO_SUBSCRIPTION_KEY");
  });
});

describe("live request execution", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends catalog endpoint, parameters, and auth header without leaking the key", async () => {
    const secret = "secret-test-key-do-not-leak";
    const calls: Array<{ url: string; headers: HeadersInit | undefined }> = [];
    const fetchMock: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), headers: init?.headers });
      return new Response(JSON.stringify([{ hourEnding: "00:00", mw: 61234 }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const source = getSource("get-v1-real-time-date-demand-actual")!;
    const params = { date: "2026-09-07" };
    const result = await fetchMisoData(source, params, {
      fetch: fetchMock,
      getKey: () => secret,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe(
      "https://apim.misoenergy.org/lgi/v1/real-time/2026-09-07/demand/actual",
    );
    const headers = new Headers(calls[0]!.headers);
    expect(headers.get("Ocp-Apim-Subscription-Key")).toBe(secret);
    expect(headers.get("Accept")).toBe("application/json");
    expect(containsSecret(result, secret)).toBe(false);
    expect(JSON.stringify(result.data)).not.toContain(secret);
  });

  it("retrieves every MISO page instead of returning a partial settlement extract", async () => {
    const source = getSource("get-v1-real-time-date-lmp-expost")!;
    const requestedUrls: string[] = [];
    const fetchMock: typeof fetch = async (input) => {
      requestedUrls.push(String(input));
      const page = new URL(String(input)).searchParams.get("pageNumber");
      const payload =
        page !== "2"
          ? {
              data: [{ interval: "00:00", value: 42.11 }],
              page: { pageNumber: 1, pageSize: 1, totalPages: 2, lastPage: false },
            }
          : {
              data: [{ interval: "00:05", value: 42.2 }],
              page: { pageNumber: 2, pageSize: 1, totalPages: 2, lastPage: true },
            };
      return new Response(JSON.stringify(payload), { status: 200 });
    };

    const result = await fetchMisoData(
      source,
      { date: "2026-09-07" },
      {
        fetch: fetchMock,
        getKey: () => "secret-test-key-do-not-leak",
      },
    );

    expect(requestedUrls.map((url) => new URL(url).searchParams.get("pageNumber"))).toEqual([
      null,
      "2",
    ]);
    expect(result.data.rows).toHaveLength(2);
    expect(result.pagination).toMatchObject({ pages_fetched: 2, total_pages: 2, page_size: 1 });
  });

  it("retries a transient MISO failure and honors Retry-After", async () => {
    const source = getSource("get-v1-real-time-date-demand-actual")!;
    let calls = 0;
    const waits: number[] = [];
    const fetchMock: typeof fetch = async () => {
      calls += 1;
      if (calls === 1) {
        return new Response("temporarily unavailable", {
          status: 503,
          headers: { "Retry-After": "2" },
        });
      }
      return new Response(
        JSON.stringify({
          data: [{ interval: "00:00", value: 62000 }],
          page: { pageNumber: 1, pageSize: 1, totalPages: 1, lastPage: true },
        }),
        { status: 200 },
      );
    };

    const result = await fetchMisoData(
      source,
      { date: "2026-09-07" },
      {
        fetch: fetchMock,
        getKey: () => "secret-test-key-do-not-leak",
        sleep: async (milliseconds) => {
          waits.push(milliseconds);
        },
      },
    );

    expect(calls).toBe(2);
    expect(waits).toEqual([2_000]);
    expect(result.data.rows).toHaveLength(1);
  });
});

describe("API integration safeguards", () => {
  it("generates looping examples and guidance for a paginated operation", () => {
    const source = getSource("get-v1-real-time-date-lmp-expost")!;
    const api = toApiRequestSpec(source, { date: "2026-09-07" });

    expect(api.pagination?.param_name).toBe("pageNumber");
    expect(api.examples.every((example) => example.code.includes("pageNumber"))).toBe(true);
    expect(api.examples.find((example) => example.language === "Python")?.code).toContain(
      "while True",
    );
    expect(api.examples.find((example) => example.language === "JavaScript")?.code).toContain(
      "for (let page = 1",
    );
    expect(api.reliability_note).toContain("exponential backoff");
  });

  it("puts the time basis on both API and plain-language dated answers", async () => {
    const apiSource = getSource("get-v1-real-time-date-demand-actual")!;
    expect(toApiRequestSpec(apiSource, { date: "2026-09-07" }).timezone_note).toBe(
      MISO_TIMESTAMP_NOTE,
    );

    const response = await runMisoRequest("What was the actual load yesterday?", [], NOW);
    expect(response.explanation).toContain(MISO_TIMESTAMP_NOTE);
  });
});

describe("settlement developer conversation", () => {
  it("keeps context through a realistic database, reliability, and DST workflow", async () => {
    const firstQuestion = "Show real-time LMP for Indiana yesterday.";
    const first = await runMisoRequest(firstQuestion, [], NOW);
    expect(first.execution.status).toBe("success");
    expect(first.source?.name).toContain("LMP");

    const databaseQuestion =
      "I need this in Postgres for settlement. How should I connect it to my backend?";
    const database = await runMisoRequest(
      databaseQuestion,
      historyAfter(firstQuestion, first),
      NOW,
    );
    expect(database.intent.type).toBe("explain");
    expect(database.source?.id).toBe(first.source?.id);
    expect(database.data).toBeUndefined();
    expect(database.explanation).toContain("server-side job");

    const reliabilityQuestion =
      "What happens when MISO returns 429 while my job is collecting pages?";
    const reliability = await runMisoRequest(
      reliabilityQuestion,
      historyAfter(databaseQuestion, database, historyAfter(firstQuestion, first)),
      NOW,
    );
    expect(reliability.intent.type).toBe("explain");
    expect(reliability.source?.id).toBe(first.source?.id);
    expect(reliability.data).toBeUndefined();
    expect(reliability.explanation).toContain("Retry-After");
    expect(reliability.explanation).toContain("Only commit a run after every page succeeds");

    const timeQuestion = "How should I store an interval during the fall DST hour?";
    const time = await runMisoRequest(
      timeQuestion,
      historyAfter(
        reliabilityQuestion,
        reliability,
        historyAfter(databaseQuestion, database, historyAfter(firstQuestion, first)),
      ),
      NOW,
    );
    expect(time.intent.type).toBe("explain");
    expect(time.source?.id).toBe(first.source?.id);
    expect(time.data).toBeUndefined();
    expect(time.explanation).toContain("UTC offset");
    expect(time.explanation).toContain("local clock hour repeats");
  });
});

describe("human conversation boundaries", () => {
  it("does not repeat the prior market result for an unrelated personal question", async () => {
    const pricesQuestion = "Show me today's market prices.";
    const prices = await runMisoRequest(pricesQuestion, [], NOW);
    expect(prices.source?.name).toContain("LMP");

    const reply = await runMisoRequest("do you love me", historyAfter(pricesQuestion, prices), NOW);

    expect(reply.intent.type).toBe("clarify");
    expect(reply.source).toBeNull();
    expect(reply.data).toBeUndefined();
    expect(reply.metrics).toBeUndefined();
    expect(reply.clarification).toContain("don't experience love");
    expect(reply.clarification).not.toContain("LMP");
  });
});

describe("chat pipeline wiring", () => {
  it("does not call MISO when the catalog date is missing", async () => {
    const response = await runMisoRequest("Show me actual load", [], NOW);
    expect(response.execution.status).toBe("needs_clarification");
    expect(response.clarification?.toLowerCase()).toMatch(/date/);
    expect(response.resolution?.status).toBe("needs_parameters");
    expect(response.data).toBeUndefined();
  });

  it("returns structured data for a complete request without forcing a chart", async () => {
    const response = await runMisoRequest("Give me actual load for yesterday", [], NOW);
    expect(response.execution.status).toBe("success");
    expect(response.source?.name).toBe("Actual Load");
    expect(response.parameters["date"]).toBe("2026-09-07");
    expect(response.output.include_chart).toBe(false);
    expect(response.data?.rows.length).toBeGreaterThan(0);
    expect(JSON.stringify(response)).not.toContain("MISO_SUBSCRIPTION_KEY");
    const key = process.env["MISO_SUBSCRIPTION_KEY"];
    if (key) expect(JSON.stringify(response)).not.toContain(key);
  });

  it("asks for the date, then accepts yesterday as the answer", async () => {
    const ask = await runMisoRequest("Show me actual load", [], NOW);
    expect(ask.execution.status).toBe("needs_clarification");
    expect(ask.clarification).toMatch(/What date would you like for Actual Load/i);
    const answer = await runMisoRequest("yesterday", historyAfter("Show me actual load", ask), NOW);
    expect(answer.execution.status).toBe("success");
    expect(answer.source?.name).toBe("Actual Load");
    expect(answer.parameters["date"]).toBe("2026-09-07");
  });

  it("keeps actual load context when the user later asks for the API", async () => {
    const first = await runMisoRequest("What was the actual load yesterday?", [], LATE_NIGHT_ET);
    expect(first.execution.status).toBe("success");
    expect(first.parameters["date"]).toBe("2026-09-07");
    expect(first.title).toMatch(/September 7, 2026/);

    const api = await runMisoRequest(
      "i need the api",
      historyAfter("What was the actual load yesterday?", first),
      LATE_NIGHT_ET,
    );
    expect(api.output.mode).toBe("api");
    expect(api.source?.name).toBe("Actual Load");
    expect(api.api?.url).toContain("/v1/real-time/2026-09-07/demand/actual");
    expect(api.api?.parameters.find((p) => p.key === "date")?.value).toBe("2026-09-07");
    expect(api.api?.parameters.find((p) => p.key === "geoResolution")?.value).toBe("");
    expect(api.clarification).toBeUndefined();
  });

  it("answers a database-backend follow-up in context without repeating the data result", async () => {
    const first = await runMisoRequest("What was the actual load yesterday?", [], NOW);
    const followUp = await runMisoRequest(
      "How can I connect this to my database backend?",
      historyAfter("What was the actual load yesterday?", first),
      NOW,
    );

    expect(followUp.intent.type).toBe("explain");
    expect(followUp.source?.name).toBe("Actual Load");
    expect(followUp.parameters["date"]).toBe("2026-09-07");
    expect(followUp.output.mode).toBe("answer");
    expect(followUp.data).toBeUndefined();
    expect(followUp.api?.name).toContain("Actual Load");
    expect(followUp.explanation).toContain("server-side job");
    expect(followUp.explanation).toContain("every available page");
  });

  it("asks for a date after a greeting, then remembers the dataset for API follow-ups", async () => {
    const hi = await runMisoRequest("hi", [], NOW);
    expect(hi.clarification).toMatch(/Which MISO data do you need/i);

    const named = await runMisoRequest("actual load", historyAfter("hi", hi), NOW);
    expect(named.resolution?.status).toBe("needs_parameters");
    expect(named.source?.name).toBe("Actual Load");
    expect(named.clarification).toMatch(/What date/);

    const histNamed = historyAfter("actual load", named, historyAfter("hi", hi));
    const dated = await runMisoRequest("yesterday", histNamed, NOW);
    expect(dated.execution.status).toBe("success");
    expect(dated.parameters["date"]).toBe("2026-09-07");

    const api = await runMisoRequest(
      "can i get the api for this",
      historyAfter("yesterday", dated, histNamed),
      NOW,
    );
    expect(api.output.mode).toBe("api");
    expect(api.source?.name).toBe("Actual Load");
    expect(api.api?.url).toContain("/v1/real-time/2026-09-07/demand/actual");
    expect(api.data).toBeUndefined();
  });

  it("uses the last successful turn even when history text is empty", async () => {
    const first = await runMisoRequest("What was the actual load yesterday?", [], NOW);
    const { snapshotFromResponse } = await import("./conversation");
    const api = await runMisoRequest("can i get the api for this", [], NOW, {
      lastTurn: snapshotFromResponse(first),
      lastSuccess: snapshotFromResponse(first),
    });
    expect(api.output.mode).toBe("api");
    expect(api.api?.url).toContain("2026-09-07");
  });

  it("treats the actual load as an API answer when the last question asked for an API", async () => {
    const first = await runMisoRequest("What was the actual load yesterday?", [], NOW);
    const { snapshotFromResponse } = await import("./conversation");
    const retry = await runMisoRequest("the actual load", [], NOW, {
      lastTurn: {
        parameters: {},
        status: "needs_clarification",
        intent: "api_request",
      },
      lastSuccess: snapshotFromResponse(first),
    });
    expect(retry.output.mode).toBe("api");
    expect(retry.source?.name).toBe("Actual Load");
    expect(retry.api?.url).toContain("2026-09-07");
  });

  it("lets the user pick an ambiguous dataset by number", async () => {
    const ask = await runMisoRequest("Give me power results", [], NOW);
    expect(ask.resolution?.status).toBe("ambiguous");
    expect(ask.clarification).toMatch(/Reply with a number/);
    const picked = await runMisoRequest("1", historyAfter("Give me power results", ask), NOW);
    expect(picked.resolution?.status).toBe("needs_parameters");
    expect(picked.source?.name).toBe("Actual Load");
    expect(picked.clarification).toMatch(/What date/);
  });
});

describe("API promotion nudge", () => {
  it("does not nudge the first two times a source is asked about", async () => {
    const first = await runMisoRequest("What was the actual load yesterday?", [], NOW);
    expect(first.api_nudge).toBeUndefined();
    let history = historyAfter("What was the actual load yesterday?", first);
    const second = await runMisoRequest("What was the actual load yesterday?", history, NOW);
    expect(second.api_nudge).toBeUndefined();
    history = historyAfter("What was the actual load yesterday?", second, history);

    const third = await runMisoRequest("What was the actual load yesterday?", history, NOW);
    expect(third.api_nudge).toBeDefined();
    expect(third.api_nudge?.ask).toContain("Actual Load");
  });

  it("does not nudge when the user already asked for the API", async () => {
    let history: string[] = [];
    let response = await runMisoRequest("What was the actual load yesterday?", history, NOW);
    for (let i = 0; i < 2; i++) {
      history = historyAfter("What was the actual load yesterday?", response, history);
      response = await runMisoRequest("What was the actual load yesterday?", history, NOW);
    }
    history = historyAfter("What was the actual load yesterday?", response, history);
    const apiAnswer = await runMisoRequest("Give me the API for actual load data.", history, NOW);
    expect(apiAnswer.output.mode).toBe("api");
    expect(apiAnswer.api_nudge).toBeUndefined();
  });
});

describe("secret redaction", () => {
  it("strips subscription keys from log payloads", () => {
    const redacted = redactSecrets({
      request_id: "req_1",
      headers: { "Ocp-Apim-Subscription-Key": "abc123", Accept: "application/json" },
      MISO_SUBSCRIPTION_KEY: "abc123",
    });
    expect(JSON.stringify(redacted)).not.toContain("abc123");
    expect(redacted.headers["Ocp-Apim-Subscription-Key"]).toBe("[redacted]");
  });
});
