import type { ApiRequestSpec } from "./types";

export interface MisoKeyReference {
  id: string;
  label: string;
  environment_variable: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

interface LocalAgentPlan {
  apiName: string;
  method: string;
  url: string;
  parameters: ApiRequestSpec["parameters"];
  subscriptionKeyEnvironmentVariable: string;
  timezoneNote: string;
  reliabilityNote: string;
}

function agentPlan(api: ApiRequestSpec, credential?: MisoKeyReference): LocalAgentPlan {
  return {
    apiName: api.name,
    method: api.method,
    url: api.url,
    parameters: api.parameters,
    subscriptionKeyEnvironmentVariable: credential?.environment_variable ?? "MISO_SUBSCRIPTION_KEY",
    timezoneNote: api.timezone_note,
    reliabilityNote: api.reliability_note,
  };
}

/**
 * A user downloads and runs this agent on their own machine. It receives an
 * approved, non-secret request plan from MISO AI; it never receives a browser
 * session, a Supabase token, or MISO subscription-key material.
 */
export function createLocalAgentScript(api: ApiRequestSpec, credential?: MisoKeyReference): string {
  const plan = agentPlan(api, credential);
  return `/**
 * MISO AI local backend agent
 *
 * Setup:
 *   npm install @cursor/sdk
 *   export CURSOR_API_KEY="..."
 *   export MISO_BACKEND_PATH="/absolute/path/to/your/backend"
 *   node miso-backend-agent.mjs
 *
 * The agent starts with its local sandbox and auto-review enabled. Keep those
 * defaults unless you have reviewed the repository's own agent policy.
 *
 * Security: this file contains an approved API plan, never a MISO subscription
 * key. The generated backend code must read the key server-side from
 * process.env.${plan.subscriptionKeyEnvironmentVariable}; do not put it in
 * browser code, source control, logs, or agent prompts.
 */
import { Agent, CursorAgentError } from "@cursor/sdk";

const plan = ${JSON.stringify(plan, null, 2)};
const apiKey = process.env.CURSOR_API_KEY;
const cwd = process.env.MISO_BACKEND_PATH || process.cwd();
const sandboxEnabled = process.env.MISO_AGENT_SANDBOX !== "0";

if (!apiKey) throw new Error("Set CURSOR_API_KEY before running the local agent.");

const prompt = \`You are editing a local backend repository at \${cwd}. Implement the approved MISO integration plan below.

Approved plan (not a secret):\n\${JSON.stringify(plan, null, 2)}

Required outcome:
1. Inspect the repository before editing and identify the appropriate server-only integration layer.
2. Add a typed request function that sends the specified parameters and the Ocp-Apim-Subscription-Key header from process.env[plan.subscriptionKeyEnvironmentVariable].
3. Never read, print, persist, transmit, or include the value of that environment variable in code, tests, comments, errors, or prompts. Only reference its name at runtime in server-side code.
4. Validate required parameters before the request, preserve the stated MISO market-time guidance, and paginate/retry using the supplied reliability guidance.
5. Add focused tests with mock HTTP responses. Do not make live network calls in tests.
6. Run the repository's relevant checks. Summarize changed files and any remaining action without exposing secrets.

Do not modify files outside the selected backend repository.\`;

try {
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "auto" },
    local: {
      cwd,
      settingSources: [],
      sandboxOptions: { enabled: sandboxEnabled },
      autoReview: true,
    },
  });
  console.log(JSON.stringify({ status: result.status, message: "Local agent run finished. Review its changes before deploying." }));
  process.exitCode = result.status === "finished" ? 0 : 2;
} catch (error) {
  if (error instanceof CursorAgentError) {
    console.error(JSON.stringify({ status: "startup_error", retryable: error.isRetryable, code: error.code }));
    process.exitCode = 1;
  } else {
    throw error;
  }
}
`;
}
