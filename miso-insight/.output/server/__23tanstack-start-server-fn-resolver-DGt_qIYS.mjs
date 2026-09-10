//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DGt_qIYS.js
var manifest = {
	"08ada0d0972999919c3d75f0707f9d1b29225d8e43d87ad55cfe53f5be5e7029": {
		functionName: "getMisoAccessStatus_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"366331fe1063b430495bd166bac6bcdd138b03bbe2d31a0e68455b455bf106fb": {
		functionName: "listMisoKeyReferences_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"53715280584ea9ae7fbeb88f272747b97fa37fe51716f44c2f921cc7e3db1929": {
		functionName: "getConversation_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"53c81702c55e0cf7b8196024adfb4f1fc245a47b8633cc7f646630a0fd357061": {
		functionName: "askMiso_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"5f218f6d0fb85a251d7bbcedee9693532e24ae764736155feeec44899c4b622f": {
		functionName: "listConversations_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"65c5998cc882019405184c31e505ffff83304283db864715a22f5e19a9c84bc0": {
		functionName: "deleteConversation_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"66c5ce382daa26edd2679d1bfba1b069936d4c734d98b36c80ec7ee82475fef5": {
		functionName: "resolveMiso_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"85485bd34222919b2bf18d50428d4af76f81307057d75602fa9e30d384f0e4f5": {
		functionName: "savePreferences_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"8bcb32185f06bf79bd0ecee7e7ec576cea6bf96d9b3166439ec0133a03d4fb86": {
		functionName: "runIntegrationSimulation_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"b464beb13f4a515a7490b2e929449dfc39ba7a057144c98df8e1895ce7d3d7de": {
		functionName: "getPreferences_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"c97dad620efce63aa8fb3b4daf42bc2b8de23e337fbb9048f57b940024c494d4": {
		functionName: "createMisoKeyReference_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	},
	"da08a354907a07e4060c1fd3c245f3b0fcf448348767f2e995bb6f9f65dc456e": {
		functionName: "rerunMisoRequest_createServerFn_handler",
		importer: () => import("./_ssr/miso.functions-zH_ZxZ4C.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
