import { createFileRoute } from "@tanstack/react-router";

import { ReportLibrary } from "@/components/miso/ReportLibrary";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Report Library — MISO AI" },
      {
        name: "description",
        content:
          "Search official MISO report references, archives, and API replacement mappings in one place.",
      },
    ],
  }),
  component: ReportLibrary,
});
