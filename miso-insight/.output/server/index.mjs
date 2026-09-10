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
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-10T06:12:45.045Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-10T06:12:45.045Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/_sourceId-c-JkAkBk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28a7-ZoEqJcC+YFND4HMq+qIrhU+caOU\"",
		"mtime": "2026-09-10T06:12:44.315Z",
		"size": 10407,
		"path": "../public/assets/_sourceId-c-JkAkBk.js"
	},
	"/assets/arrow-left-Bdt1PfM_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-OAnL6QD7AT9vzcxaMUWPl0904U0\"",
		"mtime": "2026-09-10T06:12:44.315Z",
		"size": 165,
		"path": "../public/assets/arrow-left-Bdt1PfM_.js"
	},
	"/assets/auth-DGiNoT20.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b7e-AH0WsXxVqkm76a3eHpAn5vbMJqk\"",
		"mtime": "2026-09-10T06:12:44.316Z",
		"size": 7038,
		"path": "../public/assets/auth-DGiNoT20.js"
	},
	"/assets/bot-mZlhzHVu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-o3cWrdsAW+Ccx+WpSSBGLHYn0m8\"",
		"mtime": "2026-09-10T06:12:44.316Z",
		"size": 328,
		"path": "../public/assets/bot-mZlhzHVu.js"
	},
	"/assets/button-DrcwUb-R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1246-0SOBN4CabqgECL+daCnZUIRA/ik\"",
		"mtime": "2026-09-10T06:12:44.316Z",
		"size": 4678,
		"path": "../public/assets/button-DrcwUb-R.js"
	},
	"/assets/arrow-up-right-gWBRGWxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-wFip/GHrWcyIBTiffHIdMAM42Wk\"",
		"mtime": "2026-09-10T06:12:44.315Z",
		"size": 167,
		"path": "../public/assets/arrow-up-right-gWBRGWxE.js"
	},
	"/assets/canvas-ZVfW5Tb5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a4d3-lga0jrsfoOvMZ4vaMXcw+fXsN44\"",
		"mtime": "2026-09-10T06:12:44.316Z",
		"size": 42195,
		"path": "../public/assets/canvas-ZVfW5Tb5.js"
	},
	"/assets/catalog-Kfp0oYyJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe75-VldSzzAfe06GKafrYhl9fcOx468\"",
		"mtime": "2026-09-10T06:12:44.317Z",
		"size": 65141,
		"path": "../public/assets/catalog-Kfp0oYyJ.js"
	},
	"/assets/AreaChart-IyfRkT6C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c78d-Ok/7rorCztsmrRUK1cGDDo6LBhA\"",
		"mtime": "2026-09-10T06:12:44.315Z",
		"size": 378765,
		"path": "../public/assets/AreaChart-IyfRkT6C.js"
	},
	"/assets/chart-column-C2C7X4mE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-g+DAWtZDHGZmNre1N8UcpA9vZYo\"",
		"mtime": "2026-09-10T06:12:44.317Z",
		"size": 251,
		"path": "../public/assets/chart-column-C2C7X4mE.js"
	},
	"/assets/circle-alert-CcGnUa7l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa-vjmiKZB4RcvW60y87Si1K6kiuBg\"",
		"mtime": "2026-09-10T06:12:44.317Z",
		"size": 250,
		"path": "../public/assets/circle-alert-CcGnUa7l.js"
	},
	"/assets/circle-check-DjOsU-2G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-mxVeUOMAM7J+cYmJuSZXlZLGF30\"",
		"mtime": "2026-09-10T06:12:44.317Z",
		"size": 178,
		"path": "../public/assets/circle-check-DjOsU-2G.js"
	},
	"/assets/createLucideIcon-CLdWFMku.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab-rMBxsqcPKrcnF/JzamLtMRV6aPw\"",
		"mtime": "2026-09-10T06:12:44.317Z",
		"size": 1195,
		"path": "../public/assets/createLucideIcon-CLdWFMku.js"
	},
	"/assets/createMiddleware-Bg4X9jOJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8aee-3Gr5XMveU8vyPzyXQOIAE3oPddY\"",
		"mtime": "2026-09-10T06:12:44.318Z",
		"size": 35566,
		"path": "../public/assets/createMiddleware-Bg4X9jOJ.js"
	},
	"/assets/database-OS4GB30O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-7tCCiDQ0WKiggOAkC5E9zbnuuA0\"",
		"mtime": "2026-09-10T06:12:44.318Z",
		"size": 318,
		"path": "../public/assets/database-OS4GB30O.js"
	},
	"/assets/dialog-Dldxe2Zl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8ce2-L4WfWwWBcJCOeIHS+Zea2znN3yM\"",
		"mtime": "2026-09-10T06:12:44.318Z",
		"size": 36066,
		"path": "../public/assets/dialog-Dldxe2Zl.js"
	},
	"/assets/download-CV6x-mg2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e8-kAup+r+nhyupqoE4RponPE902CU\"",
		"mtime": "2026-09-10T06:12:44.318Z",
		"size": 232,
		"path": "../public/assets/download-CV6x-mg2.js"
	},
	"/assets/input-Njx7yl6V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d-iQG09E+yQbUxAHU8gBpS5ZYReXc\"",
		"mtime": "2026-09-10T06:12:44.318Z",
		"size": 621,
		"path": "../public/assets/input-Njx7yl6V.js"
	},
	"/assets/integration-lab-CluZ_eFC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6fd9-AaOikfnVXB21s1sbM02q89cWc/w\"",
		"mtime": "2026-09-10T06:12:44.319Z",
		"size": 28633,
		"path": "../public/assets/integration-lab-CluZ_eFC.js"
	},
	"/assets/jsx-runtime-B-hcVAMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216d-pcqlp1Bv4Kt7yFmWJlJC8xMXx/k\"",
		"mtime": "2026-09-10T06:12:44.319Z",
		"size": 8557,
		"path": "../public/assets/jsx-runtime-B-hcVAMW.js"
	},
	"/assets/key-round-Bm1Lv5KH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163-etWYKUt5TXc58Dnz5s8fXZUoNEM\"",
		"mtime": "2026-09-10T06:12:44.319Z",
		"size": 355,
		"path": "../public/assets/key-round-Bm1Lv5KH.js"
	},
	"/assets/label-DXP4Leg5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f1-3hcSpmdsHzK//jxr5nfmqIZ5cQQ\"",
		"mtime": "2026-09-10T06:12:44.319Z",
		"size": 1265,
		"path": "../public/assets/label-DXP4Leg5.js"
	},
	"/assets/index-CoydUYzh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82e23-6Td0/ko/hBQ4PCKxrVdJ4bYFnT0\"",
		"mtime": "2026-09-10T06:12:44.314Z",
		"size": 536099,
		"path": "../public/assets/index-CoydUYzh.js"
	},
	"/assets/layers-C_9oEa0w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-6w33QFnDBe03c1MiZi2TRLprRHc\"",
		"mtime": "2026-09-10T06:12:44.319Z",
		"size": 421,
		"path": "../public/assets/layers-C_9oEa0w.js"
	},
	"/assets/link-CsMjSmXU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"68b3-8pZGg/wvXHu9mV9k61ZFFW9AFKA\"",
		"mtime": "2026-09-10T06:12:44.320Z",
		"size": 26803,
		"path": "../public/assets/link-CsMjSmXU.js"
	},
	"/assets/local-backend-wp3nt0Jp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d2-PAZaPQN5zU2yhmDytZWq7ZAz3KI\"",
		"mtime": "2026-09-10T06:12:44.320Z",
		"size": 466,
		"path": "../public/assets/local-backend-wp3nt0Jp.js"
	},
	"/assets/miso.functions-DfH8UcNL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1856-R4c/g5u1Ep0cbgs7AwhydbtTGOM\"",
		"mtime": "2026-09-10T06:12:44.320Z",
		"size": 6230,
		"path": "../public/assets/miso.functions-DfH8UcNL.js"
	},
	"/assets/play-CPV0a6Tn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be-LH8ER39j+C7YuhpHH/+qxNjUsbY\"",
		"mtime": "2026-09-10T06:12:44.320Z",
		"size": 190,
		"path": "../public/assets/play-CPV0a6Tn.js"
	},
	"/assets/power-trader-CH4kuJkt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"361e-2sB7ihDDsKi/KN1UhEc9mKg4xjY\"",
		"mtime": "2026-09-10T06:12:44.321Z",
		"size": 13854,
		"path": "../public/assets/power-trader-CH4kuJkt.js"
	},
	"/assets/redirect-Dhm19zUi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f4-ePZWCXP5uehkmkGMkMl5xDch+/Y\"",
		"mtime": "2026-09-10T06:12:44.321Z",
		"size": 500,
		"path": "../public/assets/redirect-Dhm19zUi.js"
	},
	"/assets/registry-knm4aSuh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1702-hci5BGkz8kVkPE/wY2KsAWbjT/c\"",
		"mtime": "2026-09-10T06:12:44.321Z",
		"size": 5890,
		"path": "../public/assets/registry-knm4aSuh.js"
	},
	"/assets/reports-BR9PdzIu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3977-rEQaxK5+NRe/SYTwRbt15Nd7r4M\"",
		"mtime": "2026-09-10T06:12:44.321Z",
		"size": 14711,
		"path": "../public/assets/reports-BR9PdzIu.js"
	},
	"/assets/shield-check-DFHzr1Zc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-eDBcw3yCumKkKJKPHpRBYc9MDPU\"",
		"mtime": "2026-09-10T06:12:44.322Z",
		"size": 320,
		"path": "../public/assets/shield-check-DFHzr1Zc.js"
	},
	"/assets/routes-BSkEXKvn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a4b9-tsdy/asecQTSLS8FfLWNOsj/rq0\"",
		"mtime": "2026-09-10T06:12:44.322Z",
		"size": 107705,
		"path": "../public/assets/routes-BSkEXKvn.js"
	},
	"/assets/sparkles-gFfgSoCb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"289-YUHMXSRKyGmxNwMpShhD0JLRSko\"",
		"mtime": "2026-09-10T06:12:44.322Z",
		"size": 649,
		"path": "../public/assets/sparkles-gFfgSoCb.js"
	},
	"/assets/subscription-keys-pdVQg2kR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2293-7YlS7M1GwlxToSBNe8HFbAGFejk\"",
		"mtime": "2026-09-10T06:12:44.322Z",
		"size": 8851,
		"path": "../public/assets/subscription-keys-pdVQg2kR.js"
	},
	"/assets/useAuth-BFqYuI24.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c2-VxbAqk520I+sMTbVjjDCS5VtLSc\"",
		"mtime": "2026-09-10T06:12:44.322Z",
		"size": 450,
		"path": "../public/assets/useAuth-BFqYuI24.js"
	},
	"/assets/styles-BeV2EIz_.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b222-JmP2eCwxfWzWN6lnv/o3CXc42FM\"",
		"mtime": "2026-09-10T06:12:44.323Z",
		"size": 111138,
		"path": "../public/assets/styles-BeV2EIz_.css"
	},
	"/assets/utils-B6KiDbIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a7d-iNkBSvaSyIjvZOzWoTvEa49qwcI\"",
		"mtime": "2026-09-10T06:12:44.323Z",
		"size": 27261,
		"path": "../public/assets/utils-B6KiDbIe.js"
	},
	"/assets/wrench-Dsvq_fxe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7-DtnemesFJg/5BAj7OM/utf7D0ms\"",
		"mtime": "2026-09-10T06:12:44.323Z",
		"size": 679,
		"path": "../public/assets/wrench-Dsvq_fxe.js"
	},
	"/assets/x-BCugWSU9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e6-SZR0OdaKGfJqs7KUC26NekQob9Q\"",
		"mtime": "2026-09-10T06:12:44.323Z",
		"size": 486,
		"path": "../public/assets/x-BCugWSU9.js"
	},
	"/assets/zap-CzaTQe-r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45a-ZN1nnY8uZZx4wJy+VtascxeFIsg\"",
		"mtime": "2026-09-10T06:12:44.323Z",
		"size": 1114,
		"path": "../public/assets/zap-CzaTQe-r.js"
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
var _lazy_o9Xcfy = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_o9Xcfy
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
