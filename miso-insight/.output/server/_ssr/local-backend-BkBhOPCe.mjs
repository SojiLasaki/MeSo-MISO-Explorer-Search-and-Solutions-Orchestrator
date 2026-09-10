//#region node_modules/.nitro/vite/services/ssr/assets/local-backend-BkBhOPCe.js
/**
* Production points to the deployed Web Data Agent. The loopback fallback is
* only for this development workspace; it is not the Local Integration Agent.
*/
var baseUrl = "http://127.0.0.1:8000/api";
function localAgentDownloadUrl() {
	return `${baseUrl}/local-agent/download/`;
}
async function localApi(path, init) {
	const response = await fetch(`${baseUrl}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers ?? {}
		}
	});
	const payload = await response.json();
	if (!response.ok) throw new Error(payload.detail ?? `Local backend request failed (${response.status}).`);
	return payload;
}
//#endregion
export { localApi as n, localAgentDownloadUrl as t };
