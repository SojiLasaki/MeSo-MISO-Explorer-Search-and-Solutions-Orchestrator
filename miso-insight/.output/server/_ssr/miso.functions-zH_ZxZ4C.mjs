import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { r as requireSupabaseAuth, t as EXTERNAL_USER_PERSONAS } from "./integration-lab-C67heFZr.mjs";
import { a as recordType, i as objectType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/miso.functions-zH_ZxZ4C.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
/**
* Public, deterministic preflight for the integration lab. It uses no account
* data, credentials, or live MISO calls, so prospective users can safely see
* the backend flow before they connect their own environment.
*/
var runIntegrationSimulation_createServerFn_handler = createServerRpc({
	id: "8bcb32185f06bf79bd0ecee7e7ec576cea6bf96d9b3166439ec0133a03d4fb86",
	name: "runIntegrationSimulation",
	filename: "src/lib/miso.functions.ts"
}, (opts) => runIntegrationSimulation.__executeServer(opts));
var runIntegrationSimulation = createServerFn({ method: "POST" }).validator(IntegrationSimulationInput).handler(runIntegrationSimulation_createServerFn_handler, async ({ data }) => {
	const { runIntegrationSimulation: run } = await import("./integration-simulator.server-DAd-b6zx.mjs");
	return run(data.persona, data.mode);
});
var askMiso_createServerFn_handler = createServerRpc({
	id: "53c81702c55e0cf7b8196024adfb4f1fc245a47b8633cc7f646630a0fd357061",
	name: "askMiso",
	filename: "src/lib/miso.functions.ts"
}, (opts) => askMiso.__executeServer(opts));
var askMiso = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AskInput).handler(askMiso_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { runMisoRequest } = await import("./orchestrator.server-DyT51bvE.mjs");
	let conversationId = data.conversation_id ?? null;
	let history = [];
	if (conversationId) {
		const { data: prior } = await supabase.from("messages").select("role, content, payload").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(10);
		const { historyFromMessages } = await import("./conversation-DLXs5SJ7.mjs");
		history = historyFromMessages(prior ?? []);
	} else {
		const title = data.question.length > 60 ? `${data.question.slice(0, 57)}...` : data.question;
		const { data: created, error } = await supabase.from("conversations").insert({
			user_id: userId,
			title
		}).select("id").single();
		if (error) throw new Error(error.message);
		conversationId = created.id;
	}
	await supabase.from("messages").insert({
		conversation_id: conversationId,
		user_id: userId,
		role: "user",
		content: data.question
	});
	const response = await runMisoRequest(data.question, history, /* @__PURE__ */ new Date(), {
		...data.last_turn ? { lastTurn: data.last_turn } : {},
		...data.last_success ? { lastSuccess: data.last_success } : {},
		...data.parameter_overrides ? { parameterOverrides: data.parameter_overrides } : {}
	});
	await supabase.from("messages").insert({
		conversation_id: conversationId,
		user_id: userId,
		role: "assistant",
		content: response.title ?? response.answer,
		payload: JSON.parse(JSON.stringify(response))
	});
	await supabase.from("conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conversationId);
	return {
		conversation_id: conversationId,
		response
	};
});
var resolveMiso_createServerFn_handler = createServerRpc({
	id: "66c5ce382daa26edd2679d1bfba1b069936d4c734d98b36c80ec7ee82475fef5",
	name: "resolveMiso",
	filename: "src/lib/miso.functions.ts"
}, (opts) => resolveMiso.__executeServer(opts));
var resolveMiso = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	message: stringType().min(1).max(2e3),
	conversation_id: stringType().uuid().nullable().optional()
})).handler(resolveMiso_createServerFn_handler, async ({ data, context }) => {
	const { resolveMisoQuery } = await import("./resolver-dQUpQBON.mjs");
	const { historyFromMessages } = await import("./conversation-DLXs5SJ7.mjs");
	let history = [];
	if (data.conversation_id) {
		const { data: prior } = await context.supabase.from("messages").select("role, content, payload").eq("conversation_id", data.conversation_id).order("created_at", { ascending: true }).limit(10);
		history = historyFromMessages(prior ?? []);
	}
	return resolveMisoQuery(data.message, { history });
});
var rerunMisoRequest_createServerFn_handler = createServerRpc({
	id: "da08a354907a07e4060c1fd3c245f3b0fcf448348767f2e995bb6f9f65dc456e",
	name: "rerunMisoRequest",
	filename: "src/lib/miso.functions.ts"
}, (opts) => rerunMisoRequest.__executeServer(opts));
var rerunMisoRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	question: stringType().min(1),
	conversation_id: stringType().uuid().nullable().optional()
})).handler(rerunMisoRequest_createServerFn_handler, async ({ data }) => {
	const { runMisoRequest } = await import("./orchestrator.server-DyT51bvE.mjs");
	return runMisoRequest(data.question, []);
});
var listConversations_createServerFn_handler = createServerRpc({
	id: "5f218f6d0fb85a251d7bbcedee9693532e24ae764736155feeec44899c4b622f",
	name: "listConversations",
	filename: "src/lib/miso.functions.ts"
}, (opts) => listConversations.__executeServer(opts));
var listConversations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listConversations_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("conversations").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(30);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getConversation_createServerFn_handler = createServerRpc({
	id: "53715280584ea9ae7fbeb88f272747b97fa37fe51716f44c2f921cc7e3db1929",
	name: "getConversation",
	filename: "src/lib/miso.functions.ts"
}, (opts) => getConversation.__executeServer(opts));
var getConversation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ id: stringType().uuid() })).handler(getConversation_createServerFn_handler, async ({ data, context }) => {
	const { data: rows, error } = await context.supabase.from("messages").select("id, role, content, payload, created_at").eq("conversation_id", data.id).order("created_at", { ascending: true });
	if (error) throw new Error(error.message);
	return rows ?? [];
});
var deleteConversation_createServerFn_handler = createServerRpc({
	id: "65c5998cc882019405184c31e505ffff83304283db864715a22f5e19a9c84bc0",
	name: "deleteConversation",
	filename: "src/lib/miso.functions.ts"
}, (opts) => deleteConversation.__executeServer(opts));
var deleteConversation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ id: stringType().uuid() })).handler(deleteConversation_createServerFn_handler, async ({ data, context }) => {
	await context.supabase.from("conversations").delete().eq("id", data.id);
	return { ok: true };
});
var getMisoAccessStatus_createServerFn_handler = createServerRpc({
	id: "08ada0d0972999919c3d75f0707f9d1b29225d8e43d87ad55cfe53f5be5e7029",
	name: "getMisoAccessStatus",
	filename: "src/lib/miso.functions.ts"
}, (opts) => getMisoAccessStatus.__executeServer(opts));
var getMisoAccessStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMisoAccessStatus_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.from("profiles").select("miso_access_granted, display_name").eq("id", context.userId).maybeSingle();
	const { hasLiveMisoCredentials } = await import("./client.server-CwMy-1Z8.mjs").then((n) => n.t);
	return {
		connected: data?.miso_access_granted ?? true,
		mode: hasLiveMisoCredentials() ? "live" : "simulated",
		display_name: data?.display_name ?? null,
		checked_at: (/* @__PURE__ */ new Date()).toISOString()
	};
});
var KeyReferenceInput = objectType({
	label: stringType().trim().min(1).max(80),
	environment_variable: stringType().trim().regex(/^[A-Z][A-Z0-9_]{2,63}$/, "Use an uppercase environment-variable name.")
});
/** Lists non-secret aliases for the user's local agent. Raw subscription keys
* are intentionally never accepted or returned by this application. */
var listMisoKeyReferences_createServerFn_handler = createServerRpc({
	id: "366331fe1063b430495bd166bac6bcdd138b03bbe2d31a0e68455b455bf106fb",
	name: "listMisoKeyReferences",
	filename: "src/lib/miso.functions.ts"
}, (opts) => listMisoKeyReferences.__executeServer(opts));
var listMisoKeyReferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMisoKeyReferences_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("miso_key_references").select("id, label, environment_variable, status, created_at, updated_at").eq("user_id", context.userId).eq("status", "active").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var createMisoKeyReference_createServerFn_handler = createServerRpc({
	id: "c97dad620efce63aa8fb3b4daf42bc2b8de23e337fbb9048f57b940024c494d4",
	name: "createMisoKeyReference",
	filename: "src/lib/miso.functions.ts"
}, (opts) => createMisoKeyReference.__executeServer(opts));
var createMisoKeyReference = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(KeyReferenceInput).handler(createMisoKeyReference_createServerFn_handler, async ({ data, context }) => {
	const { data: created, error } = await context.supabase.from("miso_key_references").insert({
		user_id: context.userId,
		label: data.label,
		environment_variable: data.environment_variable
	}).select("id, label, environment_variable, status, created_at, updated_at").single();
	if (error) throw new Error(error.message);
	return created;
});
var PrefsSchema = objectType({
	output_format: stringType(),
	units: stringType(),
	region: stringType(),
	always_show_api: booleanType()
});
var getPreferences_createServerFn_handler = createServerRpc({
	id: "b464beb13f4a515a7490b2e929449dfc39ba7a057144c98df8e1895ce7d3d7de",
	name: "getPreferences",
	filename: "src/lib/miso.functions.ts"
}, (opts) => getPreferences.__executeServer(opts));
var getPreferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getPreferences_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.from("user_preferences").select("output_format, units, region, always_show_api").eq("user_id", context.userId).maybeSingle();
	return data ?? {
		output_format: "auto",
		units: "MW",
		region: "MISO",
		always_show_api: false
	};
});
var savePreferences_createServerFn_handler = createServerRpc({
	id: "85485bd34222919b2bf18d50428d4af76f81307057d75602fa9e30d384f0e4f5",
	name: "savePreferences",
	filename: "src/lib/miso.functions.ts"
}, (opts) => savePreferences.__executeServer(opts));
var savePreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(PrefsSchema).handler(savePreferences_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("user_preferences").upsert({
		user_id: context.userId,
		...data,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { askMiso_createServerFn_handler, createMisoKeyReference_createServerFn_handler, deleteConversation_createServerFn_handler, getConversation_createServerFn_handler, getMisoAccessStatus_createServerFn_handler, getPreferences_createServerFn_handler, listConversations_createServerFn_handler, listMisoKeyReferences_createServerFn_handler, rerunMisoRequest_createServerFn_handler, resolveMiso_createServerFn_handler, runIntegrationSimulation_createServerFn_handler, savePreferences_createServerFn_handler };
