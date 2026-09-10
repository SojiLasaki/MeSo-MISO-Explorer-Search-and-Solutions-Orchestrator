import { a as __toESM } from "../_runtime.mjs";
import { n as CATALOG_OPERATIONS } from "./catalog-DaTbh8nC.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as ArrowUpRight, A as FileText, C as LoaderCircle, D as KeyRound, G as ChevronDown, H as CircleAlert, I as CodeXml, M as Earth, N as Download, O as History, P as Database, Q as ArrowUp, V as CircleCheck, _ as Play, c as Sparkles, n as X, nt as Activity, s as SquareTerminal, tt as ArrowLeft, u as ShieldCheck, z as CircleX } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as legacyReportBySourceId } from "./legacy-reports-jmctEBAE.mjs";
import { n as getSource } from "./registry-ByJMkCvd.mjs";
import { t as Route } from "./integration-lab-BM2Xf2XL.mjs";
import { n as localApi, t as localAgentDownloadUrl } from "./local-backend-BkBhOPCe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integration-lab-BtVdSqEe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var generalPrompts = [
	"What was the actual load yesterday?",
	"Give me hourly power usage for the North region yesterday.",
	"Show me today’s market prices.",
	"Give me the API for actual load yesterday."
];
var PTD_ENDPOINT_IDS = /* @__PURE__ */ new Set([
	"actual_load",
	"day_ahead_demand",
	"realtime_lmp",
	"realtime_generation_fuel_type"
]);
function ptdHandoffHref(result) {
	const endpoint = result.endpoint?.id;
	if (!endpoint || !PTD_ENDPOINT_IDS.has(endpoint) || result.status !== "success") return null;
	const search = new URLSearchParams({
		from: "miso-agent",
		endpoint
	});
	for (const [key, value] of Object.entries(result.parameters ?? {})) if (value) search.set(key, value);
	return `/power-trader?${search.toString()}`;
}
function WebDataAgent({ powerTrader = false, initialReport, initialApi }) {
	const [connection, setConnection] = (0, import_react.useState)();
	const [keyState, setKeyState] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("simulation");
	const [message, setMessage] = (0, import_react.useState)("");
	const [sessionId, setSessionId] = (0, import_react.useState)();
	const [result, setResult] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [detailsOpen, setDetailsOpen] = (0, import_react.useState)(false);
	const [errorOpen, setErrorOpen] = (0, import_react.useState)(false);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [historyLoading, setHistoryLoading] = (0, import_react.useState)(false);
	const [savedSessions, setSavedSessions] = (0, import_react.useState)([]);
	const submittedContext = (0, import_react.useRef)(null);
	const messageInput = (0, import_react.useRef)(null);
	const prompts = initialApi ? [
		`Show ${initialApi.name} for yesterday.`,
		`What parameters does ${initialApi.name} require?`,
		`Give me the API request for ${initialApi.name} yesterday.`,
		`How do I add ${initialApi.name} to my backend?`
	] : powerTrader ? [
		"What was the hourly actual load for the North region yesterday?",
		"Show today’s real-time LMP at Indiana Hub.",
		"Give me the API for hourly actual load yesterday.",
		"Add hourly Actual Load to my trading backend for yesterday."
	] : generalPrompts;
	const refreshConnection = async () => {
		try {
			const [nextConnection, nextKey] = await Promise.all([localApi("/health/"), localApi("/miso/subscription-key/")]);
			setConnection(nextConnection);
			setKeyState(nextKey);
			if (nextConnection.miso_mode === "live") setMode("live");
		} catch {
			setConnection(null);
		}
	};
	const refreshSavedSessions = async () => {
		setHistoryLoading(true);
		try {
			const next = await localApi("/agent/sessions/");
			setSavedSessions(next.sessions);
		} finally {
			setHistoryLoading(false);
		}
	};
	const loadSavedSession = async (savedSessionId) => {
		setHistoryLoading(true);
		try {
			const next = await localApi(`/agent/sessions/${savedSessionId}/`);
			setSessionId(next.session.session_id);
			setHistory(next.messages.map((item) => ({
				role: item.role === "assistant" ? "agent" : "user",
				text: item.content
			})));
			const lastResult = [...next.messages].reverse().find((item) => item.role === "assistant" && typeof item.payload?.["status"] === "string");
			setResult(lastResult ? lastResult.payload : null);
			setHistoryOpen(false);
		} finally {
			setHistoryLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refreshConnection();
	}, []);
	(0, import_react.useEffect)(() => {
		const contextId = initialApi ? `api:${initialApi.source_id}` : initialReport ? `report:${initialReport.sourceId}` : null;
		if (!contextId || submittedContext.current === contextId) return;
		submittedContext.current = contextId;
		if (initialApi) {
			const required = initialApi.parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name);
			setHistory([{
				role: "agent",
				text: `API context loaded: ${initialApi.name}. This chat is scoped to ${initialApi.method} ${initialApi.endpoint}. ${required.length ? `Required input: ${required.join(", ")}.` : "No required parameters are listed."} Ask what you would like to do with this API.`
			}]);
			return;
		}
		if (!initialReport) return;
		const mapped = initialReport.apiReplacement ? ` Its API-first replacement is ${initialReport.apiReplacement}${initialReport.endpoint ? ` (${initialReport.method ?? "GET"} ${initialReport.endpoint})` : ""}${initialReport.requiredParameters?.length ? `; required input: ${initialReport.requiredParameters.join(", ")}.` : "."}` : " No catalog-backed API replacement is recorded, so I will keep this as a report/archive request.";
		setHistory([{
			role: "agent",
			text: `Report context loaded: ${initialReport.title}.${mapped}`
		}]);
	}, [initialApi, initialReport]);
	const send = async (question = message) => {
		const trimmed = question.trim();
		if (!trimmed || running) return;
		setHistory((items) => [...items, {
			role: "user",
			text: trimmed
		}]);
		setMessage("");
		if (messageInput.current) messageInput.current.style.height = "";
		setRunning(true);
		try {
			const selectedSourceId = initialApi?.source_id ?? initialReport?.apiReplacementSourceId;
			const next = await localApi("/chat/", {
				method: "POST",
				body: JSON.stringify({
					question: trimmed,
					session_id: sessionId,
					mode,
					selected_source_id: selectedSourceId
				})
			});
			setResult(next);
			setSessionId(next.session_id ?? sessionId);
			setHistory((items) => [...items, {
				role: "agent",
				text: next.message
			}]);
			if (next.status === "error") setErrorOpen(true);
			refreshSavedSessions();
		} catch (error) {
			const text = error instanceof Error ? error.message : "Could not reach the Django backend.";
			setResult({
				status: "error",
				message: text,
				events: [],
				error: {
					status_code: 503,
					category: "local_connection",
					what_happened: text,
					suggested_fix: "Start Django on port 8000, then refresh this page.",
					can_retry: true,
					safe_request_context: {}
				}
			});
			setErrorOpen(true);
		} finally {
			setRunning(false);
		}
	};
	const run505 = async () => {
		setRunning(true);
		try {
			const next = await localApi("/errors/simulate/", {
				method: "POST",
				body: JSON.stringify({
					status_code: 505,
					endpoint_id: "actual_load",
					parameters: { date: "2026-09-08" }
				})
			});
			setResult(next);
			setErrorOpen(true);
		} finally {
			setRunning(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh min-h-[680px] flex-col overflow-hidden bg-[radial-gradient(circle_at_82%_0%,var(--color-accent-soft),transparent_35rem)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b bg-background/80 px-5 py-3 backdrop-blur-xl sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "h-8 w-fit justify-self-start rounded-full px-2.5 text-[11.5px] text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Go back"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[14px] font-medium",
							children: powerTrader ? "Power Trader Data Agent" : "MISO Data Agent"
						}), initialApi && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-56 truncate text-[11px] text-muted-foreground",
							children: ["Focused API: ", initialApi.name]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-self-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-8 rounded-full px-2.5 text-[11.5px]",
								onClick: () => {
									setHistoryOpen(true);
									refreshSavedSessions();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-3.5" }), "History"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "h-8 rounded-full px-2.5 text-[11.5px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/reports",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), "Reports"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeToggle, {
								mode,
								setMode,
								liveAvailable: connection?.miso_mode === "live"
							})
						]
					})
				]
			}),
			historyOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 flex justify-end",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Chat history",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Close chat history",
					onClick: () => setHistoryOpen(false),
					className: "absolute inset-0 bg-foreground/15 backdrop-blur-[1px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "relative flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[15px] font-medium",
							children: "Chat history"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[11.5px] text-muted-foreground",
							children: "Saved locally by the Web Data Agent"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "rounded-full",
							"aria-label": "Close chat history",
							onClick: () => setHistoryOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-h-0 flex-1 overflow-y-auto p-4",
						children: [
							historyLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-2 py-4 text-[12.5px] text-muted-foreground",
								children: "Loading conversations…"
							}),
							!historyLoading && savedSessions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-2 py-4 text-[12.5px] leading-relaxed text-muted-foreground",
								children: "Your completed Web Data Agent conversations will appear here."
							}),
							!historyLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: savedSessions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void loadSavedSession(item.session_id),
									className: cn("w-full rounded-2xl border p-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/20", item.session_id === sessionId && "border-accent bg-accent-soft/20"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[12.5px] font-medium",
										children: item.preview
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[10.5px] text-muted-foreground",
										children: [
											item.message_count,
											" messages · ",
											new Date(item.updated_at).toLocaleString()
										]
									})]
								}, item.session_id))
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "min-h-0 flex-1 overflow-y-auto pb-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10",
					children: [
						!history.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto flex min-h-[calc(100dvh-12rem)] max-w-3xl flex-col justify-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mx-auto size-7 text-accent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-4 text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1] tracking-[-0.045em]",
									children: initialApi ? `What would you like to do with ${initialApi.name}?` : "What would you like to do?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground",
									children: initialApi ? "The selected API’s verified catalog metadata is already in this conversation." : initialReport ? `Focused on ${initialReport.title}. Its report and API-replacement context is ready.` : "Ask for data, a chart, API guidance, or a report. Implementation work is sent to your local agent only when you request it."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 grid gap-4 text-left sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionCard, {
										keyState,
										connection,
										onRefresh: refreshConnection
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorCenter, {
										onRun505: () => void run505(),
										running
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 border-t pt-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
										children: "Recommended tasks"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap justify-center gap-2",
										children: prompts.map((prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void send(prompt),
											className: "rounded-full border bg-background px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground",
											children: prompt
										}, prompt))
									})]
								})
							]
						}),
						history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-4xl space-y-4 pt-4",
							children: [history.map((turn, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed", turn.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border bg-card/90 text-foreground shadow-soft"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-1 text-[10px] font-medium uppercase tracking-[0.1em] opacity-65",
									children: turn.role === "user" ? "You" : "MISO AI"
								}), turn.text]
							}, index)), running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[12.5px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-accent" }), " Agent is resolving parameters and preparing a request…"]
							})]
						}),
						result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mx-auto mt-5 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-3xl border bg-card p-5 shadow-soft sm:p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPanel, {
										result,
										detailsOpen,
										setDetailsOpen,
										onQuickReply: (text) => void send(text)
									}),
									result.delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryRoute, { delivery: result.delivery }),
									result.handoff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAgentHandoff, { handoff: result.handoff })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentTimeline, { events: result.events })]
						}),
						result?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mx-auto mt-5 max-w-6xl rounded-3xl border border-destructive/25 bg-card p-5 shadow-soft sm:p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setErrorOpen((open) => !open),
								className: "flex w-full items-center justify-between text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2 text-[15px] font-medium",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-destructive" }),
										" Error Center — HTTP ",
										result.error.status_code
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform", errorOpen && "rotate-180") })]
							}), errorOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorDiagnosis, {
								error: result.error,
								request: result.request
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					send();
				},
				className: "fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 px-5 pb-6 pt-3 backdrop-blur-xl sm:px-8 sm:pb-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border bg-card p-2 shadow-lift",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						ref: messageInput,
						value: message,
						onChange: (event) => {
							setMessage(event.target.value);
							event.currentTarget.style.height = "auto";
							event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 144)}px`;
						},
						rows: 1,
						placeholder: "Ask about MISO data, a report, an endpoint, or a technical integration…",
						className: "h-9 min-h-9 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-[13px] outline-none placeholder:text-muted-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "shrink-0 rounded-xl",
						disabled: running || !message.trim(),
						"aria-label": "Send question",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
					})]
				})
			})
		]
	});
}
function ModeToggle({ mode, setMode, liveAvailable }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex rounded-full border bg-muted/20 p-0.5 text-[11px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setMode("simulation"),
			className: cn("rounded-full px-2.5 py-1", mode === "simulation" && "bg-accent-soft text-accent"),
			children: "Simulation"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: !liveAvailable,
			title: liveAvailable ? "Use configured MISO credentials" : "Configure MISO_SUBSCRIPTION_KEY in backend/.env first",
			onClick: () => setMode("live"),
			className: cn("rounded-full px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-45", mode === "live" && "bg-success-soft text-success"),
			children: "Live MISO"
		})]
	});
}
function ConnectionCard({ keyState, connection, onRefresh }) {
	const checking = connection === void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border bg-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14px] font-medium",
					children: "Web Agent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
					children: keyState?.configured ? "Subscription key configured server-side. The browser and local agent cannot read it." : "Use simulation now, or configure a subscription key in the web service environment."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void onRefresh(),
				className: cn("mt-4 w-full rounded-xl border px-3 py-2 text-left text-[12px] transition-colors hover:border-accent", checking ? "bg-muted/20 text-muted-foreground" : connection ? "border-success/25 bg-success-soft text-success" : "border-destructive/25 bg-destructive-soft text-destructive"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mr-1.5 inline size-3.5" }), checking ? "Checking web agent connection…" : connection ? `Web agent online · ${connection.miso_mode} mode` : "Web agent unavailable — refresh to retry"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: keyState?.portal_url ?? "https://data-exchange.misoenergy.org/products",
				target: "_blank",
				rel: "noreferrer",
				className: "mt-4 inline-flex text-[12px] font-medium text-accent hover:underline",
				children: "Manage subscription keys in MISO Data Exchange →"
			})
		]
	});
}
function ErrorCenter({ onRun505, running }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border bg-card p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareTerminal, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[14px] font-medium",
				children: "505 Error Center"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
				children: "Trigger an intentional HTTP Version Not Supported response. The web agent diagnoses it and sends only safe remediation instructions to the local agent."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			className: "mt-4 w-full rounded-xl",
			disabled: running,
			onClick: onRun505,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), "Simulate HTTP 505"]
		})]
	});
}
function ResultPanel({ result, detailsOpen, setDetailsOpen, onQuickReply }) {
	const rows = result.data?.data?.slice(0, 6) ?? [];
	const label = result.status === "needs_input" ? "DETAIL NEEDED" : result.status === "validation_error" ? "PARAMETER NEEDS ATTENTION" : result.simulated ? "SIMULATED RESPONSE" : result.status === "error" ? "REQUEST FAILED" : result.api_only ? "API REQUEST READY" : result.integration_guidance ? "INTEGRATION TEMPLATE" : result.report ? "OFFICIAL REPORT" : "REQUEST VERIFIED";
	const handoffHref = ptdHandoffHref(result);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-medium", result.simulated ? "bg-accent-soft text-accent" : result.status === "error" ? "bg-destructive-soft text-destructive" : result.api_only || result.integration_guidance ? "bg-accent-soft text-accent" : "bg-success-soft text-success"),
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-[20px] font-medium",
					children: result.endpoint?.name ?? result.report?.title ?? "Agent response"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-muted-foreground",
					children: result.message
				})
			] }), typeof result.verification?.status_code === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5 text-[11.5px] text-success",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }),
					"HTTP ",
					result.verification.status_code
				]
			})]
		}),
		result.report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 rounded-2xl border bg-muted/20 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] leading-relaxed text-muted-foreground",
				children: result.report.description
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: result.report.url,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 inline-flex text-[12px] font-medium text-accent hover:underline",
				children: "Open official MISO report →"
			})]
		}),
		result.missing_parameters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 rounded-2xl border border-accent/20 bg-accent-soft/25 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] font-medium",
					children: "One detail is needed before I can continue."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: result.missing_parameters.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onQuickReply("yesterday"),
						className: "rounded-full border bg-card px-3 py-1.5 text-[12px] hover:border-accent",
						children: "Use yesterday"
					}, item.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[12px] text-muted-foreground",
					children: result.message
				})
			]
		}),
		result.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: Object.entries(result.summary).map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border bg-muted/20 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[16px] font-medium",
					children: typeof value === "number" ? value.toLocaleString() : value
				})]
			}, label))
		}),
		handoffHref && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: handoffHref,
			className: "mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-accent-soft/20 px-4 py-3 transition-colors hover:bg-accent-soft/35",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] font-medium",
				children: "Open in PTD Infographcs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground",
				children: "Transfer this non-secret endpoint and its resolved parameters to the separate chart workspace."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-accent" })]
		}),
		result.chart_requested && rows.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, { rows: result.data?.data ?? [] }),
		rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 overflow-hidden rounded-2xl border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 border-b bg-muted/25 px-3 py-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Market date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Interval" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Value" })
				]
			}), rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 border-b px-3 py-2 text-[12px] last:border-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: String(row.marketDate ?? "—") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: String(row.interval ?? "—") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: Number(row.value ?? 0).toLocaleString() })
				]
			}, index))]
		}),
		result.request && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 overflow-hidden rounded-2xl border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setDetailsOpen(!detailsOpen),
				className: "flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "size-3.5 text-accent" }), " Request verification"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform", detailsOpen && "rotate-180") })]
			}), detailsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t bg-muted/10 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid gap-3 text-[12px] sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
							label: "Method",
							value: result.request.method
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
							label: "Authentication",
							value: "Applied only server-side"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
							label: "Endpoint",
							value: result.request.endpoint,
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
							label: "Parameters",
							value: Object.entries(result.parameters ?? {}).map(([key, value]) => `${key} = ${value}`).join(" · ") || "None",
							mono: true
						})
					]
				})
			})]
		})
	] });
}
function Detail({ label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: cn("mt-1 break-all", mono && "font-mono text-[10.5px]"),
		children: value
	})] });
}
function MiniChart({ rows }) {
	const values = rows.map((row) => Number(row.value)).filter(Number.isFinite);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const points = values.map((value, index) => {
		return `${index / Math.max(values.length - 1, 1) * 100},${92 - (value - min) / Math.max(max - min, 1) * 78}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-2xl border bg-muted/10 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] font-medium",
					children: "Requested chart"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10.5px] text-muted-foreground",
					children: "Development data when labelled simulated"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 100 100",
				preserveAspectRatio: "none",
				className: "mt-3 h-36 w-full overflow-visible",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0,92 H100",
					stroke: "currentColor",
					className: "text-border",
					strokeWidth: "0.7",
					fill: "none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
					points,
					vectorEffect: "non-scaling-stroke",
					fill: "none",
					stroke: "currentColor",
					className: "text-accent",
					strokeWidth: "2",
					strokeLinejoin: "round",
					strokeLinecap: "round"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-[10.5px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: min.toLocaleString() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: max.toLocaleString() })]
			})
		]
	});
}
function DeliveryRoute({ delivery }) {
	const local = delivery.requires_local_agent;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("mt-5 rounded-2xl border p-4", local ? "border-accent/25 bg-accent-soft/20" : "border-success/25 bg-success-soft/20"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-[13px] font-medium",
				children: [local ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "size-4 text-success" }), local ? "Local Integration Agent required" : "Handled online"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
				children: delivery.reason
			}),
			local && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: localAgentDownloadUrl(),
				className: "mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent",
				download: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Download Local Agent"]
			})
		]
	});
}
function LocalAgentHandoff({ handoff }) {
	const [status, setStatus] = (0, import_react.useState)(handoff.status);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		const check = async () => {
			try {
				const next = await localApi(`/agent/handoffs/${handoff.id}/`);
				if (active) {
					setStatus(next.status);
					setReceipt(next.receipt);
				}
			} catch {}
		};
		check();
		const timer = window.setInterval(() => void check(), 1500);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, [handoff.id]);
	const complete = status === "completed";
	const generatedDirectory = receipt?.["generated_directory"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("mt-5 rounded-2xl border p-4", complete ? "border-success/25 bg-success-soft/25" : "border-accent/25 bg-accent-soft/20"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-[13px] font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: cn("size-4", complete ? "text-success" : "text-accent") }), " Local Integration Agent"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
				children: complete ? generatedDirectory ? "The local agent verified the signed instruction and created a reviewable integration package. It did not receive a subscription key." : "The local agent verified the signed instruction and wrote a reviewable integration manifest. It did not receive a subscription key." : "The web agent has queued a signed, secret-free instruction. Run python local_agent/agent.py --once --apply to create the local integration package."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: localAgentDownloadUrl(),
				className: "mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-accent hover:border-accent",
				download: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Download Local Agent"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between rounded-xl border bg-card/60 px-3 py-2 text-[11.5px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium capitalize",
					children: status
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
					className: "text-muted-foreground",
					children: ["handoff ", handoff.id.slice(0, 8)]
				})]
			}),
			generatedDirectory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 break-all text-[11px] text-muted-foreground",
				children: ["Integration package: ", String(generatedDirectory)]
			}),
			receipt?.["manifest_path"] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 break-all text-[11px] text-muted-foreground",
				children: ["Manifest: ", String(receipt["manifest_path"])]
			})
		]
	});
}
function AgentTimeline({ events }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border bg-card p-5 shadow-soft sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-[14px] font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-accent" }), " Agent execution"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-5 space-y-4",
			children: events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", event.status === "error" ? "bg-destructive-soft text-destructive" : event.status === "warning" ? "bg-accent-soft text-accent" : "bg-success-soft text-success"),
					children: event.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }) : event.status === "warning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12.5px] font-medium capitalize",
					children: event.stage
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[12px] leading-relaxed text-muted-foreground",
					children: event.message
				})] })]
			}, index))
		})]
	});
}
function ErrorDiagnosis({ error, request }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border bg-destructive-soft/25 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10.5px] font-medium uppercase tracking-wide text-destructive",
						children: "What happened"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[13px] leading-relaxed",
						children: error.what_happened
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-[11.5px] text-muted-foreground",
						children: ["Classification: ", error.category.replace("_", " ")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border bg-muted/20 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
						children: "Agent recommendation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[13px] leading-relaxed",
						children: error.suggested_fix
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[11.5px] text-muted-foreground",
						children: error.can_retry ? "Retry is permitted after this check." : "A retry is not recommended until configuration is corrected."
					})
				]
			}),
			request && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2 rounded-2xl border bg-muted/10 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
						children: "Safe request context"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
						className: "mt-2 block break-all text-[11px]",
						children: [
							request.method,
							" ",
							request.url
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: "No subscription key or authorization value was recorded."
					})
				]
			})
		]
	});
}
function IntegrationLabRoute() {
	const { report: reportId, api: apiId } = Route.useSearch();
	const report = reportId ? legacyReportBySourceId(reportId) : void 0;
	const replacement = report?.api_replacement ? getSource(report.api_replacement.source_id) : void 0;
	const initialApi = apiId ? CATALOG_OPERATIONS.find((operation) => operation.source_id === apiId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebDataAgent, {
		initialApi,
		initialReport: report ? {
			sourceId: report.source_id,
			title: report.title,
			description: report.description,
			url: report.url,
			apiReplacement: replacement?.name,
			apiReplacementSourceId: report.api_replacement?.source_id,
			endpoint: replacement?.endpoint,
			method: replacement?.method,
			requiredParameters: (replacement?.parameters ?? []).filter((parameter) => parameter.required).map((parameter) => parameter.name)
		} : void 0
	});
}
//#endregion
export { IntegrationLabRoute as component };
