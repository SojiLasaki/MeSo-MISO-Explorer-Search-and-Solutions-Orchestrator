import { describe, expect, it } from "vitest";

import { buildAgentApiDocs } from "./agent-api-docs";

describe("buildAgentApiDocs", () => {
  it("builds documentation for Actual Load without requiring the user to supply a date", () => {
    const docs = buildAgentApiDocs({
      endpointId: "actual_load",
      endpointName: "Actual Load",
      parameters: {},
    });
    expect(docs).not.toBeNull();
    expect(docs!.source.name).toBe("Actual Load");
    expect(docs!.requiredParameters.some((p) => p.name === "date")).toBe(true);
    expect(docs!.api.method).toBe("GET");
    expect(docs!.api.examples.some((e) => e.language === "cURL")).toBe(true);
    expect(docs!.api.examples.some((e) => e.language === "Python")).toBe(true);
    expect(docs!.exampleResponse.data).toBeTruthy();
    expect(docs!.legacyReport?.title).toMatch(/Actual Load/i);
    expect(docs!.callPrompt).toMatch(/Retrieve Actual Load/i);
    expect(docs!.related.length).toBeGreaterThan(0);
  });

  it("accepts colloquial power-usage mapping via backend id", () => {
    const docs = buildAgentApiDocs({
      endpointId: "actual_load",
      endpointName: "Actual Load",
      parameters: { date: "2026-09-08" },
    });
    expect(docs!.api.url).toContain("2026-09-08");
    expect(docs!.callPrompt).toContain("2026-09-08");
  });
});
