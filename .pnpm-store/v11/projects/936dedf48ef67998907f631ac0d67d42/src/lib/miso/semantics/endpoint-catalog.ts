import type { EndpointSemanticMeta } from "./types";

/**
 * Explicit semantic metadata keyed by backend catalog endpoint IDs.
 * Highest-confidence source of meaning — never invent units/fields here.
 */
export const ENDPOINT_SEMANTIC_CATALOG: Record<string, EndpointSemanticMeta> = {
  realtime_generation_fuel_type: {
    endpointId: "realtime_generation_fuel_type",
    semanticType: "categorical_comparison",
    fields: {
      category: "fuelType",
      value: "value",
      timestamp: "interval",
      // Authoritative total lives on the payload envelope as totalMW (string|number).
      total: "totalMW",
    },
    labels: {
      category: "Fuel Type",
      value: "Generation",
      timestamp: "Interval",
    },
    unit: "MW",
    defaultVisualization: "horizontal_bar",
    hideFields: ["label", "region", "marketDate"],
  },
  actual_load: {
    endpointId: "actual_load",
    semanticType: "time_series",
    fields: {
      value: "value",
      timestamp: "interval",
      location: "region",
    },
    labels: {
      value: "Load",
      timestamp: "Interval",
    },
    unit: "MW",
    defaultVisualization: "line",
  },
  realtime_lmp: {
    endpointId: "realtime_lmp",
    semanticType: "time_series",
    fields: {
      value: "value",
      timestamp: "interval",
      location: "node",
    },
    labels: {
      value: "LMP",
      timestamp: "Interval",
    },
    unit: "$/MWh",
    defaultVisualization: "line",
  },
  day_ahead_lmp: {
    endpointId: "day_ahead_lmp",
    semanticType: "time_series",
    fields: {
      value: "value",
      timestamp: "interval",
      location: "node",
    },
    labels: {
      value: "LMP",
      timestamp: "Interval",
    },
    unit: "$/MWh",
    defaultVisualization: "line",
  },
  day_ahead_demand: {
    endpointId: "day_ahead_demand",
    semanticType: "time_series",
    fields: {
      value: "value",
      timestamp: "interval",
      location: "region",
    },
    labels: {
      value: "Demand",
      timestamp: "Interval",
    },
    unit: "MW",
    defaultVisualization: "line",
  },
  load_forecast: {
    endpointId: "load_forecast",
    semanticType: "time_series",
    fields: {
      value: "value",
      timestamp: "interval",
      location: "region",
    },
    labels: {
      value: "Forecast load",
      timestamp: "Interval",
    },
    unit: "MW",
    defaultVisualization: "line",
  },
};

export function getEndpointSemanticMeta(endpointId: string | undefined): EndpointSemanticMeta | undefined {
  if (!endpointId) return undefined;
  return ENDPOINT_SEMANTIC_CATALOG[endpointId];
}
