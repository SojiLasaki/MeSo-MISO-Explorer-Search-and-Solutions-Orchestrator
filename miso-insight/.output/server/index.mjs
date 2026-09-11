globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/ApiRequestViewer-Bqnw8Mqx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5816-T2kVnaiHDpf8VH7fHczFCL5Jw5A\"",
		"mtime": "2026-09-11T13:20:16.065Z",
		"size": 22550,
		"path": "../public/assets/ApiRequestViewer-Bqnw8Mqx.js"
	},
	"/assets/arrow-left-Bdt1PfM_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-OAnL6QD7AT9vzcxaMUWPl0904U0\"",
		"mtime": "2026-09-11T13:20:16.078Z",
		"size": 165,
		"path": "../public/assets/arrow-left-Bdt1PfM_.js"
	},
	"/assets/AreaChart-C0S1668J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ac2-+K+p4ny+XEMb4SkbdvOCeraEATg\"",
		"mtime": "2026-09-11T13:20:16.078Z",
		"size": 10946,
		"path": "../public/assets/AreaChart-C0S1668J.js"
	},
	"/assets/auth-jg2dhKlF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b7e-at75c40duc3K1o1RHh3KSPCZtCQ\"",
		"mtime": "2026-09-11T13:20:16.080Z",
		"size": 7038,
		"path": "../public/assets/auth-jg2dhKlF.js"
	},
	"/assets/arrow-up-right-gWBRGWxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-wFip/GHrWcyIBTiffHIdMAM42Wk\"",
		"mtime": "2026-09-11T13:20:16.080Z",
		"size": 167,
		"path": "../public/assets/arrow-up-right-gWBRGWxE.js"
	},
	"/assets/button-DrcwUb-R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1246-0SOBN4CabqgECL+daCnZUIRA/ik\"",
		"mtime": "2026-09-11T13:20:16.080Z",
		"size": 4678,
		"path": "../public/assets/button-DrcwUb-R.js"
	},
	"/assets/canvas-Cj239JLu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6e4d-eZdVoXOpyC2wt0kFNyGOhOEvWmw\"",
		"mtime": "2026-09-11T13:20:16.081Z",
		"size": 28237,
		"path": "../public/assets/canvas-Cj239JLu.js"
	},
	"/assets/circle-alert-CcGnUa7l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa-vjmiKZB4RcvW60y87Si1K6kiuBg\"",
		"mtime": "2026-09-11T13:20:16.082Z",
		"size": 250,
		"path": "../public/assets/circle-alert-CcGnUa7l.js"
	},
	"/assets/chart-column-C2C7X4mE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-g+DAWtZDHGZmNre1N8UcpA9vZYo\"",
		"mtime": "2026-09-11T13:20:16.082Z",
		"size": 251,
		"path": "../public/assets/chart-column-C2C7X4mE.js"
	},
	"/assets/createLucideIcon-CLdWFMku.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab-rMBxsqcPKrcnF/JzamLtMRV6aPw\"",
		"mtime": "2026-09-11T13:20:16.085Z",
		"size": 1195,
		"path": "../public/assets/createLucideIcon-CLdWFMku.js"
	},
	"/assets/catalog-By1SuLx5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10403-SBdkKV30+DGIZQsRqYity0vbFTU\"",
		"mtime": "2026-09-11T13:20:16.081Z",
		"size": 66563,
		"path": "../public/assets/catalog-By1SuLx5.js"
	},
	"/assets/circle-check-DjOsU-2G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-mxVeUOMAM7J+cYmJuSZXlZLGF30\"",
		"mtime": "2026-09-11T13:20:16.084Z",
		"size": 178,
		"path": "../public/assets/circle-check-DjOsU-2G.js"
	},
	"/assets/dialog-C8RBO5Bd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b5a-r82s5KlVBe47VkMBKsHdAkxey80\"",
		"mtime": "2026-09-11T13:20:16.087Z",
		"size": 35674,
		"path": "../public/assets/dialog-C8RBO5Bd.js"
	},
	"/assets/createMiddleware-Bg4X9jOJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8aee-3Gr5XMveU8vyPzyXQOIAE3oPddY\"",
		"mtime": "2026-09-11T13:20:16.085Z",
		"size": 35566,
		"path": "../public/assets/createMiddleware-Bg4X9jOJ.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-10T12:50:13.346Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/input-Njx7yl6V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d-iQG09E+yQbUxAHU8gBpS5ZYReXc\"",
		"mtime": "2026-09-11T13:20:16.100Z",
		"size": 621,
		"path": "../public/assets/input-Njx7yl6V.js"
	},
	"/miso-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"3ed-0o5eblo8LC/0sHyLSoquCrKdzW4\"",
		"mtime": "2026-09-10T21:43:01.069Z",
		"size": 1005,
		"path": "../public/miso-logo.svg"
	},
	"/assets/jsx-runtime-B-hcVAMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216d-pcqlp1Bv4Kt7yFmWJlJC8xMXx/k\"",
		"mtime": "2026-09-11T13:20:16.102Z",
		"size": 8557,
		"path": "../public/assets/jsx-runtime-B-hcVAMW.js"
	},
	"/assets/key-round-Bm1Lv5KH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163-etWYKUt5TXc58Dnz5s8fXZUoNEM\"",
		"mtime": "2026-09-11T13:20:16.102Z",
		"size": 355,
		"path": "../public/assets/key-round-Bm1Lv5KH.js"
	},
	"/assets/label-DXP4Leg5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f1-3hcSpmdsHzK//jxr5nfmqIZ5cQQ\"",
		"mtime": "2026-09-11T13:20:16.104Z",
		"size": 1265,
		"path": "../public/assets/label-DXP4Leg5.js"
	},
	"/assets/layers-C_9oEa0w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-6w33QFnDBe03c1MiZi2TRLprRHc\"",
		"mtime": "2026-09-11T13:20:16.105Z",
		"size": 421,
		"path": "../public/assets/layers-C_9oEa0w.js"
	},
	"/assets/integration-lab-Bj2fBzj5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19e60-UGHhrV9yLxp8r5zwCYNPLaZDypE\"",
		"mtime": "2026-09-11T13:20:16.101Z",
		"size": 106080,
		"path": "../public/assets/integration-lab-Bj2fBzj5.js"
	},
	"/assets/link-CsMjSmXU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"68b3-8pZGg/wvXHu9mV9k61ZFFW9AFKA\"",
		"mtime": "2026-09-11T13:20:16.105Z",
		"size": 26803,
		"path": "../public/assets/link-CsMjSmXU.js"
	},
	"/assets/generateCategoricalChart-Tajxezjz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5a794-yh0hX8yZtlac1RzTiXObRw1J5e8\"",
		"mtime": "2026-09-11T13:20:16.087Z",
		"size": 370580,
		"path": "../public/assets/generateCategoricalChart-Tajxezjz.js"
	},
	"/assets/index-Dpd5C6pP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82e36-MNC+SynukNyoik094YNzZjAz0us\"",
		"mtime": "2026-09-11T13:20:16.065Z",
		"size": 536118,
		"path": "../public/assets/index-Dpd5C6pP.js"
	},
	"/assets/local-backend-wp3nt0Jp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d2-PAZaPQN5zU2yhmDytZWq7ZAz3KI\"",
		"mtime": "2026-09-11T13:20:16.106Z",
		"size": 466,
		"path": "../public/assets/local-backend-wp3nt0Jp.js"
	},
	"/assets/miso.functions-DfH8UcNL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1856-R4c/g5u1Ep0cbgs7AwhydbtTGOM\"",
		"mtime": "2026-09-11T13:20:16.107Z",
		"size": 6230,
		"path": "../public/assets/miso.functions-DfH8UcNL.js"
	},
	"/assets/power-trader-BGfTBkX5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3632-j5LV0ETTOZLPmcGqD6h2LSRfQ0M\"",
		"mtime": "2026-09-11T13:20:16.110Z",
		"size": 13874,
		"path": "../public/assets/power-trader-BGfTBkX5.js"
	},
	"/assets/redirect-Dhm19zUi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f4-ePZWCXP5uehkmkGMkMl5xDch+/Y\"",
		"mtime": "2026-09-11T13:20:16.111Z",
		"size": 500,
		"path": "../public/assets/redirect-Dhm19zUi.js"
	},
	"/assets/registry-C65zSE4c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16ff-6qPgKyG45zlgXtM5u4w1FrdM8gM\"",
		"mtime": "2026-09-11T13:20:16.112Z",
		"size": 5887,
		"path": "../public/assets/registry-C65zSE4c.js"
	},
	"/assets/reports-BWN_uV-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3958-66d3Ev8tbeN6o75lR+vBiv6qzKQ\"",
		"mtime": "2026-09-11T13:20:16.112Z",
		"size": 14680,
		"path": "../public/assets/reports-BWN_uV-c.js"
	},
	"/assets/shield-check-DFHzr1Zc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-eDBcw3yCumKkKJKPHpRBYc9MDPU\"",
		"mtime": "2026-09-11T13:20:16.114Z",
		"size": 320,
		"path": "../public/assets/shield-check-DFHzr1Zc.js"
	},
	"/assets/sliders-horizontal-vKewA9u0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bf-YkbrW/9+ITpoiEaOsK+njhu0M88\"",
		"mtime": "2026-09-11T13:20:16.114Z",
		"size": 703,
		"path": "../public/assets/sliders-horizontal-vKewA9u0.js"
	},
	"/assets/sparkles-gFfgSoCb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"289-YUHMXSRKyGmxNwMpShhD0JLRSko\"",
		"mtime": "2026-09-11T13:20:16.116Z",
		"size": 649,
		"path": "../public/assets/sparkles-gFfgSoCb.js"
	},
	"/assets/subscription-keys-DuhYV2fy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2293-TsukXqSWHJ20Wv6WR5gNRbZFsTI\"",
		"mtime": "2026-09-11T13:20:16.126Z",
		"size": 8851,
		"path": "../public/assets/subscription-keys-DuhYV2fy.js"
	},
	"/assets/useAuth-zhdeiVOV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c2-/U+Nks6B/gEZgMY32O0iJ8pJlzI\"",
		"mtime": "2026-09-11T13:20:16.126Z",
		"size": 450,
		"path": "../public/assets/useAuth-zhdeiVOV.js"
	},
	"/assets/routes-CPLSr4LV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a4a0-szssq6BqzrueB3we5LXujsXgJw8\"",
		"mtime": "2026-09-11T13:20:16.113Z",
		"size": 107680,
		"path": "../public/assets/routes-CPLSr4LV.js"
	},
	"/assets/utils-B6KiDbIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a7d-iNkBSvaSyIjvZOzWoTvEa49qwcI\"",
		"mtime": "2026-09-11T13:20:16.130Z",
		"size": 27261,
		"path": "../public/assets/utils-B6KiDbIe.js"
	},
	"/assets/wrench-Dsvq_fxe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7-DtnemesFJg/5BAj7OM/utf7D0ms\"",
		"mtime": "2026-09-11T13:20:16.136Z",
		"size": 679,
		"path": "../public/assets/wrench-Dsvq_fxe.js"
	},
	"/assets/x-DNoz_-4-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ef-PU6Wp9FqHKmraM1yChCpyNrZj5w\"",
		"mtime": "2026-09-11T13:20:16.137Z",
		"size": 751,
		"path": "../public/assets/x-DNoz_-4-.js"
	},
	"/assets/zap-CzaTQe-r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45a-ZN1nnY8uZZx4wJy+VtascxeFIsg\"",
		"mtime": "2026-09-11T13:20:16.140Z",
		"size": 1114,
		"path": "../public/assets/zap-CzaTQe-r.js"
	},
	"/assets/styles-Bl-IrRch.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b845-yzFUwRsjN7IpU2QbKaq6vpCj+yg\"",
		"mtime": "2026-09-11T13:20:16.240Z",
		"size": 112709,
		"path": "../public/assets/styles-Bl-IrRch.css"
	},
	"/assets/_sourceId-C31cOcAz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28a7-yO0iBoPPLp6I76HTGm4+5CvOs4Q\"",
		"mtime": "2026-09-11T13:20:16.078Z",
		"size": 10407,
		"path": "../public/assets/_sourceId-C31cOcAz.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_oq7zfe = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_oq7zfe
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
