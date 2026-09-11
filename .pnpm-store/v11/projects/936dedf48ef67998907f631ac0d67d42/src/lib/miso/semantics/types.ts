/**
 * Semantic visualization types for turning MISO API payloads into
 * human-readable infographics without inventing fields or units.
 */

export type SemanticFieldRole =
  | "dimension"
  | "measure"
  | "time"
  | "location"
  | "identifier"
  | "metadata";

export type SemanticDataType = "string" | "number" | "datetime";

export type SemanticType =
  | "categorical_comparison"
  | "composition"
  | "time_series"
  | "multi_time_series"
  | "ranking"
  | "single_metric"
  | "geographic"
  | "events"
  | "generic_table";

export type VisualizationType =
  | "metric"
  | "horizontal_bar"
  | "vertical_bar"
  | "line"
  | "multi_line"
  | "donut"
  | "comparison"
  | "table"
  | "map"
  | "timeline";

export interface SemanticField {
  name: string;
  label: string;
  role: SemanticFieldRole;
  unit?: string;
  dataType?: SemanticDataType;
}

export interface SemanticDataset {
  title?: string;
  endpointId?: string;
  semanticType: SemanticType;
  rows: Record<string, unknown>[];
  fields: SemanticField[];
  metadata?: {
    timestamp?: string;
    total?: number;
    unit?: string;
    source?: string;
    confidence?: "catalog" | "inferred" | "low";
  };
}

export interface VisualizationMetric {
  label: string;
  value: string | number;
  unit?: string;
  helperText?: string;
}

export interface VisualizationPlan {
  type: VisualizationType;
  title: string;
  subtitle?: string;
  categoryField?: string;
  valueField?: string;
  timeField?: string;
  unit?: string;
  sort?: "asc" | "desc";
  highlightValues?: string[];
  metrics?: VisualizationMetric[];
  insight?: string;
  /** When true, donut/composition may include percentage of authoritative total. */
  useAuthoritativeTotal?: boolean;
}

export interface EndpointSemanticMeta {
  endpointId: string;
  semanticType: SemanticType;
  /** Maps logical roles → row field names after agent normalization (or raw keys). */
  fields: {
    category?: string;
    value?: string;
    timestamp?: string;
    total?: string;
    location?: string;
  };
  labels: {
    category?: string;
    value?: string;
    timestamp?: string;
  };
  unit?: string;
  defaultVisualization: VisualizationType;
  /** Row keys to omit from the semantic table (redundant with other columns). */
  hideFields?: string[];
}
