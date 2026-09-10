import { a as __toESM } from "../_runtime.mjs";
import { n as CATALOG_OPERATIONS } from "./catalog-DaTbh8nC.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as FileText, B as CircleDollarSign, D as KeyRound, G as ChevronDown, J as ChartColumn, K as Check, P as Database, R as Circle, U as ChevronUp, W as ChevronRight, X as Braces, Y as CalendarDays, Z as Bot, b as LogOut, d as Settings2, et as ArrowRight, g as Plus, i as User, l as SlidersHorizontal, p as Search, q as ChartLine, r as Wrench, t as Zap, tt as ArrowLeft, u as ShieldCheck, y as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as getMisoAccessStatus, o as savePreferences, r as getPreferences, s as useServerFn } from "./miso.functions-76DM3dDC.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-3HhpKDcy.mjs";
import { t as useAuth } from "./useAuth-_nE3K0OP.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DsfSjT0s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var API_DIRECTORY_GROUP_KEY = "miso-api-directory-group";
var groups = [
	{
		id: "all",
		label: "All APIs",
		description: "Browse the full catalog of MISO market and operational data."
	},
	{
		id: "pricing",
		label: "Pricing",
		description: "Day-ahead and real-time LMP and ancillary-service price APIs."
	},
	{
		id: "operations",
		label: "Load, generation & interchange",
		description: "Operational demand, generation, outage, forecast, and interchange APIs."
	}
];
function belongsToGroup(operation, group) {
	if (group === "all") return true;
	return group === "pricing" ? operation.endpoint.includes("/pricing/") : !operation.endpoint.includes("/pricing/");
}
function matchesSearch(operation, query) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return true;
	return [
		operation.name,
		operation.description,
		operation.endpoint,
		...operation.supports,
		...operation.required,
		...operation.optional
	].join(" ").toLowerCase().includes(normalized);
}
function apiPath(endpoint) {
	try {
		return new URL(endpoint).pathname;
	} catch {
		return endpoint;
	}
}
function conciseDescription(description) {
	return (description.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [description]).slice(0, 2).join(" ").trim();
}
function ApiExplorer({ initialGroup, onClose, onOpenChat }) {
	const [group, setGroup] = (0, import_react.useState)(initialGroup);
	const [query, setQuery] = (0, import_react.useState)("");
	const selectedGroup = groups.find((item) => item.id === group);
	const results = (0, import_react.useMemo)(() => CATALOG_OPERATIONS.filter((operation) => belongsToGroup(operation, group) && matchesSearch(operation, query)), [group, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_75%_0%,var(--color-accent-soft),transparent_32rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Back to Data Exchange"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-[12px] text-muted-foreground",
							children: [
								"API directory ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" }),
								" ",
								selectedGroup.label
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-3 text-[clamp(2.35rem,5vw,4.25rem)] font-medium leading-[1] tracking-[-0.045em]",
							children: [selectedGroup.label, " APIs"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground",
							children: [selectedGroup.description, " Each entry shows its purpose, availability, endpoint, and inputs before you run it."]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Search APIs, data, or parameters",
							className: "h-12 w-full rounded-xl border bg-card pl-11 pr-4 text-[13.5px] outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/15",
							"aria-label": "Search MISO APIs",
							autoFocus: true
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex gap-2 overflow-x-auto pb-1",
					children: groups.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setGroup(item.id),
						className: cn("shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors", group === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"),
						children: item.label
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[13px] text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: results.length
							}),
							" API",
							results.length === 1 ? "" : "s",
							" found",
							query ? ` for “${query}”` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "inline-flex items-center gap-1.5 text-[12px] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5 text-accent" }), "Market times use Eastern Prevailing Time"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-3",
					children: [results.map((operation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiEntry, {
						operation,
						directoryGroup: group,
						onOpenChat
					}, operation.source_id)), results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-dashed bg-card px-5 py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mx-auto size-5 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[14px] font-medium",
								children: "No API matched that search."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] text-muted-foreground",
								children: "Try “load”, “LMP”, “generation”, “outage”, or a parameter such as “region”."
							})
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpenChat(),
			"aria-label": "Open MISO AI chat",
			className: "fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:right-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), "Chat with MISO AI"]
		})]
	});
}
function ApiEntry({ operation, directoryGroup, onOpenChat }) {
	const pricing = operation.endpoint.includes("/pricing/");
	const details = conciseDescription(operation.description);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: "rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col justify-between gap-5 md:flex-row md:gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent",
							children: pricing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDollarSign, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[16px] font-medium",
									children: operation.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground",
									children: pricing ? "Pricing" : "Operations"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground",
								children: details
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoBlock, {
							icon: Braces,
							label: "Endpoint",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "break-all text-[11px]",
								children: apiPath(operation.endpoint)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoBlock, {
							icon: SlidersHorizontal,
							label: "Inputs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterSummary, { operation })
						})]
					}),
					operation.availability_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-start gap-2 rounded-lg bg-muted/45 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "mt-0.5 size-3.5 shrink-0 text-accent" }), operation.availability_note]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2 md:flex-col md:items-stretch md:justify-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onOpenChat(operation),
					className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 md:flex-none",
					children: ["Ask MISO AI", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-3.5" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/api-docs/$sourceId",
					params: { sourceId: operation.source_id },
					onClick: () => {
						try {
							window.sessionStorage.setItem(API_DIRECTORY_GROUP_KEY, directoryGroup);
						} catch {}
					},
					className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex-none",
					children: ["Official docs", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })]
				})]
			})]
		})
	});
}
function InfoBlock({ icon: Icon, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-muted/20 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-accent" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 text-[12px] text-foreground",
			children
		})]
	});
}
function ParameterSummary({ operation }) {
	if (!operation.parameters.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No inputs required" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "leading-relaxed",
		children: [operation.required.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: operation.required.join(", ") }), " required"] }), operation.optional.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-muted-foreground",
			children: [
				operation.required.length > 0 ? " · " : "",
				operation.optional.length,
				" optional"
			]
		})]
	});
}
function restoredDirectoryGroup() {
	if (typeof window === "undefined") return null;
	try {
		const group = window.sessionStorage.getItem(API_DIRECTORY_GROUP_KEY);
		window.sessionStorage.removeItem(API_DIRECTORY_GROUP_KEY);
		return group === "all" || group === "pricing" || group === "operations" ? group : null;
	} catch {
		return null;
	}
}
function DataExchangeHome({ onOpenChat, liveStatus }) {
	const [explorerGroup, setExplorerGroup] = (0, import_react.useState)(restoredDirectoryGroup);
	if (explorerGroup) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiExplorer, {
		initialGroup: explorerGroup,
		onClose: () => setExplorerGroup(null),
		onOpenChat
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_75%_0%,var(--color-accent-soft),transparent_32rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "animate-rise",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success" }), "MISO Data Exchange, simplified"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "max-w-3xl text-[clamp(2.7rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.055em]",
							children: [
								"Find the market data you need.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "Use it with confidence."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]",
							children: "Search MISO APIs in plain language, complete every required field in one place, and bring a production-safe request to your own system."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenChat(),
								className: "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
									"Ask MISO AI",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#apis",
								className: "inline-flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-[14px] font-medium transition-colors hover:bg-muted",
								children: "Explore API groups"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustItem, {
									icon: ShieldCheck,
									text: "Complete pagination"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustItem, {
									icon: ChartLine,
									text: "MISO time clarity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustItem, {
									icon: Database,
									text: "Backend-ready"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "animate-rise rounded-3xl border bg-card p-5 shadow-lift [animation-delay:120ms] sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 border-b pb-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
								children: "Start with a question"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[17px] font-medium",
								children: "MISO AI request builder"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success",
								children: "Guided"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 rounded-2xl border bg-surface/60 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] text-muted-foreground",
								children: "Example request"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[16px] font-medium leading-snug",
								children: "“Give me real-time LMP for Indiana yesterday.”"
							})]
						}),
						liveStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between gap-3 rounded-xl border bg-muted/25 px-3 py-2.5 text-[11.5px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${liveStatus.connected && liveStatus.mode === "live" ? "animate-pulse bg-success" : "bg-accent"}` }), liveStatus.mode === "live" ? "Live MISO connection" : "Preview data connection"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Checked",
								" ",
								new Date(liveStatus.checkedAt).toLocaleTimeString([], {
									hour: "numeric",
									minute: "2-digit"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-5 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowStep, {
									number: "1",
									title: "Match the right API",
									copy: "Finds the catalog-backed MISO source."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowStep, {
									number: "2",
									title: "Complete required fields",
									copy: "Shows every required parameter together."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowStep, {
									number: "3",
									title: "Take it to production",
									copy: "Includes pagination, time, and retry guidance."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onOpenChat(),
							className: "mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-[13.5px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground",
							children: ["Build a request with MISO AI", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "apis",
				className: "mt-20 scroll-mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] font-medium uppercase tracking-[0.12em] text-accent",
						children: "API groups"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-[clamp(1.8rem,4vw,2.7rem)] font-medium tracking-tight",
						children: "Start from the data you need"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setExplorerGroup("all"),
						className: "inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" }), "Search APIs"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiGroup, {
							icon: ChartColumn,
							title: "Pricing",
							copy: "Day-ahead and real-time LMP and ancillary-service prices.",
							examples: "LMP · MCP · pricing nodes",
							onExplore: () => setExplorerGroup("pricing")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiGroup, {
							icon: Zap,
							title: "Load, generation & interchange",
							copy: "Operational demand, fuel mix, generation, and interchange data.",
							examples: "Actual load · fuel type · outages",
							onExplore: () => setExplorerGroup("operations")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiGroup, {
							icon: Braces,
							title: "Integration support",
							copy: "Build a durable ingestion workflow without losing records.",
							examples: "Pagination · retries · time basis",
							onExplore: () => setExplorerGroup("all")
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpenChat(),
			"aria-label": "Open MISO AI chat",
			className: "fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:right-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), "Chat with MISO AI"]
		})]
	});
}
function TrustItem({ icon: Icon, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-accent" }), text]
	});
}
function WorkflowStep({ number, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground",
			children: number
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[13.5px] font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground",
			children: copy
		})] })]
	});
}
function ApiGroup({ icon: Icon, title, copy, examples, onExplore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 text-[17px] font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13.5px] leading-relaxed text-muted-foreground",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 font-mono text-[11px] text-muted-foreground",
				children: examples
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onExplore,
				className: "mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline",
				children: [
					"Explore APIs",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5" })
				]
			})
		]
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var DEFAULTS = {
	output_format: "auto",
	units: "MW",
	region: "MISO",
	always_show_api: false
};
function PreferencesDialog({ open, onOpenChange }) {
	const [prefs, setPrefs] = (0, import_react.useState)(DEFAULTS);
	const load = useServerFn(getPreferences);
	const save = useServerFn(savePreferences);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		load().then(setPrefs).catch(() => void 0);
	}, [open, load]);
	const commit = async () => {
		try {
			await save({ data: prefs });
			toast.success("Preferences saved");
			onOpenChange(false);
		} catch {
			toast.error("Couldn't save your preferences");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-[19px] font-medium tracking-tight",
					children: "Preferences"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-[13.5px]",
					children: "These shape how results are presented. Credentials are never stored in your browser."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-[13px]",
								children: "Preferred output"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: prefs.output_format,
								onValueChange: (v) => setPrefs((p) => ({
									...p,
									output_format: v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "rounded-lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "auto",
										children: "Let MISO AI decide"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "table",
										children: "Table"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "chart",
										children: "Chart"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "summary",
										children: "Short summary"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[13px]",
									children: "Units"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: prefs.units,
									onValueChange: (v) => setPrefs((p) => ({
										...p,
										units: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "rounded-lg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "MW",
										children: "MW"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "GW",
										children: "GW"
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[13px]",
									children: "Region"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: prefs.region,
									onValueChange: (v) => setPrefs((p) => ({
										...p,
										region: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "rounded-lg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
										"MISO",
										"North",
										"Central",
										"South",
										"Indiana",
										"Michigan",
										"Louisiana"
									].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: r,
										children: r
									}, r)) })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13.5px]",
								children: "Always show API details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12.5px] text-muted-foreground",
								children: "Include the request and code with every answer."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: prefs.always_show_api,
								onCheckedChange: (v) => setPrefs((p) => ({
									...p,
									always_show_api: v
								}))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void commit(),
					className: "w-full rounded-full",
					children: "Save"
				})
			]
		})
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function UserMenu({ email, misoConnected, onSignOut, onPreferences }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "rounded-full border",
			"aria-label": "Account menu",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-64 rounded-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
				className: "font-normal",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[13px]",
					children: email
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] text-muted-foreground",
					children: "MISO API Access"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 flex items-center gap-1.5 text-[13px]",
					children: misoConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-success" }), "Connected"] }) : "Not authorized"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: onPreferences,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }), "Preferences"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/canvas",
					children: "Open Canvas"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/reports",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), "Report library"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/subscription-keys",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), "Subscription keys"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: onSignOut,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
			})
		]
	})] });
}
function Home() {
	const { user, loading, signOut } = useAuth();
	const navigate = useNavigate();
	const [misoConnected, setMisoConnected] = (0, import_react.useState)(false);
	const [misoMode, setMisoMode] = (0, import_react.useState)(null);
	const [misoCheckedAt, setMisoCheckedAt] = (0, import_react.useState)(null);
	const [prefsOpen, setPrefsOpen] = (0, import_react.useState)(false);
	/**
	* There is one user-facing assistant path. Redirect instead of opening the
	* legacy server-function drawer so requests always reach the local Django
	* agent and its verification/error workflow.
	*/
	const openChat = (0, import_react.useCallback)((operation) => {
		navigate({
			to: "/integration-lab",
			search: operation ? { api: operation.source_id } : {}
		});
	}, [navigate]);
	const fetchAccess = useServerFn(getMisoAccessStatus);
	const refreshAccess = (0, import_react.useCallback)(() => {
		if (!user) return;
		fetchAccess().then((status) => {
			setMisoConnected(status.connected);
			setMisoMode(status.mode);
			setMisoCheckedAt(status.checked_at);
		}).catch(() => void 0);
	}, [fetchAccess, user]);
	(0, import_react.useEffect)(() => {
		if (!user) {
			setMisoConnected(false);
			setMisoMode(null);
			setMisoCheckedAt(null);
			return;
		}
		refreshAccess();
		const interval = window.setInterval(refreshAccess, 3e4);
		return () => window.clearInterval(interval);
	}, [refreshAccess, user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen overflow-hidden bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-screen min-h-0 min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "z-10 flex shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[14.5px] font-medium tracking-tight",
							children: "MISO AI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden truncate text-[12.5px] text-muted-foreground sm:block",
							children: "Find MISO data without learning how to find it."
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						user && misoConnected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[12px] text-muted-foreground sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-success" }), "MISO API Access"]
						}),
						user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "New request",
							onClick: () => openChat(),
							className: "md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => openChat(),
							className: "hidden gap-2 rounded-full sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), "Ask MISO AI"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "hidden gap-2 rounded-full md:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/reports",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), "Reports"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "hidden gap-2 rounded-full lg:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/subscription-keys",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5" }), "Keys"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "hidden gap-2 rounded-full lg:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/integration-lab",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-3.5" }), "Integration lab"]
							})
						}),
						loading ? null : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, {
							email: user.email ?? "",
							misoConnected,
							onSignOut: () => void signOut(),
							onPreferences: () => setPrefsOpen(true)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "Sign in"
							})
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataExchangeHome, {
				onOpenChat: openChat,
				liveStatus: misoMode && misoCheckedAt ? {
					mode: misoMode,
					checkedAt: misoCheckedAt,
					connected: misoConnected
				} : void 0
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesDialog, {
			open: prefsOpen,
			onOpenChange: setPrefsOpen
		})]
	});
}
//#endregion
export { Home as component };
