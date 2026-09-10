import { createFileRoute } from "@tanstack/react-router";

import { WebDataAgent } from "@/components/miso/WebDataAgent";
import { CATALOG_OPERATIONS } from "@/lib/miso/catalog";
import { legacyReportBySourceId } from "@/lib/miso/legacy-reports";
import { getSource } from "@/lib/miso/registry";

export const Route = createFileRoute("/integration-lab")({
  validateSearch: (search: Record<string, unknown>) => ({
    report: typeof search.report === "string" ? search.report : undefined,
    api: typeof search.api === "string" ? search.api : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Integration Lab — MISO AI" },
      {
        name: "description",
        content:
          "Simulate secure, catalog-backed MISO backend integrations for traders, utilities, interconnection customers, and reliability teams.",
      },
    ],
  }),
  component: IntegrationLabRoute,
});

function IntegrationLabRoute() {
  const { report: reportId, api: apiId } = Route.useSearch();
  const report = reportId ? legacyReportBySourceId(reportId) : undefined;
  const replacement = report?.api_replacement ? getSource(report.api_replacement.source_id) : undefined;
  const initialApi = apiId ? CATALOG_OPERATIONS.find((operation) => operation.source_id === apiId) : undefined;
  return (
    <WebDataAgent
      initialApi={initialApi}
      initialReport={report ? {
        sourceId: report.source_id,
        title: report.title,
        description: report.description,
        url: report.url,
        apiReplacement: replacement?.name,
        apiReplacementSourceId: report.api_replacement?.source_id,
        endpoint: replacement?.endpoint,
        method: replacement?.method,
        requiredParameters: (replacement?.parameters ?? []).filter((parameter) => parameter.required).map((parameter) => parameter.name),
      } : undefined}
    />
  );
}
