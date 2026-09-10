import { a as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { D as isRedirect, _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DGt_qIYS.mjs";
import { r as requireSupabaseAuth, t as EXTERNAL_USER_PERSONAS } from "./integration-lab-C67heFZr.mjs";
import { a as recordType, i as objectType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/miso.functions-76DM3dDC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var TurnContext = objectType({
	source_id: stringType().optional(),
	dataset: stringType().optional(),
	parameters: recordType(stringType()).default({}),
	status: stringType().optional(),
	intent: stringType().optional(),
	missing: arrayType(objectType({
		name: stringType(),
		question: stringType()
	})).optional(),
	options: arrayType(objectType({
		dataset: stringType(),
		description: stringType(),
		source_id: stringType()
	})).optional()
});
var AskInput = objectType({
	question: stringType().min(1).max(2e3),
	conversation_id: stringType().uuid().nullable().optional(),
	last_turn: TurnContext.optional(),
	last_success: TurnContext.optional(),
	parameter_overrides: recordType(stringType()).optional()
});
var IntegrationSimulationInput = objectType({
	persona: enumType(EXTERNAL_USER_PERSONAS.map((persona) => persona.id)),
	mode: enumType(["success", "http_505"])
});
createServerFn({ method: "POST" }).validator(IntegrationSimulationInput).handler(createSsrRpc("8bcb32185f06bf79bd0ecee7e7ec576cea6bf96d9b3166439ec0133a03d4fb86"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AskInput).handler(createSsrRpc("53c81702c55e0cf7b8196024adfb4f1fc245a47b8633cc7f646630a0fd357061"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	message: stringType().min(1).max(2e3),
	conversation_id: stringType().uuid().nullable().optional()
})).handler(createSsrRpc("66c5ce382daa26edd2679d1bfba1b069936d4c734d98b36c80ec7ee82475fef5"));
/** Re-runs a plan with edited parameters (used by Canvas). */
var rerunMisoRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	question: stringType().min(1),
	conversation_id: stringType().uuid().nullable().optional()
})).handler(createSsrRpc("da08a354907a07e4060c1fd3c245f3b0fcf448348767f2e995bb6f9f65dc456e"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5f218f6d0fb85a251d7bbcedee9693532e24ae764736155feeec44899c4b622f"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("53715280584ea9ae7fbeb88f272747b97fa37fe51716f44c2f921cc7e3db1929"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("65c5998cc882019405184c31e505ffff83304283db864715a22f5e19a9c84bc0"));
/** The frontend only ever learns WHETHER MISO access is available. */
var getMisoAccessStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("08ada0d0972999919c3d75f0707f9d1b29225d8e43d87ad55cfe53f5be5e7029"));
var KeyReferenceInput = objectType({
	label: stringType().trim().min(1).max(80),
	environment_variable: stringType().trim().regex(/^[A-Z][A-Z0-9_]{2,63}$/, "Use an uppercase environment-variable name.")
});
/** Lists non-secret aliases for the user's local agent. Raw subscription keys
* are intentionally never accepted or returned by this application. */
var listMisoKeyReferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("366331fe1063b430495bd166bac6bcdd138b03bbe2d31a0e68455b455bf106fb"));
var createMisoKeyReference = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(KeyReferenceInput).handler(createSsrRpc("c97dad620efce63aa8fb3b4daf42bc2b8de23e337fbb9048f57b940024c494d4"));
var PrefsSchema = objectType({
	output_format: stringType(),
	units: stringType(),
	region: stringType(),
	always_show_api: booleanType()
});
var getPreferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b464beb13f4a515a7490b2e929449dfc39ba7a057144c98df8e1895ce7d3d7de"));
var savePreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(PrefsSchema).handler(createSsrRpc("85485bd34222919b2bf18d50428d4af76f81307057d75602fa9e30d384f0e4f5"));
//#endregion
export { rerunMisoRequest as a, listMisoKeyReferences as i, getMisoAccessStatus as n, savePreferences as o, getPreferences as r, useServerFn as s, createMisoKeyReference as t };
