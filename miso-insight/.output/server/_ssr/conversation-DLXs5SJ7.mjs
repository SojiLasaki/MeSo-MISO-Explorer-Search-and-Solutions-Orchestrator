//#region node_modules/.nitro/vite/services/ssr/assets/conversation-DLXs5SJ7.js
var MISO_CTX_PREFIX = "[[miso_ctx:";
function isNewTopic(text) {
	return /^(hi|hello|hey|yo|thanks|thank you|thx|ok thanks|start over|new (chat|question|request|topic)|never mind|nvm)\b/i.test(text.trim());
}
function snapshotFromResponse(response) {
	const ctx = { parameters: response.parameters ?? {} };
	const sourceId = response.source?.id ?? response.resolution?.source_id;
	if (sourceId) ctx.source_id = sourceId;
	const dataset = response.source?.name ?? response.resolution?.dataset;
	if (dataset) ctx.dataset = dataset;
	if (response.resolution?.status) ctx.status = response.resolution.status;
	else ctx.status = response.execution.status;
	if (response.intent.type) ctx.intent = response.intent.type;
	if (response.resolution?.missing_parameters?.length) ctx.missing = response.resolution.missing_parameters;
	if (response.resolution?.options?.length) ctx.options = response.resolution.options;
	return ctx;
}
function encodeAssistantContext(response) {
	return `${response.title || response.answer || response.clarification || ""}\n${MISO_CTX_PREFIX}${JSON.stringify(snapshotFromResponse(response))}]]`;
}
function parseAssistantContext(line) {
	const start = line.lastIndexOf(MISO_CTX_PREFIX);
	const end = line.lastIndexOf("]]");
	if (start < 0 || end < 0 || end <= start) return void 0;
	try {
		return JSON.parse(line.slice(start + 11, end));
	} catch {
		return;
	}
}
function isSuccessCtx(ctx) {
	return Boolean(ctx.source_id) && (ctx.status === "success" || ctx.status === "resolved");
}
function conversationMemory(history, clientLastTurn, clientLastSuccess) {
	let lastSuccess;
	let lastCtx;
	for (const line of history) {
		const lower = line.toLowerCase();
		if (lower.startsWith("user:") && isNewTopic(line.replace(/^user:\s*/i, ""))) lastSuccess = void 0;
		if (!lower.startsWith("assistant:")) continue;
		const ctx = parseAssistantContext(line);
		if (!ctx) continue;
		lastCtx = ctx;
		if (isSuccessCtx(ctx)) lastSuccess = ctx;
	}
	if (clientLastSuccess && isSuccessCtx(clientLastSuccess) && lastSuccess === void 0) lastSuccess = clientLastSuccess;
	if (clientLastTurn) {
		lastCtx = clientLastTurn;
		if (isSuccessCtx(clientLastTurn)) lastSuccess = clientLastTurn;
	}
	return {
		...lastCtx ? { lastCtx } : {},
		...lastSuccess ? { lastSuccess } : {}
	};
}
/**
* Counts how many prior turns in this conversation successfully resolved to
* the given MISO source. Used to power the "you keep asking this — here's
* the API" nudge: MISO wants routine, repeated requests pushed toward
* self-serve Data Exchange access instead of staying as one-off chat asks.
*/
function countPriorSuccesses(history, sourceId) {
	let count = 0;
	for (const line of history) {
		if (!line.toLowerCase().startsWith("assistant:")) continue;
		const ctx = parseAssistantContext(line);
		if (ctx && ctx.source_id === sourceId && isSuccessCtx(ctx)) count += 1;
	}
	return count;
}
function historyFromMessages(rows) {
	return rows.map((m) => {
		if (m.role.toLowerCase() === "user") return `user: ${m.content}`;
		if (m.payload && typeof m.payload === "object") return `assistant: ${encodeAssistantContext(m.payload)}`;
		return `assistant: ${m.content}`;
	});
}
//#endregion
export { conversationMemory, countPriorSuccesses, historyFromMessages, isNewTopic };
