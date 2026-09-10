import { a as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as ArrowUpRight, A as FileText, D as KeyRound, I as CodeXml, V as CircleCheck, W as ChevronRight, Z as Bot, c as Sparkles, n as X, p as Search, r as Wrench, y as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as searchLegacyReports } from "./legacy-reports-jmctEBAE.mjs";
import { n as getSource } from "./registry-ByJMkCvd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-D0-9eag8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var filters = [
	"All",
	"Pricing",
	"Load & generation",
	"Guidance",
	"Archive"
];
function ReportLibrary() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("All");
	const [aiReport, setAiReport] = (0, import_react.useState)(null);
	const reports = (0, import_react.useMemo)(() => searchLegacyReports(query).filter((report) => filter === "All" || report.category === filter), [filter, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_72%_0%,var(--color-accent-soft),transparent_34rem)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "min-w-0 text-[14.5px] font-medium tracking-tight transition-colors hover:text-accent",
						children: "MISO AI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Primary navigation",
						className: "flex items-center gap-1.5 text-[12px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/integration-lab",
								className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Ask MISO AI"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/reports",
								activeProps: { className: "bg-accent-soft text-accent" },
								className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Reports"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/subscription-keys",
								className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden md:inline",
									children: "Keys"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/integration-lab",
								className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden md:inline",
									children: "Integration"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid gap-7 lg:grid-cols-[1fr_330px] lg:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] font-medium uppercase tracking-[0.12em] text-accent",
								children: "Report library"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-3 max-w-3xl text-[clamp(2.35rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.05em]",
								children: ["Find the report. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "Or move to the API."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground",
								children: "Search official MISO report references, archives, reader guides, and report-to-endpoint mappings. For recurring data, MISO AI prioritizes the matching Data Exchange API."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border bg-card p-4 shadow-soft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 size-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-medium",
									children: "How MISO AI searches"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[12px] leading-relaxed text-muted-foreground",
									children: "API first for live, structured data. Archive-first only when you explicitly ask for a legacy report, older file, reader’s guide, or mapping."
								})] })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative mt-9 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Search reports, archives, reader guides, or API replacements",
							className: "h-13 w-full rounded-2xl border bg-card pl-11 pr-4 text-[14px] outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/15"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex gap-2 overflow-x-auto pb-1",
						children: filters.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFilter(item),
							className: cn("shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors", filter === item ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"),
							children: item
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-7 flex items-center justify-between gap-4 border-b pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[13px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: reports.length
								}),
								" official MISO reference",
								reports.length === 1 ? "" : "s"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/",
							target: "_blank",
							rel: "noreferrer",
							className: "hidden items-center gap-1.5 text-[12.5px] font-medium text-accent hover:underline sm:inline-flex",
							children: ["MISO market reports ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-4 lg:grid-cols-2",
						children: reports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportCard, {
							report,
							onAskAi: setAiReport
						}, report.source_id))
					}),
					reports.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl border border-dashed bg-card px-5 py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mx-auto size-5 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[14px] font-medium",
								children: "No report reference matched that search."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] text-muted-foreground",
								children: "Try “pricing”, “actual load”, “archive”, “mapping”, or “retired”."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-[12px] leading-relaxed text-muted-foreground",
						children: "This library indexes official MISO URLs and reader guides; it does not copy protected report contents. Ask MISO AI for a chart to retrieve the appropriate API data when an API replacement is available."
					})
				]
			}),
			aiReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportAiDrawer, {
				report: aiReport,
				onClose: () => setAiReport(null)
			})
		]
	});
}
function ReportCard({ report, onAskAi }) {
	const replacement = report.api_replacement ? getSource(report.api_replacement.source_id) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex min-h-72 flex-col rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground",
					children: report.category
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-5 text-[17px] font-medium tracking-tight",
				children: report.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] leading-relaxed text-muted-foreground",
				children: report.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 rounded-xl border bg-muted/25 p-3",
				children: replacement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
						children: "API replacement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[12.5px] font-medium",
						children: replacement.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-all font-mono text-[10.5px] text-muted-foreground",
						children: replacement.endpoint
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground",
					children: "Official reference"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12.5px]",
					children: report.format
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex gap-2 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: report.url,
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90",
					children: ["Open MISO file ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onAskAi(report),
					className: "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-3.5" }), "Ask AI"]
				})]
			})
		]
	});
}
function ReportAiDrawer({ report, onClose }) {
	const mappedSource = report.api_replacement ? getSource(report.api_replacement.source_id) : void 0;
	const required = (mappedSource?.parameters ?? []).filter((parameter) => parameter.required);
	const optional = (mappedSource?.parameters ?? []).filter((parameter) => !parameter.required);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Ask MISO AI about this report",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close report AI",
			onClick: onClose,
			className: "absolute inset-0 bg-foreground/15 backdrop-blur-[1px]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "relative flex h-full w-full max-w-[500px] flex-col border-l bg-background shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b px-5 py-4 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-lg bg-accent-soft text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[14px] font-medium",
							children: "Ask MISO AI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Report-aware endpoint mapping"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border bg-muted/20 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent",
									children: "Selected report"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 text-[19px] font-medium tracking-tight",
									children: report.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[13px] leading-relaxed text-muted-foreground",
									children: report.description
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "mt-5 rounded-2xl border border-accent/20 bg-accent-soft/20 p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 size-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-medium",
									children: "MISO AI mapping response"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[12.5px] leading-relaxed text-muted-foreground",
									children: mappedSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										"For recurring data, this report maps to ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: mappedSource.name
										}),
										". I’ll use the mapped endpoint metadata—not a guessed URL—to explain the replacement."
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "This report does not have a catalog-backed API replacement. Use the official report reference or archive path rather than inventing an endpoint." })
								})] })]
							})
						}),
						mappedSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-5 rounded-2xl border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-[13px] font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" }), " Endpoint mapping"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 space-y-3 text-[12px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
										children: "Mapped API"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 font-medium",
										children: mappedSource.name
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
										children: "Method"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 font-mono text-[11px]",
										children: mappedSource.method ?? "GET"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
										children: "Endpoint"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 break-all rounded-lg bg-muted/40 p-2 font-mono text-[10.5px] leading-relaxed",
										children: mappedSource.endpoint
									})] })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-[13px] font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "size-4 text-accent" }), " Parameters from the mapped endpoint"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-2",
								children: [required.map((parameter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterRow, {
									name: parameter.name,
									label: parameter.label,
									detail: parameter.description,
									required: true
								}, parameter.name)), optional.map((parameter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterRow, {
									name: parameter.name,
									label: parameter.label,
									detail: parameter.description,
									options: parameter.options
								}, parameter.name))]
							})]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "mt-5 rounded-2xl border border-dashed p-4 text-[12.5px] leading-relaxed text-muted-foreground",
							children: "No structured endpoint details are available for this report. The side AI will keep it as a report/archive request."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "border-t p-5 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/integration-lab",
						search: { report: report.source_id },
						className: "flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue with this report in MISO AI" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-[10.5px] text-muted-foreground",
						children: "The full agent receives the report context and its mapped endpoint details."
					})]
				})
			]
		})]
	});
}
function ParameterRow({ name, label, detail, options, required = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] font-medium",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 font-mono text-[10.5px] text-muted-foreground",
					children: name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-2 py-1 text-[9.5px] font-medium", required ? "bg-destructive-soft text-destructive" : "bg-muted text-muted-foreground"),
					children: required ? "Required" : "Optional"
				})]
			}),
			detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11.5px] leading-relaxed text-muted-foreground",
				children: detail
			}),
			options?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[10.5px] text-muted-foreground",
				children: ["Allowed: ", options.join(", ")]
			}) : null
		]
	});
}
var SplitComponent = ReportLibrary;
//#endregion
export { SplitComponent as component };
