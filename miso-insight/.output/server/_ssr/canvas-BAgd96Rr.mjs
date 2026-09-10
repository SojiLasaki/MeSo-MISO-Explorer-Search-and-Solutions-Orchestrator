import { a as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as ArrowUpRight, A as FileText, D as KeyRound, E as Laptop, F as Copy, G as ChevronDown, H as CircleAlert, K as Check, L as Clock3, N as Download, P as Database, R as Circle, T as Layers, Z as Bot, _ as Play, a as Trash2, et as ArrowRight, g as Plus, h as RefreshCw, j as ExternalLink, k as Globe, l as SlidersHorizontal, m as RotateCcw, n as X, o as Table2, tt as ArrowLeft, u as ShieldCheck, v as Minus, x as Lock } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as rerunMisoRequest, i as listMisoKeyReferences, s as useServerFn, t as createMisoKeyReference } from "./miso.functions-76DM3dDC.mjs";
import { n as getSource } from "./registry-ByJMkCvd.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-3HhpKDcy.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/canvas-BAgd96Rr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATE_STYLES = {
	valid: "border-success/40",
	invalid: "border-destructive/60 bg-destructive-soft/40",
	idle: "border-border",
	active: "border-accent/60 bg-accent-soft/40"
};
function CanvasNode({ node, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => onSelect(node.id),
		className: cn("w-full rounded-xl border bg-card px-4 py-3 text-left transition-all duration-200 hover:shadow-soft", STATE_STYLES[node.state], selected && "shadow-lift ring-1 ring-ring/40"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13.5px] font-medium",
							children: node.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[12.5px] text-muted-foreground",
							children: node.subtitle
						}),
						node.state === "invalid" && node.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12.5px] text-destructive",
							children: node.detail
						})
					]
				}),
				node.state === "valid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-3.5 shrink-0 text-success" }),
				node.state === "invalid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 shrink-0 text-destructive" }),
				node.state === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" }),
				node.state === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "mt-0.5 size-3.5 shrink-0 fill-accent text-accent" })
			]
		})
	});
}
function ParameterEditor({ specs, values, onChange }) {
	if (!specs.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted-foreground",
		children: "This source doesn't take any parameters."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: specs.map((spec) => {
			const missing = spec.required && !values[spec.name];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: spec.name,
						className: "text-[13px]",
						children: [spec.label, spec.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-muted-foreground",
							children: "required"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: spec.name,
						type: spec.type === "date" ? "date" : "text",
						value: values[spec.name] ?? "",
						placeholder: spec.example ?? "",
						onChange: (e) => onChange(spec.name, e.target.value),
						className: missing ? "rounded-lg border-destructive/60" : "rounded-lg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] text-muted-foreground",
						children: spec.description
					}),
					missing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[12px] text-destructive",
						children: [spec.label, " is required."]
					})
				]
			}, spec.name);
		})
	});
}
function CodeBlock({ code, className }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const copy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative rounded-lg border bg-surface", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: copy,
			"aria-label": "Copy code",
			className: "absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100",
			children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3" }), copied ? "Copied" : "Copy"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: code })
		})]
	});
}
function agentPlan(api, credential) {
	return {
		apiName: api.name,
		method: api.method,
		url: api.url,
		parameters: api.parameters,
		subscriptionKeyEnvironmentVariable: credential?.environment_variable ?? "MISO_SUBSCRIPTION_KEY",
		timezoneNote: api.timezone_note,
		reliabilityNote: api.reliability_note
	};
}
/**
* A user downloads and runs this agent on their own machine. It receives an
* approved, non-secret request plan from MISO AI; it never receives a browser
* session, a Supabase token, or MISO subscription-key material.
*/
function createLocalAgentScript(api, credential) {
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
function LocalAgentDialog({ api, open, onOpenChange }) {
	const [confirmed, setConfirmed] = (0, import_react.useState)(false);
	const [references, setReferences] = (0, import_react.useState)([]);
	const [selectedId, setSelectedId] = (0, import_react.useState)("");
	const [label, setLabel] = (0, import_react.useState)("");
	const [environmentVariable, setEnvironmentVariable] = (0, import_react.useState)("MISO_SUBSCRIPTION_KEY");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const loadReferences = useServerFn(listMisoKeyReferences);
	const createKeyReference = useServerFn(createMisoKeyReference);
	(0, import_react.useEffect)(() => {
		if (!open) {
			setConfirmed(false);
			return;
		}
		loadReferences().then((items) => {
			setReferences(items);
			setSelectedId((current) => current || items[0]?.id || "");
		}).catch(() => void 0);
	}, [loadReferences, open]);
	const saveReference = async () => {
		if (!label.trim()) {
			toast.error("Give this key reference a label.");
			return;
		}
		setSaving(true);
		try {
			const reference = await createKeyReference({ data: {
				label: label.trim(),
				environment_variable: environmentVariable.trim()
			} });
			setReferences((items) => [reference, ...items]);
			setSelectedId(reference.id);
			setLabel("");
			toast.success("Credential reference saved. No key value was stored.");
		} catch {
			toast.error("Couldn't save that credential reference.");
		} finally {
			setSaving(false);
		}
	};
	const download = () => {
		const script = createLocalAgentScript(api, references.find((reference) => reference.id === selectedId));
		const blob = new Blob([script], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "miso-backend-agent.mjs";
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
		toast.success("Local agent downloaded. Review it before running.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-h-[min(720px,92vh)] overflow-y-auto rounded-2xl sm:max-w-lg",
			children: !confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-[21px] font-medium tracking-tight",
					children: "Would you like an AI agent to make the backend changes locally?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-[13.5px] leading-relaxed",
					children: "It downloads a local TypeScript agent with this approved endpoint and every resolved parameter. You run it in your own backend repository and review its changes before deployment."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "rounded-xl",
					onClick: () => setConfirmed(true),
					children: "Yes, set up the agent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "rounded-xl",
					onClick: () => onOpenChange(false),
					children: "No, use the code examples"
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-[21px] font-medium tracking-tight",
						children: "Local agent setup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-[13.5px] leading-relaxed",
						children: "The download contains an implementation plan, not a subscription key. Your key remains in your MISO account and is read only by your backend at runtime."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-2 rounded-xl border bg-muted/25 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] font-medium",
							children: "Secret-safe handoff"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
							children: "The site never receives, displays, stores, or downloads subscription-key material. The agent only receives the selected environment-variable name."
						})] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[13px]",
							children: "Credential reference for this agent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://data-exchange.misoenergy.org/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline",
							children: ["Create key in MISO Data Exchange ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
						})]
					}), references.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: selectedId,
						onChange: (event) => setSelectedId(event.target.value),
						className: "h-10 w-full rounded-lg border bg-background px-3 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
						children: references.map((reference) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: reference.id,
							children: [
								reference.label,
								" · ",
								reference.environment_variable
							]
						}, reference.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg border border-dashed px-3 py-2.5 text-[12px] text-muted-foreground",
						children: "No saved references yet. Create your MISO key in the official portal, then add a non-secret local alias below."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-xl border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-medium",
								children: "Add a local key reference"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
							children: "This saves only a label and environment-variable name for your signed-in account."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "key-reference-label",
									className: "text-[11.5px]",
									children: "Label"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "key-reference-label",
									value: label,
									onChange: (event) => setLabel(event.target.value),
									placeholder: "Production MISO",
									className: "h-9 rounded-lg text-[12.5px]"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "key-reference-env",
									className: "text-[11.5px]",
									children: "Local environment variable"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "key-reference-env",
									value: environmentVariable,
									onChange: (event) => setEnvironmentVariable(event.target.value.toUpperCase()),
									placeholder: "MISO_SUBSCRIPTION_KEY",
									className: "h-9 rounded-lg font-mono text-[12px]"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "mt-3 rounded-full",
							disabled: saving,
							onClick: () => void saveReference(),
							children: "Save reference"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-xl border bg-muted/20 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] font-medium",
						children: "This agent will receive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 space-y-1 text-[12px] text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"• ",
								api.method,
								" request plan for ",
								api.name
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"• ",
								api.parameters.length,
								" resolved parameter",
								api.parameters.length === 1 ? "" : "s"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Pagination, retry, and MISO time-basis instructions" })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-5 w-full gap-2 rounded-full",
					onClick: download,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download local agent"]
				})
			] })
		})
	});
}
function ApiRequestViewer({ api }) {
	const [tab, setTab] = (0, import_react.useState)(api.examples[0]?.language ?? "cURL");
	const [agentOpen, setAgentOpen] = (0, import_react.useState)(false);
	const active = api.examples.find((e) => e.language === tab) ?? api.examples[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise overflow-hidden rounded-xl border bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] font-medium",
					children: api.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-medium text-accent",
						children: api.method
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "break-all font-mono text-[12.5px] text-muted-foreground",
						children: api.url
					})]
				})]
			}),
			api.parameters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-[12px] uppercase tracking-wide text-muted-foreground",
					children: "Parameters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: api.parameters.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-3 font-mono text-[12.5px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-[132px] text-foreground",
								children: p.key
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: p.value || "—"
							}),
							!p.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-sans text-[11px] text-muted-foreground/70",
								children: "optional"
							})
						]
					}, p.key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b px-5 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-[12px] uppercase tracking-wide text-muted-foreground",
						children: "Authentication"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: api.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline gap-x-3 font-mono text-[12.5px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-[132px] text-foreground",
								children: h.key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: h.value
							})]
						}, h.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-start gap-2 text-[12.5px] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 size-3.5 shrink-0" }), api.auth_note]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b bg-muted/20 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[12px] uppercase tracking-wide text-muted-foreground",
					children: "Settlement-safe integration"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Safeguard, {
							icon: ShieldCheck,
							title: "Complete records",
							copy: api.pagination ? api.pagination.total_pages != null ? `This response required ${api.pagination.total_pages} pages. The examples collect every one.` : `This operation can span pages. The examples continue until ${api.pagination.last_page_path} is true.` : "This operation has no paginated response modeled in the MISO catalog."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Safeguard, {
							icon: Clock3,
							title: "Time basis",
							copy: api.timezone_note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Safeguard, {
							icon: RefreshCw,
							title: "Recovery behavior",
							copy: api.reliability_note
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-accent-soft/30 px-3.5 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12.5px] font-medium",
							children: "Connect this to your backend"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[11.5px] text-muted-foreground",
							children: "Use a local AI agent to implement this validated request in your repository."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setAgentOpen(true),
							className: "inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-card px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-3.5" }), "Use local agent"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex gap-1",
						children: api.examples.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTab(e.language),
							className: cn("rounded-full px-3 py-1 text-[12.5px] transition-colors", tab === e.language ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"),
							children: e.language
						}, e.language))
					}),
					active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, { code: active.code })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAgentDialog, {
				api,
				open: agentOpen,
				onOpenChange: setAgentOpen
			})
		]
	});
}
function Safeguard({ icon: Icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12.5px] font-medium",
				children: title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-[12px] leading-relaxed text-muted-foreground",
			children: copy
		})]
	});
}
function ChartViewer({ data }) {
	const xKey = data.x_key ?? data.columns[0]?.key ?? "x";
	const yKey = data.y_key ?? data.columns[1]?.key ?? "value";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border bg-card p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-64 w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: data.rows,
					margin: {
						top: 8,
						right: 8,
						left: 0,
						bottom: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "misoFill",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "var(--color-chart-1)",
								stopOpacity: .22
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "var(--color-chart-1)",
								stopOpacity: .02
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "var(--color-border)",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: xKey,
							tickLine: false,
							axisLine: false,
							minTickGap: 24,
							tick: {
								fontSize: 11,
								fill: "var(--color-muted-foreground)"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							tickLine: false,
							axisLine: false,
							width: 56,
							tick: {
								fontSize: 11,
								fill: "var(--color-muted-foreground)"
							},
							tickFormatter: (v) => v.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							contentStyle: {
								borderRadius: 12,
								border: "1px solid var(--color-border)",
								background: "var(--color-card)",
								fontSize: 12,
								boxShadow: "var(--shadow-soft)"
							},
							formatter: (v) => [`${Number(v).toLocaleString()}${data.unit ? ` ${data.unit}` : ""}`, ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: yKey,
							stroke: "var(--color-chart-1)",
							strokeWidth: 2,
							fill: "url(#misoFill)"
						})
					]
				})
			})
		})
	});
}
function DataTable({ data }) {
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const rows = expanded ? data.rows : data.rows.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b bg-surface/70",
					children: data.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-2.5 text-left text-[12px] font-medium tracking-wide text-muted-foreground",
						children: c.label
					}, c.key))
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b last:border-0",
					children: data.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 tabular-nums",
						children: typeof row[c.key] === "number" ? Number(row[c.key]).toLocaleString() : String(row[c.key] ?? "—")
					}, c.key))
				}, i)) })]
			})
		}), data.rows.length > 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setExpanded((v) => !v),
			className: "w-full border-t bg-surface/50 px-4 py-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground",
			children: expanded ? "Show less" : `Show all ${data.rows.length} rows`
		})]
	});
}
function toCsv(data) {
	return `${data.columns.map((c) => `"${c.label}"`).join(",")}\n${data.rows.map((row) => data.columns.map((c) => `"${String(row[c.key] ?? "")}"`).join(",")).join("\n")}`;
}
function DownloadButton({ data, filename, label = "Download CSV" }) {
	const download = () => {
		const blob = new Blob([toCsv(data)], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${filename}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		onClick: download,
		className: "rounded-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), label]
	});
}
function RequiredParametersForm({ response, onSubmit, mode = "required" }) {
	const invalidNames = (0, import_react.useMemo)(() => new Set((response.resolution?.validation.errors ?? []).map((issue) => issue.parameter)), [response.resolution?.validation.errors]);
	const specs = (0, import_react.useMemo)(() => {
		const sourceId = response.source?.id ?? response.resolution?.source_id;
		const parameters = sourceId ? getSource(sourceId)?.parameters : void 0;
		if (mode === "required") return parameters?.filter((spec) => spec.required) ?? [];
		return parameters?.filter((spec) => spec.required || invalidNames.has(spec.name) || response.parameters[spec.name] != null) ?? [];
	}, [
		invalidNames,
		mode,
		response.parameters,
		response.source?.id,
		response.resolution?.source_id
	]);
	const [values, setValues] = (0, import_react.useState)(response.parameters);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setValues(response.parameters);
		setSubmitted(false);
	}, [response.request_id, response.parameters]);
	if (mode === "required" && response.resolution?.status !== "needs_parameters" || !specs.length) return null;
	const missing = specs.filter((spec) => !values[spec.name]?.trim());
	const update = (name, value) => {
		setValues((current) => ({
			...current,
			[name]: value
		}));
	};
	const submit = () => {
		setSubmitted(true);
		if (missing.length) return;
		onSubmit(`Use these parameters for ${response.source?.name ?? "this MISO request"}.`, values);
	};
	const repair = mode === "repair";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "animate-rise overflow-hidden rounded-xl border bg-card shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b bg-accent-soft/45 px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] font-medium",
						children: repair ? "Update request values" : "Complete this request"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[12px] text-muted-foreground",
						children: repair ? "Correct the highlighted values, then retry the same MISO request." : "Enter every required value once, then run the API."
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 p-4 sm:grid-cols-2",
				children: specs.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterField, {
					spec,
					value: values[spec.name] ?? "",
					validationError: invalidNames.has(spec.name),
					showError: submitted && spec.required && !values[spec.name]?.trim(),
					onChange: (value) => update(spec.name, value)
				}, spec.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 border-t bg-muted/25 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] text-muted-foreground",
					children: missing.length ? `${missing.length} required field${missing.length === 1 ? "" : "s"} left` : repair ? "Ready to retry" : "Ready to run"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: submit,
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90",
					children: [repair ? "Retry request" : "Run request", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
				})]
			})
		]
	});
}
function ParameterField({ spec, value, showError, validationError, onChange }) {
	const inputClass = `mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-[13px] outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15 ${showError || validationError ? "border-destructive" : "border-input"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5 text-[12.5px] font-medium",
				children: [spec.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded bg-destructive-soft px-1.5 py-0.5 text-[10px] font-medium text-destructive",
					children: "Required"
				})]
			}),
			spec.options?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value,
				onChange: (event) => onChange(event.target.value),
				className: inputClass,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: "",
					children: ["Select ", spec.label.toLowerCase()]
				}), spec.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: option,
					children: option
				}, option))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: spec.type === "date" ? "date" : spec.type === "number" || spec.type === "integer" ? "number" : "text",
				value,
				placeholder: spec.example ?? spec.description,
				onChange: (event) => onChange(event.target.value),
				className: inputClass
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: showError || validationError ? "mt-1 block text-[11px] text-destructive" : "mt-1 block text-[11px] text-muted-foreground",
				children: showError ? `${spec.label} is required.` : validationError ? "This value needs to be corrected before retrying." : spec.description
			})
		]
	});
}
function StepIcon({ status }) {
	if (status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 flex size-4 items-center justify-center rounded-full bg-destructive-soft text-destructive",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-2.5" })
	});
	if (status === "skipped") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-2.5" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-0.5 flex size-4 items-center justify-center rounded-full bg-success-soft text-success",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-2.5" })
	});
}
function ExecutionTimeline({ steps, label = "How this was found", durationMs }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border bg-card/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((v) => !v),
			className: "flex w-full items-center justify-between px-4 py-3 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [durationMs != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] tabular-nums opacity-70",
					children: [(durationMs / 1e3).toFixed(1), "s"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform duration-300", open && "rotate-180") })]
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "animate-fade space-y-3 border-t px-4 py-4",
			children: steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIcon, { status: step.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] font-medium text-foreground",
						children: step.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-[12.5px] text-muted-foreground",
						children: step.detail
					})]
				})]
			}, i))
		})]
	});
}
function statusLabel(status) {
	if (status === "valid") return "Checked";
	if (status === "invalid") return "Needs correction";
	return "Needs input";
}
function statusClass(status) {
	if (status === "valid") return "bg-success-soft text-success";
	if (status === "invalid") return "bg-destructive-soft text-destructive";
	return "bg-accent-soft text-accent";
}
function ErrorResolution({ response, onRetry, onSubmitParameters }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const { error, execution, resolution, request_metadata: requestMetadata } = response;
	const parameterDetails = (0, import_react.useMemo)(() => {
		if (resolution?.parameter_details.length) return resolution.parameter_details;
		return Object.entries(response.parameters).map(([name, value]) => ({
			name,
			value,
			source: "user_message",
			confidence: 1,
			required: false,
			status: "valid"
		}));
	}, [resolution?.parameter_details, response.parameters]);
	const failedStep = execution.steps.find((step) => step.status === "error");
	const endpoint = requestMetadata?.endpoint ?? resolution?.request?.endpoint;
	const canRetryUnchanged = resolution?.status !== "validation_error";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-xl border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((value) => !value),
			"aria-expanded": open,
			className: "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[13px] font-medium",
					children: "Resolve this issue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 block text-[11.5px] text-muted-foreground",
					children: "Review the request, input checks, and full execution trace."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180") })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-fade space-y-4 border-t px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DiagnosticCard, {
						title: "Failure point",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: failedStep?.label ?? error?.message ?? "Request could not complete." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-muted-foreground",
							children: failedStep?.detail ?? error?.reason
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DiagnosticCard, {
						title: "Request context",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: response.source?.name ?? requestMetadata?.dataset ?? "MISO request" }), endpoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 break-all font-mono text-[10.5px] text-muted-foreground",
							children: endpoint
						})]
					})]
				}),
				parameterDetails.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border bg-muted/20 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
						children: "Parameter check"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2.5 space-y-2",
						children: parameterDetails.map((parameter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-3 text-[12px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: parameter.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1.5 break-all font-mono text-muted-foreground",
										children: parameter.value || "—"
									}),
									parameter.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-destructive",
										children: parameter.error
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium", statusClass(parameter.status)),
								children: statusLabel(parameter.status)
							})]
						}, parameter.name))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [onSubmitParameters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						className: "gap-1.5 rounded-full",
						onClick: () => setEditing((value) => !value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3.5" }), editing ? "Hide inputs" : "Review and update inputs"]
					}), onRetry && canRetryUnchanged && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "outline",
						className: "gap-1.5 rounded-full",
						onClick: () => onRetry(response.intent.summary, response.parameters),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Retry unchanged"]
					})]
				}),
				editing && onSubmitParameters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequiredParametersForm, {
					response,
					onSubmit: onSubmitParameters,
					mode: "repair"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExecutionTimeline, {
					steps: execution.steps,
					durationMs: execution.duration_ms,
					label: "Full execution trace"
				})
			]
		})]
	});
}
function DiagnosticCard({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-muted/20 p-3 text-[12px] leading-relaxed",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
			children: title
		}), children]
	});
}
function ErrorState({ error, onFix, onEdit }) {
	const [showTechnical, setShowTechnical] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "animate-rise rounded-xl border border-destructive/25 bg-destructive-soft/50 p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[15px] font-medium",
						children: error.message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13.5px] text-muted-foreground",
						children: error.reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [error.fixable && onFix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "rounded-full",
							onClick: onFix,
							children: "Fix automatically"
						}), onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "rounded-full",
							onClick: onEdit,
							children: "Edit request"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowTechnical((v) => !v),
						className: "mt-4 text-[12.5px] text-muted-foreground underline-offset-4 hover:underline",
						children: showTechnical ? "Hide technical details" : "View technical details"
					}),
					showTechnical && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "animate-fade mt-2 overflow-x-auto rounded-lg border bg-card p-3 font-mono text-[12px] text-muted-foreground",
						children: error.technical
					})
				]
			})]
		})
	});
}
var ICONS = {
	api: Database,
	report: FileText,
	dataset: Table2,
	webpage: Globe,
	document: Layers
};
function SourceIndicator({ name, type }) {
	const Icon = ICONS[type];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[12px] text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }), name]
	});
}
var PTD_ENDPOINT_BY_SOURCE_ID = {
	"get-v1-real-time-date-demand-actual": "actual_load",
	"get-v1-day-ahead-date-demand": "day_ahead_demand",
	"get-v1-real-time-date-lmp-expost": "realtime_lmp",
	"get-v1-real-time-date-generation-fuel-type": "realtime_generation_fuel_type"
};
function ptdHandoffHref(response) {
	const endpoint = response.source ? PTD_ENDPOINT_BY_SOURCE_ID[response.source.id] : void 0;
	if (!endpoint || response.execution.status !== "success") return null;
	const search = new URLSearchParams({
		from: "miso-agent",
		endpoint
	});
	for (const [key, value] of Object.entries(response.parameters)) if (value) search.set(key, value);
	return `/power-trader?${search.toString()}`;
}
function ResultViewer({ response, onFix, onEdit, onRetry, onSubmitParameters }) {
	const { output, data, api, report, metrics, error } = response;
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				error,
				...onEdit ? { onEdit } : {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorResolution, {
				response,
				...onRetry ? { onRetry } : {},
				...onSubmitParameters ? { onSubmitParameters } : {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExecutionTimeline, {
					steps: response.execution.steps,
					durationMs: response.execution.duration_ms
				})
			})
		]
	});
	if (response.clarification) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "whitespace-pre-line text-[15.5px] leading-relaxed",
			children: response.clarification
		}), onSubmitParameters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequiredParametersForm, {
			response,
			onSubmit: onSubmitParameters
		})]
	});
	const showChart = output.mode === "chart" || output.include_chart && (data?.rows.length ?? 0) > 1;
	const showTable = output.mode === "table" || output.mode === "csv" || output.include_table && (data?.rows.length ?? 0) > 1;
	const showMetrics = Boolean(metrics?.length) && output.mode !== "api";
	const showAnswerFirst = output.mode === "answer" && !data && !report;
	const handoffHref = ptdHandoffHref(response);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise space-y-5",
		children: [
			response.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[19px] font-medium tracking-tight",
					children: response.title
				}), response.source && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceIndicator, {
					name: response.source.name,
					type: response.source.type
				})]
			}),
			showMetrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: metrics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-card px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-muted-foreground",
							children: m.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[21px] font-medium tabular-nums tracking-tight",
							children: m.value
						}),
						m.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-muted-foreground",
							children: m.sub
						})
					]
				}, m.label))
			}),
			showChart && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartViewer, { data }),
			showTable && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, { data }),
			handoffHref && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: handoffHref,
				className: "group flex items-center justify-between gap-4 rounded-xl border border-dashed bg-muted/35 px-4 py-3 transition-colors hover:bg-muted/55",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] font-medium",
					children: "Open in PTD Infographcs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[12px] leading-relaxed text-muted-foreground",
					children: "Send these non-secret MISO parameters to the separate chart workspace."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: report.url,
				target: "_blank",
				rel: "noreferrer",
				className: "group block rounded-xl border bg-card p-5 transition-shadow hover:shadow-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[15px] font-medium",
							children: report.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-muted-foreground",
							children: report.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[12px] text-muted-foreground",
							children: [
								"Published ",
								report.published,
								" · ",
								report.format
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
				})
			}),
			showAnswerFirst && response.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground",
				children: response.explanation
			}),
			api && (output.include_api || output.mode === "api") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiRequestViewer, { api }),
			data && (output.include_download || output.mode === "csv") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
				data,
				filename: response.source?.id ?? "miso-data"
			}),
			!showAnswerFirst && response.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground",
				children: response.explanation
			}),
			response.api_nudge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] leading-relaxed text-muted-foreground",
					children: response.api_nudge.message
				}), onFix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onFix(response.api_nudge.ask),
					className: "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-card",
					children: response.api_nudge.cta_label
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExecutionTimeline, {
					steps: response.execution.steps,
					durationMs: response.execution.duration_ms
				})
			})
		]
	});
}
/**
* Tiny client-side store holding the most recent orchestration response so the
* Canvas experience can inspect and edit it. No credentials are ever stored.
*/
var current = null;
var listeners = /* @__PURE__ */ new Set();
function setLastResponse(response) {
	current = response;
	if (typeof window !== "undefined") window.sessionStorage.setItem("miso:last-response", JSON.stringify(response));
	listeners.forEach((l) => l());
}
function getLastResponse() {
	if (current) return current;
	if (typeof window === "undefined") return null;
	const raw = window.sessionStorage.getItem("miso:last-response");
	if (!raw) return null;
	try {
		current = JSON.parse(raw);
		return current;
	} catch {
		return null;
	}
}
function CanvasPage() {
	const [response, setResponse] = (0, import_react.useState)(() => getLastResponse());
	const [params, setParams] = (0, import_react.useState)(() => getLastResponse()?.parameters ?? {});
	const [selected, setSelected] = (0, import_react.useState)("source");
	const [extraNodes, setExtraNodes] = (0, import_react.useState)([]);
	const [running, setRunning] = (0, import_react.useState)(false);
	const rerun = useServerFn(rerunMisoRequest);
	const source = response?.source ? getSource(response.source.id) : void 0;
	const specs = source?.parameters ?? [];
	const missing = specs.filter((s) => s.required && !params[s.name]);
	const nodes = (0, import_react.useMemo)(() => {
		if (!response) return [];
		const ok = response.execution.status === "success";
		return [
			{
				id: "request",
				title: "User request",
				subtitle: response.intent.summary,
				state: "valid"
			},
			{
				id: "intent",
				title: "Intent",
				subtitle: `${response.intent.type} · ${(response.intent.confidence * 100).toFixed(0)}% confidence`,
				state: "valid"
			},
			{
				id: "source",
				title: "MISO source",
				subtitle: response.source ? `${response.source.name} (${response.source.type})` : "None",
				state: response.source ? "active" : "invalid",
				detail: "No source resolved."
			},
			{
				id: "parameters",
				title: "Parameters",
				subtitle: Object.entries(params).map(([k, v]) => `${k}: ${v}`).join(" · ") || "None set",
				state: missing.length ? "invalid" : "valid",
				detail: missing.length ? `${missing[0].label} is required.` : void 0,
				editable: true
			},
			{
				id: "auth",
				title: "Authentication",
				subtitle: source?.requires_authentication ? "MISO access authorized" : "Not required",
				state: "valid"
			},
			{
				id: "execution",
				title: source?.type === "api" ? "API request" : "Report lookup",
				subtitle: ok ? "Executed" : "Not executed",
				state: ok ? "valid" : "idle"
			},
			{
				id: "validation",
				title: "Validation",
				subtitle: ok ? "Response validated" : "Pending",
				state: ok ? "valid" : "idle"
			},
			{
				id: "results",
				title: "Results",
				subtitle: response.title ?? "—",
				state: ok ? "valid" : "idle"
			},
			...extraNodes
		];
	}, [
		response,
		params,
		missing,
		source,
		extraNodes
	]);
	const run = async () => {
		if (!response || !source) return;
		if (missing.length) {
			toast.error(`${missing[0].label} is required before this can run.`);
			return;
		}
		setRunning(true);
		try {
			const detail = Object.entries(params).map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join(", ");
			const next = await rerun({ data: {
				question: `Retrieve ${source.name} from MISO with ${detail}. Present it the same way as before.`,
				conversation_id: null
			} });
			setResponse(next);
			setLastResponse(next);
			toast.success("Request re-run");
		} catch {
			toast.error("Couldn't re-run this request.");
		} finally {
			setRunning(false);
		}
	};
	if (!response) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[24px] font-medium tracking-tight",
				children: "Canvas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-[14.5px] text-muted-foreground",
				children: "Ask something first, then open Canvas to inspect and adjust how the answer was found."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back to chat"
				})
			})
		]
	});
	const selectedNode = nodes.find((n) => n.id === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-10 flex items-center justify-between border-b bg-background/85 px-5 py-3 backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Chat"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13.5px] font-medium",
					children: "Canvas"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "rounded-full",
					disabled: running,
					onClick: () => void run(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), running ? "Running" : "Re-run"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Request pipeline",
				className: "space-y-2",
				children: [nodes.map((node, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasNode, {
					node,
					selected: selected === node.id,
					onSelect: setSelected
				}), i < nodes.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-4 w-px bg-border",
					"aria-hidden": "true"
				})] }, node.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						onClick: () => setExtraNodes((prev) => [...prev, {
							id: `custom_${prev.length + 1}`,
							title: `Custom step ${prev.length + 1}`,
							subtitle: "Not yet executed",
							state: "idle"
						}]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Add node"]
					}), extraNodes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "rounded-full",
						onClick: () => setExtraNodes((prev) => prev.slice(0, -1)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Remove"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[15px] font-medium",
							children: selectedNode?.title ?? "Node"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-muted-foreground",
							children: selectedNode?.subtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: selected === "parameters" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterEditor, {
								specs,
								values: params,
								onChange: (k, v) => setParams((prev) => ({
									...prev,
									[k]: v
								}))
							}) : selected === "source" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13.5px] text-muted-foreground",
								children: source?.description ?? response.source?.description
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13.5px] text-muted-foreground",
								children: selectedNode?.detail ?? "Select the parameters node to edit this request."
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultViewer, { response })]
			})]
		})]
	});
}
//#endregion
export { CanvasPage as component };
