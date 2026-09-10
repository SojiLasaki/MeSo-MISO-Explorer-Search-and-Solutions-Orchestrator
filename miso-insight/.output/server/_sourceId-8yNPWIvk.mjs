import { n as CATALOG_OPERATIONS } from "./_ssr/catalog-DaTbh8nC.mjs";
import { h as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { t as Route } from "./_sourceId-_Cukiu18.mjs";
import { $ as ArrowUpRight, B as CircleDollarSign, D as KeyRound, T as Layers, V as CircleCheck, X as Braces, Y as CalendarDays, t as Zap, tt as ArrowLeft, u as ShieldCheck, w as ListChecks } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_sourceId-8yNPWIvk.js
var import_jsx_runtime = require_jsx_runtime();
function categoryFor(operation) {
	return operation.endpoint.includes("/pricing/") ? "Pricing" : "Load, generation & interchange";
}
function ParameterTable({ title, copy, parameters }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-2xl border bg-card shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b px-5 py-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[17px] font-medium",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] leading-relaxed text-muted-foreground",
				children: copy
			})]
		}), parameters.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y",
			children: parameters.map((parameter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 px-5 py-4 sm:grid-cols-[minmax(160px,0.7fr)_minmax(0,1.3fr)] sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "rounded bg-muted px-1.5 py-0.5 text-[12px] font-medium text-foreground",
						children: parameter.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground",
						children: parameter.in ?? "query"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-[11.5px] text-muted-foreground",
					children: parameter.type
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] leading-relaxed text-muted-foreground",
					children: parameter.description
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-1.5 text-[11.5px]",
					children: [parameter.example && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-md bg-accent-soft px-2 py-1 text-accent",
						children: ["Example: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: parameter.example })]
					}), parameter.options?.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-md bg-muted px-2 py-1 text-muted-foreground",
						children: option
					}, option))]
				})] })]
			}, parameter.name))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-5 py-7 text-[13px] text-muted-foreground sm:px-6",
			children: "This operation does not expose parameters in the catalog."
		})]
	});
}
function ApiDocumentation({ operation }) {
	const required = operation.parameters.filter((parameter) => parameter.required);
	const optional = operation.parameters.filter((parameter) => !parameter.required);
	const isPricing = operation.endpoint.includes("/pricing/");
	const hasPagination = operation.parameters.some((parameter) => parameter.name === "pageNumber");
	const category = categoryFor(operation);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_84%_0%,var(--color-accent-soft),transparent_34rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Back to MISO AI"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "API directory" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: category }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Official documentation" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent",
							children: isPricing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDollarSign, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "max-w-4xl text-[clamp(2.25rem,5vw,4.35rem)] font-medium leading-[0.98] tracking-[-0.045em]",
							children: operation.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-3xl text-[16px] leading-relaxed text-muted-foreground",
							children: operation.description
						})] })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: operation.documentation_url,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center justify-center gap-2 rounded-full border bg-card px-4 py-3 text-[13px] font-medium text-accent shadow-soft transition-colors hover:bg-muted",
						children: ["Open on MISO Data Exchange", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-2 border-y py-4 text-[12px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Official MISO catalog metadata"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-muted px-2.5 py-1",
							children: operation.api_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-muted px-2.5 py-1",
							children: operation.method
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "overflow-hidden rounded-2xl border bg-card shadow-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-b px-5 py-4 sm:px-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Braces, { className: "size-3.5 text-accent" }), "Request endpoint"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-md bg-success-soft px-2 py-1 font-mono text-[12px] font-medium text-success",
											children: operation.method
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "min-w-0 break-all text-[12.5px] text-foreground",
											children: operation.endpoint
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-5 py-4 sm:px-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[12px] leading-relaxed text-muted-foreground",
										children: "Use this endpoint with the inputs below. Values in the path replace braces; query values are appended to the request URL."
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterTable, {
								title: "Required parameters",
								copy: required.length ? "Enter every one of these before sending the request." : "No required parameters are listed for this operation.",
								parameters: required
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParameterTable, {
								title: "Optional parameters",
								copy: "Use these only when you need to narrow, page, or shape the response.",
								parameters: optional
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-2xl border bg-card p-5 shadow-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5 text-accent" }), "Authentication"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-[13px] leading-relaxed text-muted-foreground",
										children: operation.requires_authentication ? "Send a MISO subscription key from your backend. Do not put a production key in browser code." : "This operation is marked as not requiring authentication in the catalog."
									}),
									operation.requires_authentication && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
										className: "mt-3 block break-all rounded-lg bg-muted px-2.5 py-2 text-[11px] text-foreground",
										children: [operation.auth_header, ": ${MISO_SUBSCRIPTION_KEY}"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-2xl border bg-card p-5 shadow-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5 text-accent" }), "Availability & time"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-[13px] leading-relaxed text-muted-foreground",
										children: operation.availability_note || "Check the live MISO response for data availability."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground",
										children: "MISO market time is Eastern Prevailing Time. Preserve the API-provided UTC offset around daylight-saving changes."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-2xl border bg-card p-5 shadow-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-accent" }), "Pagination"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-[13px] leading-relaxed text-muted-foreground",
									children: hasPagination ? "Use pageNumber and continue until the response page metadata indicates the final page. Do not assume a fixed page size." : "The catalog does not list pageNumber for this operation."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-2xl border bg-card p-5 shadow-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "size-3.5 text-accent" }), "Use with MISO AI"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-[13px] leading-relaxed text-muted-foreground",
										children: "Open a focused chat for this operation. Its endpoint and catalog parameters are passed to the agent without exposing any credential."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/integration-lab",
										search: { api: operation.source_id },
										className: "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[12.5px] font-medium text-primary-foreground",
										children: ["Ask MISO AI about this API", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
									})
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-8 flex items-center gap-2 text-[11.5px] leading-relaxed text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 shrink-0 text-accent" }), "This redesigned reference is populated from the official MISO Data Exchange catalog. Use the source link above for MISO’s live documentation and service updates."]
				})
			]
		})
	});
}
function ApiDocumentationRoute() {
	const { sourceId } = Route.useParams();
	const operation = CATALOG_OPERATIONS.find((candidate) => candidate.source_id === sourceId);
	if (!operation) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-background px-5 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[20px] font-medium",
				children: "That API was not found."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[14px] text-muted-foreground",
				children: "Return to the directory and choose an API from the current MISO catalog."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground",
				children: "Back to MISO AI"
			})
		] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiDocumentation, { operation });
}
//#endregion
export { ApiDocumentationRoute as component };
