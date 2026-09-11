import { applyParamsToEndpoint, CATALOG_META } from "./catalog";
import { MISO_TIMESTAMP_NOTE } from "./dates";
import { MISO_RELIABILITY_GUIDANCE } from "./api-errors";
import type { ApiRequestSpec, MisoPaginationSpec, MisoSource } from "./types";

export const SUBSCRIPTION_KEY_PLACEHOLDER = "YOUR_MISO_SUBSCRIPTION_KEY";

export interface BuiltMisoRequest {
  method: string;
  endpoint: string;
  url: string;
  query: Record<string, string>;
  path: Record<string, string>;
  headers: { key: string; value: string }[];
}

function queryParams(source: MisoSource, params: Record<string, string>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const spec of source.parameters ?? []) {
    if (spec.in !== "query") continue;
    const value = params[spec.name];
    if (value) query[spec.name] = value;
  }
  return query;
}

function pathParams(source: MisoSource, params: Record<string, string>): Record<string, string> {
  const path: Record<string, string> = {};
  for (const spec of source.parameters ?? []) {
    if (spec.in !== "path") continue;
    const value = params[spec.name];
    if (value) path[spec.name] = value;
  }
  return path;
}

/** Build the HTTP request. Auth placeholders only — never the live subscription key. */
export function buildMisoRequest(
  source: MisoSource,
  params: Record<string, string>,
): BuiltMisoRequest {
  const url =
    source.type === "api" && source.endpoint
      ? applyParamsToEndpoint(source, params)
      : (source.endpoint ?? "");
  const parsed = url.includes("://") ? new URL(url) : null;
  return {
    method: source.method ?? "GET",
    endpoint: parsed ? `${parsed.origin}${parsed.pathname}` : (url.split("?")[0] ?? url),
    url,
    query: queryParams(source, params),
    path: pathParams(source, params),
    headers: [
      { key: CATALOG_META.authHeader, value: SUBSCRIPTION_KEY_PLACEHOLDER },
      { key: "Accept", value: "application/json" },
    ],
  };
}

function paginatedExamples(
  built: BuiltMisoRequest,
  pagination: MisoPaginationSpec,
): ApiRequestSpec["examples"] {
  const url = new URL(built.url);
  url.searchParams.delete(pagination.param_name);
  const { [pagination.param_name]: _page, ...baseParams } = built.query;
  const queryCode = JSON.stringify(baseParams, null, 4).replace(/\n/g, "\n    ");
  const pageParam = pagination.param_name;
  const header = CATALOG_META.authHeader;
  const key = CATALOG_META.requiredEnvVar;

  return [
    {
      language: "cURL",
      code: `# Requires jq. Each page is saved so settlement records are never silently dropped.
# curl retries transient failures and honors Retry-After when MISO sends one.
page=1
while :; do
  response="$(curl -sS --fail-with-body --retry 3 --retry-delay 1 --get "${url}" \\
    --data-urlencode "${pageParam}=$page" \\
    -H "${header}: $MISO_SUBSCRIPTION_KEY" \\
    -H "Accept: application/json")"
  printf '%s\\n' "$response" > "miso-page-\${page}.json"
  last_page="$(printf '%s' "$response" | jq -r '.page.lastPage // true')"
  [ "$last_page" = "true" ] && break
  page=$((page + 1))
done`,
    },
    {
      language: "Python",
      code: `import os, random, time, requests
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

base_params = ${queryCode}
records = []
headers = {"${header}": os.environ["${key}"], "Accept": "application/json"}

def retry_after_seconds(value):
    if not value:
        return None
    try:
        return max(0, float(value))
    except ValueError:
        return max(0, (parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds())

def get_page(page):
    for attempt in range(3):
        response = requests.${built.method.toLowerCase()}("${built.endpoint}", params={**base_params, "${pageParam}": page}, headers=headers, timeout=60)
        if response.status_code != 429 and not 500 <= response.status_code < 600:
            response.raise_for_status()  # Fix non-retryable 4xx requests rather than looping.
            return response.json()
        if attempt == 2:
            response.raise_for_status()
        delay = retry_after_seconds(response.headers.get("Retry-After"))
        delay = delay if delay is not None else min(8, 0.5 * 2 ** attempt) * (1 + random.random() * 0.25)
        time.sleep(delay)

page = 1
while True:
    payload = get_page(page)
    records.extend(payload.get("data", []))
    if payload.get("page", {}).get("lastPage", True):
        break
    page += 1`,
    },
    {
      language: "JavaScript",
      code: `const baseParams = ${JSON.stringify(baseParams, null, 2)};
const records = [];

async function getPage(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      method: "${built.method}",
      headers: {
        "${header}": process.env.${key},
        Accept: "application/json",
      },
    });
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable) {
      if (!response.ok) throw new Error("Fix this MISO request before retrying: " + response.status);
      return response.json();
    }
    if (attempt === 2) throw new Error("MISO request failed after retries: " + response.status);
    const retryAfterValue = response.headers.get("Retry-After");
    const retryAfterSeconds = Number(retryAfterValue);
    const retryAfterDate = Date.parse(retryAfterValue ?? "");
    const retryAfter = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : Number.isFinite(retryAfterDate) ? Math.max(0, retryAfterDate - Date.now()) : NaN;
    const delay = Number.isFinite(retryAfter) ? retryAfter : Math.min(8000, 500 * 2 ** attempt) * (1 + Math.random() * 0.25);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

for (let page = 1; ; page += 1) {
  const url = new URL("${built.endpoint}");
  for (const [key, value] of Object.entries(baseParams)) url.searchParams.set(key, value);
  url.searchParams.set("${pageParam}", String(page));

  const payload = await getPage(url);
  records.push(...(payload.data ?? []));
  if (payload.page?.lastPage ?? true) break;
}`,
    },
  ];
}

export function toApiRequestSpec(
  source: MisoSource,
  params: Record<string, string>,
): ApiRequestSpec {
  const built = buildMisoRequest(source, params);
  const specs = source.parameters ?? [];
  const pagination = source.pagination;
  return {
    name: `MISO ${source.name} API`,
    method: built.method,
    url: built.url,
    parameters: specs.map((p) => ({
      key: p.name,
      value: params[p.name] ?? "",
      required: p.required,
    })),
    headers: built.headers,
    auth_note:
      "Requires a MISO Data Exchange subscription key (header Ocp-Apim-Subscription-Key). Stay under 100 calls/minute. The live key is injected by the server and is never returned to the client.",
    timezone_note: MISO_TIMESTAMP_NOTE,
    reliability_note: MISO_RELIABILITY_GUIDANCE,
    ...(pagination ? { pagination } : {}),
    examples: pagination
      ? paginatedExamples(built, pagination)
      : [
          {
            language: "cURL",
            code: `curl -sS --get "${built.url}" \\\n  -H "${CATALOG_META.authHeader}: $MISO_SUBSCRIPTION_KEY" \\\n  -H "Accept: application/json"`,
          },
          {
            language: "Python",
            code: `import os, requests\n\nresponse = requests.${built.method.toLowerCase()}(\n    "${built.endpoint}",\n    params=${JSON.stringify(built.query, null, 4).replace(/\n/g, "\n    ")},\n    headers={\n        "${CATALOG_META.authHeader}": os.environ["${CATALOG_META.requiredEnvVar}"],\n        "Accept": "application/json",\n    },\n    timeout=60,\n)\nresponse.raise_for_status()\ndata = response.json()`,
          },
          {
            language: "JavaScript",
            code: `const response = await fetch("${built.url}", {\n  method: "${built.method}",\n  headers: {\n    "${CATALOG_META.authHeader}": process.env.${CATALOG_META.requiredEnvVar},\n    Accept: "application/json",\n  },\n});\nconst data = await response.json();`,
          },
        ],
  };
}

export function containsSecret(value: unknown, secret: string): boolean {
  if (!secret) return false;
  return JSON.stringify(value).includes(secret);
}
