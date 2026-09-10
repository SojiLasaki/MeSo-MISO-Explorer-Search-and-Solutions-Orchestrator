import { createFileRoute, Link } from "@tanstack/react-router";

import { ApiDocumentation } from "@/components/miso/ApiDocumentation";
import { CATALOG_OPERATIONS } from "@/lib/miso/catalog";

export const Route = createFileRoute("/api-docs/$sourceId")({
  component: ApiDocumentationRoute,
});

function ApiDocumentationRoute() {
  const { sourceId } = Route.useParams();
  const operation = CATALOG_OPERATIONS.find((candidate) => candidate.source_id === sourceId);

  if (!operation) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
        <div>
          <p className="text-[20px] font-medium">That API was not found.</p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Return to the directory and choose an API from the current MISO catalog.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Back to MISO AI
          </Link>
        </div>
      </main>
    );
  }

  return <ApiDocumentation operation={operation} />;
}
