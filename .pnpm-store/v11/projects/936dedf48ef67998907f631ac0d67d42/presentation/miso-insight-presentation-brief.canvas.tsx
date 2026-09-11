import {
  BarChart,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useHostTheme,
  useState,
} from "cursor/canvas";

const pricingEndpoints = [
  ["Aggregated Pnode", "/pricing/v1/aggregated-pnode", "—"],
  ["Day-Ahead Ex-Ante LMP", "/pricing/v1/day-ahead/{date}/lmp-exante", "date"],
  ["Day-Ahead Ex-Ante MCP", "/pricing/v1/day-ahead/{date}/asm-exante", "date"],
  ["Day-Ahead Ex-Post LMP", "/pricing/v1/day-ahead/{date}/lmp-expost", "date"],
  ["Day-Ahead Ex-Post MCP", "/pricing/v1/day-ahead/{date}/asm-expost", "date"],
  ["Real-Time Ex-Ante LMP", "/pricing/v1/real-time/{date}/lmp-exante", "date"],
  ["Real-Time Ex-Ante MCP", "/pricing/v1/real-time/{date}/asm-exante", "date"],
  ["Real-Time Ex-Post LMP", "/pricing/v1/real-time/{date}/lmp-expost", "date"],
  ["Real-Time Ex-Post MCP", "/pricing/v1/real-time/{date}/asm-expost", "date"],
  ["Real-Time MCP Summary", "/pricing/v1/real-time/{date}/asm-summary", "date"],
] as const;

const operationsEndpoints = [
  ["Actual Load", "/lgi/v1/real-time/{date}/demand/actual", "date"],
  ["Day-Ahead Cleared Demand", "/lgi/v1/day-ahead/{date}/demand", "date"],
  [
    "Day-Ahead Cleared Generation, Physical",
    "/lgi/v1/day-ahead/{date}/generation/cleared/physical",
    "date",
  ],
  [
    "Day-Ahead Cleared Generation, Virtual",
    "/lgi/v1/day-ahead/{date}/generation/cleared/virtual",
    "date",
  ],
  [
    "Day-Ahead Generation Fuel Type",
    "/lgi/v1/day-ahead/{date}/generation/fuel-type",
    "date",
  ],
  [
    "Day-Ahead Net Scheduled Interchange",
    "/lgi/v1/day-ahead/{date}/interchange/net-scheduled",
    "date",
  ],
  [
    "Day-Ahead Offered Generation ECOMAX",
    "/lgi/v1/day-ahead/{date}/generation/offered/ecomax",
    "date",
  ],
  [
    "Day-Ahead Offered Generation ECOMIN",
    "/lgi/v1/day-ahead/{date}/generation/offered/ecomin",
    "date",
  ],
  [
    "Historical Net Scheduled Interchange",
    "/lgi/v1/historical/{date}/interchange/net-scheduled",
    "date",
  ],
  ["Medium Term Load Forecast", "/lgi/v1/forecast/{date}/load", "date"],
  ["Outage Forecast", "/lgi/v1/forecast/{date}/outage", "date"],
  [
    "Real-Time Binding Constraints",
    "/lgi/v1/real-time/{date}/binding-constraint",
    "date",
  ],
  [
    "Real-Time Cleared Demand",
    "/lgi/v1/real-time/{date}/demand/forecast",
    "date",
  ],
  [
    "Real-Time Cleared Generation",
    "/lgi/v1/real-time/{date}/generation/cleared/supply",
    "date",
  ],
  [
    "Real-Time Committed Generation, ECOMAX",
    "/lgi/v1/real-time/{date}/generation/committed/ecomax",
    "date",
  ],
  [
    "Real-Time Generation Fuel Type",
    "/lgi/v1/real-time/{date}/generation/fuel-type",
    "date",
  ],
  [
    "Real-Time Generation Fuel-on-the-Margin",
    "/lgi/v1/real-time/{date}/generation/fuel-on-the-margin",
    "date",
  ],
  [
    "Real-Time Net Actual Interchange",
    "/lgi/v1/real-time/{date}/interchange/net-actual",
    "date",
  ],
  [
    "Real-Time Net Scheduled Interchange",
    "/lgi/v1/real-time/{date}/interchange/net-scheduled",
    "date",
  ],
  [
    "Real-Time Offered Generation, ECOMAX",
    "/lgi/v1/real-time/{date}/generation/offered/ecomax",
    "date",
  ],
  ["Real-Time Outages", "/lgi/v1/real-time/{date}/outage", "date"],
  [
    "Real-Time State Estimator Load",
    "/lgi/v1/real-time/{date}/demand/load-state-estimator",
    "date",
  ],
] as const;

const features = [
  [
    "Data discovery",
    "Landing-page API groups, searchable directory, contextual “Ask MISO AI”, API-first routing",
    "Users find pricing, load, generation, interchange, forecast, and outage data without knowing an endpoint.",
  ],
  [
    "Guided MISO chat",
    "Natural-language resolver, conversation continuity after sign-in, parameter form, request timeline",
    "The chat asks for every missing required input before data is requested.",
  ],
  [
    "In-app API documentation",
    "Redesigned MISO documentation route, operation detail, request examples, authentication and pagination guidance",
    "A documentation link opens a readable app-native operation page, while preserving the official source link.",
  ],
  [
    "Reports and migration",
    "Searchable legacy report library, official links, report-to-API mappings, API-first recommendation",
    "Older reports remain searchable; recurring structured use is guided to the replacement API.",
  ],
  [
    "Results and visualization",
    "Structured metrics, tables, chart viewer, CSV download, source indicators",
    "A non-technical question can return a chart or direct official file link instead of an endpoint dump.",
  ],
  [
    "Subscription-key safety",
    "MISO portal handoff, backend secret boundary, non-secret key references, per-user access controls",
    "The app never accepts, displays, downloads, or stores raw subscription-key material.",
  ],
  [
    "Local coding agent",
    "Downloadable agent plan, selected environment-variable name, local sandbox and review instructions",
    "A developer can apply a reviewed server-side integration in their own repository.",
  ],
  [
    "Integration lab",
    "Six external-user personas, web-chat ↔ agent transcript, deterministic gateway simulation, 505 recovery",
    "Teams can prove a workflow and troubleshoot safely before production.",
  ],
] as const;

const stack = [
  [
    "Application",
    "TypeScript, React 19, TanStack Start, TanStack Router, TanStack Query",
    "Typed SPA/SSR experience, routes, server functions, and client state.",
  ],
  [
    "Data and identity",
    "Supabase Auth, Postgres, row-level security",
    "Sign-in, conversations, preferences, and user-scoped non-secret credential references.",
  ],
  [
    "AI orchestration",
    "AI SDK, OpenAI-compatible provider, catalog resolver",
    "Classifies questions, resolves the MISO operation, requests missing parameters, and returns structured results.",
  ],
  [
    "MISO integration",
    "Server-only gateway, catalog metadata, Zod validation, retry/error classifier",
    "Builds validated requests; keeps MISO credentials in server environment variables.",
  ],
  [
    "Frontend experience",
    "Recharts, Lucide, Sonner, responsive UI components",
    "Charts, API views, notifications, results, and accessible user interactions.",
  ],
  [
    "Local-agent handoff",
    "Generated ESM script using @cursor/sdk",
    "Applies the approved endpoint plan to a user-selected local backend with sandbox and review enabled.",
  ],
  [
    "Build and validation",
    "Vite, Nitro/Cloudflare output, Vitest, browser workflow simulation",
    "Production build plus deterministic API, error, and agent-conversation validation.",
  ],
] as const;

const process = [
  [
    "1",
    "Question",
    "Trader, planner, or developer asks for MISO data or a backend connection.",
  ],
  [
    "2",
    "Resolve",
    "The chat maps intent to a checked-in MISO catalog operation or a legacy report reference.",
  ],
  [
    "3",
    "Collect",
    "Required values such as date, node, region, or resolution are requested immediately.",
  ],
  [
    "4",
    "Validate",
    "Catalog validation runs before the server gateway; invalid or incomplete requests pause safely.",
  ],
  [
    "5",
    "Execute",
    "The backend calls MISO in live mode or produces deterministic simulated data in the Integration Lab.",
  ],
  [
    "6",
    "Deliver",
    "The user receives metrics, table, chart, CSV, official file link, code plan, or safe error guidance.",
  ],
] as const;

export default function MisoInsightPresentationBrief() {
  const theme = useHostTheme();
  const [view, setView] = useState<
    "story" | "features" | "endpoints" | "stack"
  >("story");
  const [endpointGroup, setEndpointGroup] = useState<"pricing" | "operations">(
    "pricing",
  );

  return (
    <Stack gap={20} style={{ maxWidth: 1240, margin: "0 auto", padding: 24 }}>
      <Stack gap={8}>
        <Text size="small" tone="tertiary" weight="semibold">
          PRESENTATION BRIEF · MISO INSIGHT / MISO AI
        </Text>
        <H1>MISO AI: from a question to a production-safe MISO workflow</H1>
        <Text tone="secondary" style={{ maxWidth: 860 }}>
          A presentation-ready breakdown of what is implemented, how the data
          and agent workflows operate, and which MISO endpoints and technical
          tools support the experience.
        </Text>
        <Text size="small" tone="tertiary">
          Build source: checked-in MISO catalog and application code · Endpoint
          directory verified against the official MISO Data Exchange API list on
          September 9, 2026.
        </Text>
      </Stack>

      <Row gap={12} wrap>
        <Stat value="32" label="catalog-backed GET operations" tone="info" />
        <Stat value="10 / 22" label="pricing / operational endpoints" />
        <Stat
          value="6"
          label="external-user personas simulated"
          tone="success"
        />
        <Stat value="37" label="automated tests passing" tone="success" />
      </Row>

      <Callout tone="info" title="One-sentence presentation message">
        MISO AI makes MISO market and operational data easier to find, safer to
        integrate, and simpler to move from legacy reports into durable API
        workflows.
      </Callout>

      <Row gap={8} wrap>
        <Pill active={view === "story"} onClick={() => setView("story")}>
          Presentation narrative
        </Pill>
        <Pill active={view === "features"} onClick={() => setView("features")}>
          Feature map
        </Pill>
        <Pill
          active={view === "endpoints"}
          onClick={() => setView("endpoints")}
        >
          Endpoint catalog
        </Pill>
        <Pill active={view === "stack"} onClick={() => setView("stack")}>
          Tools and controls
        </Pill>
      </Row>

      {view === "story" && (
        <Stack gap={18}>
          <H2>Recommended presentation flow</H2>
          <Grid columns="repeat(3, minmax(0, 1fr))" gap={12}>
            {process.map(([number, title, copy]) => (
              <div
                key={number}
                style={{
                  borderTop: `2px solid ${theme.accent.primary}`,
                  paddingTop: 10,
                  minHeight: 118,
                }}
              >
                <Text size="small" tone="tertiary" weight="semibold">
                  STEP {number}
                </Text>
                <H3 style={{ marginTop: 5 }}>{title}</H3>
                <Text size="small" tone="secondary" style={{ marginTop: 5 }}>
                  {copy}
                </Text>
              </div>
            ))}
          </Grid>

          <Grid columns="1.2fr 0.8fr" gap={18} align="start">
            <Stack gap={10}>
              <H2>What the user sees</H2>
              <Text tone="secondary">
                The landing experience keeps the familiar Data Exchange purpose:
                Pricing and Load, Generation & Interchange. Users can search the
                catalog, open reworked in-app docs, or start a chat with the
                chosen API already in context.
              </Text>
              <Text tone="secondary">
                The chat does not repeat an unrelated previous result. It keeps
                relevant data context, asks for missing parameters, and can
                return a chart, data table, CSV, API request plan, or official
                legacy report link.
              </Text>
              <Text tone="secondary">
                For developers, the flow is deliberately secret-safe: MISO
                handles subscription issuance; the backend owns the secret; the
                application and downloadable local agent know only a reference
                label and environment-variable name.
              </Text>
            </Stack>
            <Card>
              <CardHeader
                trailing={
                  <Text size="small" tone="tertiary">
                    Live + simulated modes
                  </Text>
                }
              >
                Confidence controls
              </CardHeader>
              <CardBody>
                <Stack gap={10}>
                  <Text size="small">
                    <Text weight="semibold">Time:</Text> Eastern Prevailing Time
                    with API-provided UTC offset retained for fall clock
                    changes.
                  </Text>
                  <Text size="small">
                    <Text weight="semibold">Pagination:</Text> response metadata
                    drives complete-page retrieval rather than silently
                    returning a partial extract.
                  </Text>
                  <Text size="small">
                    <Text weight="semibold">HTTP 505:</Text> classified as a
                    protocol issue; the agent stops blind retries and gives safe
                    proxy/TLS diagnostics.
                  </Text>
                  <Text size="small">
                    <Text weight="semibold">Secrets:</Text> raw subscription
                    keys are never accepted in the web chat, browser storage,
                    agent file, code, or logs.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>

          <Divider />
          <Grid columns="1fr 1fr" gap={18} align="start">
            <Stack gap={6}>
              <H2>Who it serves</H2>
              <Text tone="secondary">
                Market participants and traders; transmission owners;
                interconnection customers; reliability-service recipients and
                data providers; operations planners; and backend integrators.
              </Text>
            </Stack>
            <Stack gap={6}>
              <H2>Evidence demonstrated</H2>
              <Text tone="secondary">
                Browser simulations covered subscription-key portal handoff,
                secure local-agent setup, parameter collection, a complete
                backend-integrator flow, and the simulated HTTP 505 recovery
                path.
              </Text>
            </Stack>
          </Grid>
        </Stack>
      )}

      {view === "features" && (
        <Stack gap={14}>
          <H2>Feature map</H2>
          <Text tone="secondary">
            Use this page as the product-demo agenda: each line maps a
            user-visible capability to the benefit it creates.
          </Text>
          <Table
            headers={[
              "Feature area",
              "Implemented capability",
              "Presentation value",
            ]}
            rows={features.map(([area, capability, value]) => [
              <Text weight="semibold">{area}</Text>,
              <Text size="small">{capability}</Text>,
              <Text size="small" tone="secondary">
                {value}
              </Text>,
            ])}
            striped
            stickyHeader
          />
          <Text size="small" tone="tertiary">
            Source: MISO Insight application routes, UI components, server
            functions, and test suite · current build.
          </Text>
        </Stack>
      )}

      {view === "endpoints" && (
        <Stack gap={16}>
          <H2>Endpoint catalog</H2>
          <Text tone="secondary">
            All cataloged data operations are GET endpoints. Gateway base:{" "}
            <Code>https://apim.misoenergy.org</Code>. Authentication is sent
            server-side as <Code>Ocp-Apim-Subscription-Key</Code>; the value is
            supplied at runtime from <Code>MISO_SUBSCRIPTION_KEY</Code>.
          </Text>

          <Grid columns="0.65fr 1.35fr" gap={18} align="start">
            <Stack gap={10}>
              <H3>Catalog coverage</H3>
              <Text size="small" tone="secondary">
                Y-axis: catalog operation count · X-axis: MISO API product
              </Text>
              <BarChart
                categories={["Pricing API", "Load / Gen / Interchange API"]}
                series={[
                  { name: "Catalog operations", data: [10, 22], tone: "info" },
                ]}
                height={240}
                showValues
              />
              <Text size="small" tone="tertiary">
                Source: checked-in MISO catalog, 32 operations total.
              </Text>
              <Callout tone="warning" title="Important presentation note">
                Individual operations have optional query parameters in addition
                to the path parameter shown. The app reads these from catalog
                metadata, validates them, and asks for values when needed.
              </Callout>
            </Stack>
            <Stack gap={10}>
              <Row gap={8} wrap>
                <Button
                  variant={
                    endpointGroup === "pricing" ? "primary" : "secondary"
                  }
                  onClick={() => setEndpointGroup("pricing")}
                >
                  Pricing API · 10
                </Button>
                <Button
                  variant={
                    endpointGroup === "operations" ? "primary" : "secondary"
                  }
                  onClick={() => setEndpointGroup("operations")}
                >
                  Load, generation & interchange · 22
                </Button>
              </Row>
              <Table
                headers={[
                  "Operation",
                  "GET path (append to gateway base)",
                  "Required path input",
                ]}
                rows={(endpointGroup === "pricing"
                  ? pricingEndpoints
                  : operationsEndpoints
                ).map(([name, path, required]) => [
                  <Text size="small" weight="semibold">
                    {name}
                  </Text>,
                  <Code>{path}</Code>,
                  <Code>{required}</Code>,
                ])}
                striped
                stickyHeader
              />
              <Text size="small" tone="tertiary">
                Source: MISO Insight checked-in catalog. Official directory:{" "}
                <Link href="https://data-exchange.misoenergy.org/apis">
                  MISO Data Exchange APIs
                </Link>
                .
              </Text>
            </Stack>
          </Grid>
        </Stack>
      )}

      {view === "stack" && (
        <Stack gap={16}>
          <H2>Tools, architecture, and operational controls</H2>
          <Table
            headers={["Layer", "Tools used", "Role in the process"]}
            rows={stack.map(([layer, tools, purpose]) => [
              <Text weight="semibold">{layer}</Text>,
              <Text size="small">{tools}</Text>,
              <Text size="small" tone="secondary">
                {purpose}
              </Text>,
            ])}
            striped
            stickyHeader
          />
          <Grid columns="1fr 1fr" gap={18} align="start">
            <Card>
              <CardHeader>Secure credential flow</CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text size="small">
                    1. User creates or manages the real subscription in the
                    authenticated MISO Data Exchange portal.
                  </Text>
                  <Text size="small">
                    2. User places the secret in their backend deployment
                    environment.
                  </Text>
                  <Text size="small">
                    3. MISO AI saves only a user-scoped non-secret label and
                    environment-variable name.
                  </Text>
                  <Text size="small">
                    4. The local coding agent receives an approved API plan plus
                    the environment-variable name and generates server-only code
                    for review.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Failure and quality controls</CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text size="small">
                    Catalog validation blocks incomplete calls; pagination and
                    market-time rules are attached to the request plan.
                  </Text>
                  <Text size="small">
                    HTTP errors are classified. HTTP 505 triggers protocol
                    guidance and no blind retry.
                  </Text>
                  <Text size="small">
                    The Integration Lab uses deterministic data, does not read
                    credentials, and never sends a live MISO request.
                  </Text>
                  <Text size="small">
                    Current evidence: 37 Vitest tests pass and the Vite/Nitro
                    production build completes.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>
          <Text size="small" tone="tertiary">
            External platform source:{" "}
            <Link href="https://data-exchange.misoenergy.org/products">
              MISO Data Exchange products
            </Link>{" "}
            and{" "}
            <Link href="https://data-exchange.misoenergy.org/profile">
              MISO user subscriptions
            </Link>
            .
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
