import { a as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as LoaderCircle, H as CircleAlert, J as ChartColumn, V as CircleCheck, _ as Play, h as RefreshCw, u as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { a as YAxis, h as Tooltip, l as CartesianGrid, m as ResponsiveContainer, o as XAxis, s as Area, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { n as localApi } from "./local-backend-BkBhOPCe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/power-trader-C8EgpnkZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function defaultMarketDate() {
	const value = /* @__PURE__ */ new Date();
	value.setDate(value.getDate() - 1);
	return value.toISOString().slice(0, 10);
}
var ENDPOINTS = [
	{
		id: "actual_load",
		name: "Actual Load",
		category: "Load, Generation & Interchange",
		unit: "MW",
		accent: "#B8FF36",
		parameters: ({ date, region }) => ({
			date,
			geoResolution: "region",
			region,
			timeResolution: "hourly",
			pageNumber: "1"
		})
	},
	{
		id: "day_ahead_demand",
		name: "Day-Ahead Cleared Demand",
		category: "Load, Generation & Interchange",
		unit: "MW",
		accent: "#78C8FF",
		parameters: ({ date, region }) => ({
			date,
			region,
			timeResolution: "hourly",
			pageNumber: "1"
		})
	},
	{
		id: "realtime_lmp",
		name: "Real-Time Ex-Post LMP",
		category: "Pricing",
		unit: "$/MWh",
		accent: "#C8A8FF",
		parameters: ({ date, node }) => ({
			date,
			node,
			timeResolution: "hourly",
			preliminaryFinal: "Final",
			pageNumber: "1"
		})
	},
	{
		id: "realtime_generation_fuel_type",
		name: "Real-Time Generation Fuel Type",
		category: "Load, Generation & Interchange",
		unit: "MW",
		accent: "#FFB86B",
		parameters: ({ date, region }) => ({
			date,
			region,
			pageNumber: "1"
		})
	}
];
var ENDPOINT_IDS = new Set(ENDPOINTS.map((endpoint) => endpoint.id));
function isEndpointId(value) {
	return Boolean(value && ENDPOINT_IDS.has(value));
}
function rowsFor(result) {
	return (result?.data?.data ?? []).map((row) => ({
		interval: String(row.interval ?? ""),
		value: Number(row.value ?? 0)
	})).filter((row) => Number.isFinite(row.value));
}
function formatNumber(value, unit) {
	const maximumFractionDigits = unit === "$/MWh" ? 2 : 0;
	return `${value.toLocaleString(void 0, { maximumFractionDigits })} ${unit}`;
}
function CardChart({ card, result }) {
	const rows = (0, import_react.useMemo)(() => rowsFor(result), [result]);
	const values = rows.map((row) => row.value);
	const succeeded = result?.status === "success";
	const summary = values.length ? {
		peak: Math.max(...values),
		average: values.reduce((sum, value) => sum + value, 0) / values.length,
		minimum: Math.min(...values)
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "overflow-hidden rounded-[22px] border border-white/10 bg-[#10151D] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.16)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40",
					children: card.category
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-[17px] font-medium tracking-[-0.035em] text-white",
					children: card.name
				})] }), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold tracking-[0.08em] ${!succeeded ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : result.simulated ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-[#B8FF36]/25 bg-[#B8FF36]/10 text-[#D7FF8D]"}`,
					children: !succeeded ? "REQUEST ERROR" : result.simulated ? "SIMULATED" : "MISO VERIFIED"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border border-white/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-white/35",
					children: "READY"
				})]
			}),
			rows.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 h-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: rows,
						margin: {
							top: 8,
							right: 0,
							left: -22,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: `ptd-${card.id}`,
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: card.accent,
									stopOpacity: .38
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: card.accent,
									stopOpacity: .01
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								vertical: false,
								stroke: "rgba(255,255,255,0.07)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "interval",
								tickLine: false,
								axisLine: false,
								minTickGap: 28,
								tick: {
									fill: "rgba(255,255,255,0.36)",
									fontSize: 10
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tickLine: false,
								axisLine: false,
								width: 42,
								tick: {
									fill: "rgba(255,255,255,0.36)",
									fontSize: 10
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "#151B24",
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: 12,
									color: "#fff"
								},
								labelStyle: { color: "rgba(255,255,255,0.55)" },
								formatter: (value) => [formatNumber(Number(value), card.unit), card.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "value",
								stroke: card.accent,
								strokeWidth: 2.25,
								fill: `url(#ptd-${card.id})`
							})
						]
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid h-44 place-items-center rounded-xl border border-dashed border-white/10 bg-black/10 px-5 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] leading-relaxed text-white/40",
					children: result?.error ? result.error.what_happened : "This endpoint will render when the MISO-shaped simulation is run."
				})
			}),
			summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/15",
				children: [
					["Peak", summary.peak],
					["Average", summary.average],
					["Minimum", summary.minimum]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[9px] uppercase tracking-[0.1em] text-white/35",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[12px] font-medium tabular-nums text-white/80",
						children: formatNumber(Number(value), card.unit)
					})]
				}, String(label)))
			})
		]
	});
}
function PTDInfographics() {
	const [connection, setConnection] = (0, import_react.useState)(null);
	const [keyState, setKeyState] = (0, import_react.useState)(null);
	const [date, setDate] = (0, import_react.useState)(defaultMarketDate);
	const [region, setRegion] = (0, import_react.useState)("NORTH");
	const [node, setNode] = (0, import_react.useState)("INDIANA.HUB");
	const [mode, setMode] = (0, import_react.useState)("simulation");
	const [results, setResults] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [handoffNotice, setHandoffNotice] = (0, import_react.useState)(null);
	const handoffConsumed = (0, import_react.useRef)(false);
	const refreshConnection = (0, import_react.useCallback)(async () => {
		try {
			const [nextConnection, nextKey] = await Promise.all([localApi("/health/"), localApi("/miso/subscription-key/")]);
			setConnection(nextConnection);
			setKeyState(nextKey);
		} catch {
			setConnection(null);
			setKeyState(null);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		refreshConnection();
	}, [refreshConnection]);
	const liveAvailable = connection?.miso_mode === "live" && keyState?.configured === true;
	const executeDashboard = (0, import_react.useCallback)(async (controls, requestedMode) => {
		setLoading(true);
		try {
			const completed = [];
			for (const endpoint of ENDPOINTS) try {
				const response = await localApi("/agent/execute/", {
					method: "POST",
					body: JSON.stringify({
						endpoint_id: endpoint.id,
						parameters: endpoint.parameters(controls),
						mode: requestedMode
					})
				});
				completed.push([endpoint.id, response]);
			} catch (error) {
				const message = error instanceof Error ? error.message : "The MISO chart request could not be completed.";
				completed.push([endpoint.id, {
					status: "error",
					message,
					events: [],
					error: {
						status_code: 503,
						category: "connection",
						what_happened: message,
						suggested_fix: "Check the backend connection and retry.",
						can_retry: true,
						safe_request_context: {}
					}
				}]);
			}
			setResults(Object.fromEntries(completed));
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (handoffConsumed.current || typeof window === "undefined") return;
		const search = new URLSearchParams(window.location.search);
		const endpoint = search.get("endpoint");
		if (search.get("from") !== "miso-agent" || !isEndpointId(endpoint)) return;
		handoffConsumed.current = true;
		const transferredControls = {
			date: search.get("date") || defaultMarketDate(),
			region: [
				"NORTH",
				"CENTRAL",
				"SOUTH",
				"MISO"
			].includes(search.get("region") || "") ? search.get("region") : "NORTH",
			node: search.get("node") || "INDIANA.HUB"
		};
		setDate(transferredControls.date);
		setRegion(transferredControls.region);
		setNode(transferredControls.node);
		setHandoffNotice(`MISO Web Data Agent connected this dashboard with ${ENDPOINTS.find((item) => item.id === endpoint)?.name}. PTD is running the four chart requests in explicit simulation mode.`);
		executeDashboard(transferredControls, "simulation");
	}, [executeDashboard]);
	const controls = {
		date,
		region,
		node
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[#080B10] text-[#F6F7F9]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-white/10 bg-[#080B10]/90 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-[1580px] items-center justify-between gap-4 px-5 py-4 sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-[#B8FF36] text-[#080B10]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[15px] font-semibold tracking-[-0.03em]",
						children: "PTD Infographcs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-white/45",
						children: "MISO market-chart workspace"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void refreshConnection(),
					className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${liveAvailable ? "bg-[#B8FF36]" : "bg-amber-400"}` }),
						liveAvailable ? "Live API available" : "Simulation mode",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 text-white/40" })
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1580px] px-5 py-6 sm:px-8 sm:py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(184,255,54,0.15),transparent_28rem),#10151D] p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-between gap-8 xl:flex-row xl:items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8FF36]",
										children: "MISO endpoint simulation studio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
										className: "mt-4 text-[clamp(2.6rem,6vw,6.25rem)] font-semibold leading-[0.88] tracking-[-0.075em]",
										children: [
											"Four Feeds,",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[#B8FF36]",
												children: "One market view"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-5 max-w-2xl text-[15px] leading-relaxed text-white/55",
										children: "PTD is a visualization tool—not a chatbot. It calls the MISO agent backend for each selected endpoint, then turns the returned time series into charts. Simulation responses are always labeled and use the same endpoint paths and MISO parameter names as live requests."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-col gap-2 text-[12px] text-white/45 xl:max-w-[310px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-[#B8FF36]" }), "Subscription keys stay server-side."]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-[#B8FF36]" }), "No conversation or agent controls live here."]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 lg:grid-cols-[1fr_1fr_1fr_auto]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "rounded-xl bg-white/[0.05] px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40",
										children: "Market date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: date,
										onChange: (event) => setDate(event.target.value),
										className: "mt-1 w-full bg-transparent text-[14px] text-white outline-none [color-scheme:dark]"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "rounded-xl bg-white/[0.05] px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40",
										children: "Region"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: region,
										onChange: (event) => setRegion(event.target.value),
										className: "mt-1 w-full bg-transparent text-[14px] text-white outline-none",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "NORTH",
												children: "North"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "CENTRAL",
												children: "Central"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "SOUTH",
												children: "South"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MISO",
												children: "MISO"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "rounded-xl bg-white/[0.05] px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40",
										children: "Pricing node"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: node,
										onChange: (event) => setNode(event.target.value),
										className: "mt-1 w-full bg-transparent text-[14px] text-white outline-none",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "INDIANA.HUB",
												children: "Indiana Hub"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MICHIGAN.HUB",
												children: "Michigan Hub"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "LOUISIANA.HUB",
												children: "Louisiana Hub"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									onClick: () => void executeDashboard(controls, mode),
									disabled: loading || mode === "live" && !liveAvailable,
									className: "h-auto min-h-16 rounded-xl bg-[#B8FF36] px-5 text-[#080B10] hover:bg-[#D0FF78] disabled:bg-white/10 disabled:text-white/35",
									children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), loading ? "Calling endpoints" : mode === "simulation" ? "Run simulations" : "Run live charts"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setMode("simulation"),
									className: `rounded-full border px-3 py-1.5 text-[11px] ${mode === "simulation" ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-white/10 text-white/40"}`,
									children: "Simulation · labeled data"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => liveAvailable && setMode("live"),
									disabled: !liveAvailable,
									className: `rounded-full border px-3 py-1.5 text-[11px] ${mode === "live" ? "border-[#B8FF36]/35 bg-[#B8FF36]/10 text-[#D7FF8D]" : "border-white/10 text-white/40"} disabled:cursor-not-allowed disabled:opacity-50`,
									children: "Live MISO · server key required"
								}),
								!liveAvailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-[11px] text-amber-100/65",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" }),
										"Configure ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "rounded bg-white/10 px-1.5 py-0.5",
											children: "MISO_SUBSCRIPTION_KEY"
										}),
										" to enable live requests."
									]
								})
							]
						})
					]
				}),
				handoffNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-start gap-3 rounded-2xl border border-[#B8FF36]/25 bg-[#B8FF36]/10 px-4 py-3 text-[12px] leading-relaxed text-[#E4FFB2]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-4 shrink-0" }), handoffNotice]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40",
							children: "Endpoint chart board"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-[24px] font-medium tracking-[-0.045em]",
							children: "API calls and chart outputs"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-white/40",
							children: "Each card is a separate request; no subscription key is shown in PTD."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-4 xl:grid-cols-2",
						children: ENDPOINTS.map((endpoint) => {
							const parameters = endpoint.parameters(controls);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardChart, {
									card: endpoint,
									result: results[endpoint.id]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase tracking-[0.13em] text-white/35",
										children: "Chart configuration received from MISO agent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-1.5",
										children: Object.entries(parameters).map(([name, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-md bg-white/[0.06] px-1.5 py-1 font-mono text-[9.5px] text-white/55",
											children: [
												name,
												"=",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-white/80",
													children: value
												})
											]
										}, name))
									})]
								})]
							}, endpoint.id);
						})
					})]
				})
			]
		})]
	});
}
function PowerTraderRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PTDInfographics, {});
}
//#endregion
export { PowerTraderRoute as component };
