import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integration-lab-BM2Xf2XL.js
var $$splitComponentImporter = () => import("./integration-lab-BtVdSqEe.mjs");
var Route = createFileRoute("/integration-lab")({
	validateSearch: (search) => ({
		report: typeof search.report === "string" ? search.report : void 0,
		api: typeof search.api === "string" ? search.api : void 0
	}),
	head: () => ({ meta: [{ title: "Integration Lab — MISO AI" }, {
		name: "description",
		content: "Simulate secure, catalog-backed MISO backend integrations for traders, utilities, interconnection customers, and reliability teams."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
