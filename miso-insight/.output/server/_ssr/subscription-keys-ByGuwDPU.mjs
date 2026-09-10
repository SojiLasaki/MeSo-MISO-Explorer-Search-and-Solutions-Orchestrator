import { a as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as ArrowUpRight, D as KeyRound, H as CircleAlert, S as LockKeyhole, V as CircleCheck, f as Server, tt as ArrowLeft, u as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as listMisoKeyReferences, s as useServerFn, t as createMisoKeyReference } from "./miso.functions-76DM3dDC.mjs";
import { t as useAuth } from "./useAuth-_nE3K0OP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-keys-ByGuwDPU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MISO_PORTAL_URL = "https://data-exchange.misoenergy.org/";
function SubscriptionKeyWorkspace({ authed }) {
	const [references, setReferences] = (0, import_react.useState)([]);
	const [portalStarted, setPortalStarted] = (0, import_react.useState)(false);
	const [portalComplete, setPortalComplete] = (0, import_react.useState)(false);
	const [label, setLabel] = (0, import_react.useState)("");
	const [environmentVariable, setEnvironmentVariable] = (0, import_react.useState)("MISO_SUBSCRIPTION_KEY");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const listReferences = useServerFn(listMisoKeyReferences);
	const createReference = useServerFn(createMisoKeyReference);
	(0, import_react.useEffect)(() => {
		if (!authed) return;
		listReferences().then(setReferences).catch(() => void 0);
	}, [authed, listReferences]);
	const saveReference = async () => {
		if (!label.trim()) {
			toast.error("Name this connection so an agent can identify it.");
			return;
		}
		setSaving(true);
		try {
			const reference = await createReference({ data: {
				label: label.trim(),
				environment_variable: environmentVariable.trim()
			} });
			setReferences((current) => [reference, ...current]);
			setLabel("");
			toast.success("Key reference saved. No subscription-key value was stored.");
		} catch {
			toast.error("Sign in before saving a key reference.");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_86%_0%,var(--color-accent-soft),transparent_34rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-5xl px-5 pb-20 pt-20 sm:px-8 lg:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5 text-accent" }), "MISO-managed credentials"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-5 text-[clamp(2.3rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.05em]",
						children: ["Create the key with MISO. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-accent",
							children: "Use it safely here."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground",
						children: "Subscription keys are created and managed in your MISO Data Exchange account. MISO AI then remembers only the local environment-variable name your backend should use—never the key value itself."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProvisioningStep, {
							number: "1",
							title: "Create or manage a MISO subscription",
							copy: "Open the authenticated MISO Data Exchange portal. Sign in or create your MISO account, then follow its displayed subscription-key flow for the API product you need.",
							complete: portalStarted,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: MISO_PORTAL_URL,
								target: "_blank",
								rel: "noreferrer",
								onClick: () => setPortalStarted(true),
								className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-medium text-primary-foreground",
								children: ["Open MISO Data Exchange", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProvisioningStep, {
							number: "2",
							title: "Keep the key in your backend secret manager",
							copy: "Add the key in your deployment platform or local backend environment. Do not paste it into this app, a chat, source code, browser storage, or a downloaded agent file.",
							complete: portalComplete,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPortalComplete(true),
								className: "inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-[12.5px] font-medium text-accent hover:bg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "I stored it in my backend"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProvisioningStep, {
							number: "3",
							title: "Register a safe connection reference",
							copy: "This lets MISO AI’s local coding agent select the right backend variable without receiving any key material.",
							complete: references.length > 0,
							children: authed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "subscription-label",
											className: "text-[11.5px]",
											children: "Connection name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "subscription-label",
											value: label,
											onChange: (event) => setLabel(event.target.value),
											placeholder: "Production settlement",
											className: "h-10 rounded-lg text-[12.5px]"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "subscription-env",
											className: "text-[11.5px]",
											children: "Backend environment variable"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "subscription-env",
											value: environmentVariable,
											onChange: (event) => setEnvironmentVariable(event.target.value.toUpperCase()),
											placeholder: "MISO_SUBSCRIPTION_KEY",
											className: "h-10 rounded-lg font-mono text-[12px]"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										disabled: saving,
										onClick: () => void saveReference(),
										className: "self-end rounded-full",
										children: "Save reference"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground",
								children: "Sign in to MISO AI to save a non-secret reference for your local coding agent."
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border bg-card p-5 shadow-soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-[13px] font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }), "Credential boundary"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-3 text-[12.5px] leading-relaxed text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
										icon: LockKeyhole,
										title: "MISO portal",
										copy: "Creates, rotates, and revokes the actual subscription key."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
										icon: Server,
										title: "Your backend",
										copy: "Reads the key at runtime from its secret environment."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
										icon: KeyRound,
										title: "MISO AI",
										copy: "Stores only a display name and environment-variable name for agent handoff."
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-accent/20 bg-accent-soft/35 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2 text-[12.5px] font-medium text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0 text-accent" }), "Why the key is not created directly in MISO AI"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] leading-relaxed text-muted-foreground",
								children: "MISO Data Exchange owns the account session and subscription lifecycle. Keeping that step in MISO prevents this app from collecting MISO account passwords or raw keys."
							})]
						}),
						authed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border bg-card p-5 shadow-soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-medium",
								children: "Saved agent references"
							}), references.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2",
								children: references.map((reference) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border bg-muted/20 px-3 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[12.5px] font-medium",
										children: reference.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "mt-1 block text-[11.5px] text-muted-foreground",
										children: reference.environment_variable
									})]
								}, reference.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] text-muted-foreground",
								children: "No key references saved yet."
							})]
						})
					]
				})]
			})]
		})
	});
}
function ProvisioningStep({ number, title, copy, complete, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-2xl border bg-card p-5 shadow-soft sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${complete ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`,
				children: complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }) : number
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[15px] font-medium",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground",
						children: copy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children
					})
				]
			})]
		})
	});
}
function Boundary({ icon: Icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-3.5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-medium text-foreground",
			children: [title, ": "]
		}), copy] })]
	});
}
function SubscriptionKeysRoute() {
	const { user } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "fixed left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border bg-card/90 px-3 py-2 text-[12.5px] font-medium text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "MISO AI"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubscriptionKeyWorkspace, { authed: Boolean(user) })] });
}
//#endregion
export { SubscriptionKeysRoute as component };
