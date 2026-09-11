/**
 * Shared contract between the AI orchestration layer, the MISO clients and the UI.
 * The UI renders itself dynamically from `MisoResponse` — never from hardcoded data.
 */

export type SourceType = "api" | "report" | "dataset" | "webpage" | "document";

export type MisoParamType =
  "string" | "integer" | "number" | "boolean" | "date" | "datetime" | "enum" | "array" | "object";

export interface MisoParameterSpec {
  name: string;
  label: string;
  type: MisoParamType;
  required: boolean;
  description: string;
  options?: string[];
  example?: string;
  in?: "path" | "query";
}

/**
 * Pagination is driven by the response metadata that MISO returns with each page.
 * MISO's current catalog documents the page number and the response fields, but not
 * a fixed request page size, so `page_size` is populated only when MISO returns it.
 */
export interface MisoPaginationSpec {
  supported: true;
  param_name: string;
  page_size?: number;
  page_info_path: string;
  page_size_path: string;
  total_pages_path: string;
  last_page_path: string;
}

export interface MisoSource {
  source_id: string;
  name: string;
  type: SourceType;
  description: string;
  supports: string[];
  requires_authentication: boolean;
  supports_api_generation: boolean;
  supports_visualization: boolean;
  pagination?: MisoPaginationSpec;
  endpoint?: string;
  method?: "GET" | "POST";
  parameters?: MisoParameterSpec[];
  documentation_url?: string;
  value_label?: string;
  unit?: string;
}

export type OutputMode =
  "answer" | "metric" | "table" | "chart" | "csv" | "api" | "report" | "clarify";

export interface IntentEnvelope {
  type: "retrieve_data" | "api_request" | "find_report" | "explain" | "clarify";
  confidence: number;
  summary: string;
}

export interface OutputPlan {
  mode: OutputMode;
  include_api: boolean;
  include_chart: boolean;
  include_table: boolean;
  include_download: boolean;
}

export type StepStatus = "success" | "error" | "skipped" | "pending";

export interface ExecutionStep {
  label: string;
  detail: string;
  status: StepStatus;
}

export interface DataSeries {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  unit?: string | undefined;
  x_key?: string | undefined;
  y_key?: string | undefined;
}

export interface MetricValue {
  label: string;
  value: string;
  sub?: string;
}

export interface ApiRequestSpec {
  name: string;
  method: string;
  url: string;
  parameters: { key: string; value: string; required: boolean }[];
  headers: { key: string; value: string }[];
  auth_note: string;
  timezone_note: string;
  reliability_note: string;
  pagination?: MisoPaginationSpec & { total_pages?: number };
  examples: { language: "cURL" | "Python" | "JavaScript"; code: string }[];
}

export interface ReportRef {
  title: string;
  published: string;
  format: string;
  description: string;
  url: string;
}

export interface MisoError {
  message: string;
  reason: string;
  technical: string;
  fixable: boolean;
  missing_parameters: string[];
}

export type AccessPolicyCategory = "public" | "portal" | "internal" | "personal" | "business";

export interface AccessPolicyDecision {
  category: AccessPolicyCategory;
  requestable: boolean;
}

export interface AccessRequest {
  category: Exclude<AccessPolicyCategory, "public">;
  status: "draft" | "sent";
  subject?: string;
  body?: string;
  recipient?: string;
  timeline: string;
}

export type ResolutionStatus =
  | "resolved"
  | "needs_parameters"
  | "validation_error"
  | "ambiguous"
  | "needs_clarification"
  | "success"
  | "api_error"
  | "no_data";

export type PipelineNodeStatus = "valid" | "invalid" | "unresolved" | "completed" | "pending";

export interface PipelineNode {
  id: string;
  title: string;
  status: PipelineNodeStatus;
  detail?: string;
}

export interface ParameterDetail {
  name: string;
  value: string;
  source: "trained_miso_metadata" | "user_message" | "conversation" | "catalog_default";
  confidence: number;
  required: boolean;
  status: "valid" | "invalid" | "unresolved";
  error?: string | null;
}

export interface RequestMetadata {
  source: "MISO";
  dataset: string;
  endpoint: string;
  method: string;
  parameters: Record<string, string>;
  validation: { status: "passed" | "failed" | "pending" };
  execution: { status: string; timestamp: string };
}

export interface MisoResolution {
  status: ResolutionStatus;
  intent: string;
  dataset?: string;
  api?: string;
  source_id?: string;
  parameters: Record<string, string>;
  known_parameters: Record<string, string>;
  missing_parameters: { name: string; question: string }[];
  parameter_details: ParameterDetail[];
  validation: {
    status: "passed" | "failed" | "pending";
    errors?: { parameter: string; provided: string; expected?: string[]; message: string }[];
  };
  options?: { dataset: string; description: string; source_id: string }[];
  pipeline: PipelineNode[];
  request?: { method: string; endpoint: string; query: Record<string, string> };
  reason?: string;
}

export interface MisoResponse {
  request_id: string;
  intent: IntentEnvelope;
  source: {
    id: string;
    name: string;
    type: SourceType;
    description: string;
  } | null;
  parameters: Record<string, string>;
  execution: {
    status: "success" | "error" | "needs_clarification" | "needs_auth";
    steps: ExecutionStep[];
    duration_ms: number;
  };
  output: OutputPlan;
  title?: string;
  answer: string;
  explanation: string;
  metrics?: MetricValue[];
  data?: DataSeries;
  api?: ApiRequestSpec;
  report?: ReportRef;
  clarification?: string;
  error?: MisoError;
  resolution?: MisoResolution;
  request_metadata?: RequestMetadata;
  api_nudge?: {
    message: string;
    cta_label: string;
    ask: string;
  };
  access_request?: AccessRequest;
}
