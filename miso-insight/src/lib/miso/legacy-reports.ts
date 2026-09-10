import type { MisoSource } from "./types";

export type LegacyReportCategory = "Pricing" | "Load & generation" | "Guidance" | "Archive";

export interface LegacyReport {
  source_id: string;
  title: string;
  category: LegacyReportCategory;
  format: "PDF" | "Web page";
  description: string;
  url: string;
  search_terms: string[];
  api_replacement?: {
    source_id: string;
    name: string;
  };
}

const MARKET_REPORTS_URL =
  "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/";

/**
 * Searchable, curated references to MISO's legacy report paths. These are
 * references and reader guides—not copied report data—so the app can direct a
 * user to the official file while preferring the structured Data Exchange API
 * for ongoing retrieval.
 */
export const LEGACY_REPORTS: LegacyReport[] = [
  {
    source_id: "legacy_report_to_endpoint_mapping",
    title: "Report-to-Endpoint Mapping",
    category: "Guidance",
    format: "PDF",
    description:
      "Official mapping of historical market reports to their MISO Data Exchange API replacements.",
    url: "https://cdn.misoenergy.org/Data%20Exchange%20Report%20to%20Endpoint%20Mapping726669.pdf?v=20251107140821",
    search_terms: [
      "report mapping",
      "api replacement",
      "migration",
      "transition",
      "endpoint mapping",
    ],
  },
  {
    source_id: "legacy_retired_market_reports",
    title: "List of Retired Market Reports",
    category: "Guidance",
    format: "PDF",
    description:
      "MISO's list of retired or transitioning market reports, with Data Exchange migration guidance.",
    url: "https://cdn.misoenergy.org/List%20of%20Retired%20Market%20Reports764384.pdf",
    search_terms: ["retired reports", "retired", "legacy migration", "report transition"],
  },
  {
    source_id: "legacy_market_report_archive",
    title: "Market Report Archives",
    category: "Archive",
    format: "Web page",
    description:
      "Official MISO archive for previously published market-report material and retained files.",
    url: "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-report-archives/",
    search_terms: ["archive", "archived report", "old report", "older report", "historical report"],
  },
  {
    source_id: "legacy_day_ahead_pricing_report",
    title: "Day-Ahead Pricing Report Reader’s Guide",
    category: "Pricing",
    format: "PDF",
    description:
      "Reader’s guide for the legacy day-ahead pricing report and the terms used in that report.",
    url: "https://docs.misoenergy.org/marketreports/Day-Ahead%20Pricing_Day-Ahead%20Pricing%20Report%20Readers%20Guide.pdf",
    search_terms: [
      "day ahead pricing report",
      "da pricing",
      "historical lmp",
      "day ahead lmp",
      "reader guide",
    ],
    api_replacement: {
      source_id: "get-v1-day-ahead-date-lmp-expost",
      name: "Day-Ahead Ex-Post LMP",
    },
  },
  {
    source_id: "legacy_real_time_pricing_report",
    title: "Real-Time Pricing Report Reader’s Guide",
    category: "Pricing",
    format: "PDF",
    description:
      "Reader’s guide for the legacy real-time pricing report, including real-time price terminology.",
    url: "https://docs.misoenergy.org/marketreports/Real-Time%20Pricing%20Report_Real-Time%20Pricing%20Report%20Readers%20Guide.pdf",
    search_terms: [
      "real time pricing report",
      "rt pricing",
      "real time lmp",
      "lmp report",
      "reader guide",
    ],
    api_replacement: {
      source_id: "get-v1-real-time-date-lmp-expost",
      name: "Real-Time Ex-Post LMP",
    },
  },
  {
    source_id: "legacy_daily_forecast_actual_load_lrz",
    title: "Daily Forecast and Actual Load by Local Resource Zone",
    category: "Load & generation",
    format: "PDF",
    description:
      "Reader’s guide for the legacy daily forecast and actual-load report by local resource zone.",
    url: "https://docs.misoenergy.org/marketreports/Daily%20Forecast%20and%20Actual%20Load%20by%20Local%20Resource%20Zone_Daily%20Forecast%20and%20Actual%20Load%20Report%20by%20Local%20Resource%20Zone%20Report%20Readers%20Guide.pdf",
    search_terms: [
      "daily forecast actual load",
      "actual load report",
      "local resource zone",
      "lrz",
      "historical load report",
    ],
    api_replacement: {
      source_id: "get-v1-real-time-date-demand-actual",
      name: "Actual Load",
    },
  },
  {
    source_id: "legacy_market_reports_home",
    title: "Active Market Reports",
    category: "Archive",
    format: "Web page",
    description:
      "MISO’s active market-report directory, including reader guides and links to retained report materials.",
    url: MARKET_REPORTS_URL,
    search_terms: [
      "market reports",
      "market report",
      "daily report",
      "report directory",
      "older reports",
    ],
  },
];

export function legacyReportBySourceId(sourceId: string): LegacyReport | undefined {
  return LEGACY_REPORTS.find((report) => report.source_id === sourceId);
}

export function searchLegacyReports(query: string): LegacyReport[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return LEGACY_REPORTS;
  const words = normalized.split(/\s+/).filter(Boolean);
  return LEGACY_REPORTS.filter((report) => {
    const haystack = [report.title, report.category, report.description, ...report.search_terms]
      .join(" ")
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

export const LEGACY_REPORT_SOURCES: MisoSource[] = LEGACY_REPORTS.map((report) => ({
  source_id: report.source_id,
  name: report.title,
  type: "report",
  description: report.description,
  supports: report.search_terms,
  requires_authentication: false,
  supports_api_generation: false,
  supports_visualization: false,
  documentation_url: report.url,
  parameters: [],
}));
