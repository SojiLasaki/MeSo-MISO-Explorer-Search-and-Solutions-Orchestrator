import { describe, expect, it } from "vitest";

import type { AgentResult } from "@/lib/local-backend";
import {
  adaptAgentResultToSemanticDataset,
  buildReadableCsv,
  buildSemanticView,
  detectQuestionIntent,
  formatIntervalLabel,
  planVisualization,
  semanticDisplayFields,
  toNumber,
  validateVisualizationPlan,
} from "./index";

const FUEL_MIX_RAW = {
  RefId: "10-Sep-2026 - Interval 22:25 EST",
  TotalMW: "83847",
  Fuel: {
    Type: [
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Coal", ACT: "29791", FUEL_CATEGORY: "Coal  (29,791 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Natural Gas", ACT: "28071", FUEL_CATEGORY: "Natural Gas  (28,071 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Nuclear", ACT: "11854", FUEL_CATEGORY: "Nuclear  (11,854 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Wind", ACT: "10519", FUEL_CATEGORY: "Wind  (10,519 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Solar", ACT: "0", FUEL_CATEGORY: "Solar  (0 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Battery Storage", ACT: "-75", FUEL_CATEGORY: "Battery Storage  (-75 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Other", ACT: "1182", FUEL_CATEGORY: "Other  (1,182 MW)" },
      { INTERVALEST: "2026-09-10 10:25:00 PM", CATEGORY: "Imports", ACT: "2430", FUEL_CATEGORY: "Imports (2,430 MW)" },
    ],
  },
};

function fuelMixAgentResult(): AgentResult {
  const rows = FUEL_MIX_RAW.Fuel.Type.map((item) => ({
    marketDate: "2026-09-10",
    interval: item.INTERVALEST,
    fuelType: item.CATEGORY,
    value: Number(item.ACT),
    region: "MISO",
    label: item.FUEL_CATEGORY,
  }));
  return {
    status: "success",
    message: "Retrieved from MISO Public API",
    events: [],
    endpoint: {
      id: "realtime_generation_fuel_type",
      name: "Real-Time Generation Fuel Type",
      unit: "MW",
      parameters: [],
    },
    data: {
      data: rows,
      simulated: false,
      source: "MISO Public API",
      refId: FUEL_MIX_RAW.RefId,
      totalMW: FUEL_MIX_RAW.TotalMW,
      raw: FUEL_MIX_RAW,
    },
    verification: {
      tested: true,
      status_code: 200,
      source: "MISO Public API",
      authentication: "none — public anonymous endpoint",
    },
  };
}

describe("Fuel Mix semantic transformation", () => {
  it("preserves all 8 fuel categories and authoritative TotalMW", () => {
    const dataset = adaptAgentResultToSemanticDataset(fuelMixAgentResult());
    expect(dataset).not.toBeNull();
    expect(dataset!.rows).toHaveLength(8);
    expect(dataset!.metadata?.total).toBe(83847);
    expect(dataset!.metadata?.confidence).toBe("catalog");
    expect(dataset!.semanticType).toBe("categorical_comparison");

    const battery = dataset!.rows.find((row) => row.fuelType === "Battery Storage");
    expect(battery?.value).toBe(-75);

    const fields = semanticDisplayFields(dataset!);
    expect(fields.map((f) => f.label)).toEqual(["Fuel Type", "Generation (MW)", "Interval"]);
  });

  it("formats the interval without inventing the next calendar day", () => {
    expect(formatIntervalLabel("2026-09-10 10:25:00 PM")).toBe("Sep 10, 2026, 10:25 PM EST");
  });

  it("detects largest source and does not sum ACT for total", () => {
    const view = buildSemanticView(fuelMixAgentResult(), "Show me the real-time generation fuel mix");
    expect(view).not.toBeNull();
    const totalMetric = view!.plan.metrics?.find((m) => m.label === "Total Generation");
    expect(totalMetric?.value).toContain("83,847");
    const largest = view!.plan.metrics?.find((m) => m.label === "Largest Source");
    expect(largest?.value).toContain("Coal");
    expect(largest?.value).toContain("29,791");
    // Sum of ACT is 83872, not 83847 — prove we did not use the sum.
    const actSum = FUEL_MIX_RAW.Fuel.Type.reduce((acc, row) => acc + Number(row.ACT), 0);
    expect(actSum).not.toBe(83847);
    expect(String(totalMetric?.value)).not.toContain(actSum.toLocaleString("en-US"));
  });
});

describe("question-aware planning", () => {
  it("routes 'most' to ranked horizontal bar", () => {
    expect(detectQuestionIntent("What is generating the most power right now?")).toBe("most");
    const view = buildSemanticView(fuelMixAgentResult(), "What is generating the most power right now?");
    expect(view!.plan.type).toBe("horizontal_bar");
    expect(view!.plan.insight).toMatch(/Coal/i);
  });

  it("routes percentage questions to donut and wind share", () => {
    expect(detectQuestionIntent("What percentage of generation is wind?")).toBe("percentage");
    const view = buildSemanticView(fuelMixAgentResult(), "What percentage of generation is wind?");
    expect(view!.plan.type).toBe("donut");
    expect(view!.plan.highlightValues).toContain("Wind");
    const share = view!.plan.metrics?.find((m) => m.label.includes("Wind"));
    expect(share?.value).toMatch(/%/);
    expect(view!.plan.insight).toMatch(/Wind/i);
  });

  it("routes compare coal and natural gas to comparison plan", () => {
    const view = buildSemanticView(fuelMixAgentResult(), "Compare coal and natural gas");
    expect(view!.plan.type).toBe("comparison");
    expect(view!.plan.highlightValues).toEqual(expect.arrayContaining(["Coal", "Natural Gas"]));
    expect(view!.plan.insight).toMatch(/Coal|Natural Gas/);
  });
});

describe("validation and fallbacks", () => {
  it("falls back to table when valueField is invalid", () => {
    const dataset = adaptAgentResultToSemanticDataset(fuelMixAgentResult())!;
    const bad = planVisualization(dataset, "");
    const validated = validateVisualizationPlan(dataset, {
      ...bad,
      valueField: "does_not_exist",
      type: "horizontal_bar",
    });
    expect(validated.type).toBe("table");
  });

  it("unknown endpoints fall back to inferred/generic semantics", () => {
    const result: AgentResult = {
      status: "success",
      message: "ok",
      events: [],
      endpoint: { id: "unknown_endpoint", name: "Mystery", unit: "MW", parameters: [] },
      data: {
        data: [
          { alpha: "A", value: 1 },
          { alpha: "B", value: 2 },
        ],
      },
    };
    const dataset = adaptAgentResultToSemanticDataset(result)!;
    expect(dataset.metadata?.confidence === "inferred" || dataset.metadata?.confidence === "low").toBe(true);
    expect(["categorical_comparison", "generic_table", "time_series"]).toContain(dataset.semanticType);
  });
});

describe("helpers", () => {
  it("parses numeric strings", () => {
    expect(toNumber("29,791")).toBe(29791);
    expect(toNumber("-75")).toBe(-75);
  });
});

describe("readable CSV export", () => {
  it("exports labeled Fuel Mix columns instead of raw JSON keys", () => {
    const csv = buildReadableCsv(fuelMixAgentResult(), "fuel mix");
    expect(csv).toContain("Fuel Type");
    expect(csv).toContain("Generation (MW)");
    expect(csv).toContain("Interval");
    expect(csv).toContain("Coal");
    expect(csv).toContain("29791");
    expect(csv).toContain("# Total Generation (MW)");
    expect(csv).toContain("83847");
    expect(csv).not.toContain("FUEL_CATEGORY");
    expect(csv).not.toContain("fuelType");
  });
});
