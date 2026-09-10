import { n as CATALOG_OPERATIONS, s as operationToSource } from "./catalog-DaTbh8nC.mjs";
import { t as LEGACY_REPORT_SOURCES } from "./legacy-reports-jmctEBAE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/registry-ByJMkCvd.js
var REPORT_SOURCES = [
	{
		source_id: "miso_market_report_daily",
		name: "Daily Market Report",
		type: "report",
		description: "MISO daily market summary report covering prices, congestion and load.",
		supports: [
			"market report",
			"daily report",
			"latest report",
			"market summary"
		],
		requires_authentication: false,
		supports_api_generation: false,
		supports_visualization: false,
		documentation_url: "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/",
		parameters: [{
			name: "report_date",
			label: "Report date",
			type: "date",
			required: false,
			description: "Publication date of the report.",
			example: "2026-09-05"
		}]
	},
	{
		source_id: "miso_market_report_monthly",
		name: "Monthly Market Assessment",
		type: "report",
		description: "Independent Market Monitor monthly assessment of MISO market performance.",
		supports: [
			"monthly report",
			"market assessment",
			"imm report"
		],
		requires_authentication: false,
		supports_api_generation: false,
		supports_visualization: false,
		documentation_url: "https://www.misoenergy.org/markets-and-operations/real-time--market-data/market-reports/",
		parameters: []
	},
	{
		source_id: "miso_api_documentation",
		name: "MISO Data Exchange",
		type: "webpage",
		description: "Official Data Exchange catalog of Load, Generation, Interchange and Pricing APIs.",
		supports: [
			"api documentation",
			"how to authenticate",
			"subscription key",
			"developer portal",
			"data exchange"
		],
		requires_authentication: false,
		supports_api_generation: false,
		supports_visualization: false,
		documentation_url: "https://data-exchange.misoenergy.org/apis",
		parameters: []
	}
];
var MISO_SOURCES = [
	...CATALOG_OPERATIONS.map(operationToSource),
	...REPORT_SOURCES,
	...LEGACY_REPORT_SOURCES
];
function getSource(sourceId) {
	return MISO_SOURCES.find((s) => s.source_id === sourceId);
}
function scoreSource(question, source) {
	const q = question.toLowerCase();
	const qn = q.replace(/[-\s]+/g, " ");
	let score = 0;
	const name = source.name.toLowerCase().replace(/[-\s]+/g, " ");
	if (name && qn.includes(name)) score += 10;
	for (const phrase of source.supports) {
		const pn = phrase.toLowerCase().replace(/[-\s]+/g, " ");
		if (pn.length >= 4 && qn.includes(pn)) score += phrase.split(/\s+/).length + 2;
	}
	if (source.type !== "api") return score;
	const path = source.endpoint ?? "";
	if (/\bday[-\s]?ahead\b/.test(q) && path.includes("/day-ahead/")) score += 5;
	if (/\breal[-\s]?time\b|\brt\b/.test(q) && path.includes("/real-time/")) score += 5;
	if (/\bex-?ante\b/.test(q) && path.includes("exante")) score += 4;
	if (/\bex-?post\b/.test(q) && path.includes("expost")) score += 4;
	if (/\blmp\b|locational marginal|energy price/.test(q) && path.includes("lmp")) score += 6;
	if (/\bmcp\b|ancillary|asm\b/.test(q) && (path.includes("asm") || path.includes("mcp"))) score += 6;
	if (/\b(actual load|yesterday'?s? load|real-?time load|daily power usage|power usage)\b/.test(q) && path.includes("demand/actual")) score += 6;
	if (/\bcleared demand\b/.test(q) && path.includes("/demand") && !path.includes("actual") && !path.includes("forecast")) score += 6;
	if (/\bload\b/.test(q) && !/\bforecast\b/.test(q) && !/\blmp\b/.test(q) && path.includes("demand/actual")) score += 3;
	if (/\bphysical\b/.test(q) && path.includes("physical")) score += 4;
	if (/\bvirtual\b/.test(q) && path.includes("virtual")) score += 4;
	if (/\bfuel\b/.test(q) && path.includes("fuel-type")) score += 5;
	if (/\bhourly\b/.test(q) && (source.parameters ?? []).some((p) => p.name === "timeResolution")) score += 1;
	return score;
}
function rankSources(question) {
	const q = question.toLowerCase();
	const wantsReport = /\b(report|workbook|pdf|imm)\b/.test(q) && !/\bapi\b/.test(q);
	const wantsLegacyReport = /\b(?:old(?:er)?|legacy|archiv(?:e|ed)|retired)\b[\s\w-]{0,48}\b(?:report|reports|file|files)\b|\breader'?s guide\b|\breport[- ]to[- ]endpoint\b|\breport mapping\b/i.test(question);
	if (/\b(documentation|developer portal|subscription key|authenticate|data exchange)\b/.test(q)) {
		const docs = getSource("miso_api_documentation");
		return docs ? [{
			source: docs,
			score: 20
		}] : [];
	}
	if (wantsLegacyReport) {
		const legacy = LEGACY_REPORT_SOURCES.map((source) => ({
			source,
			score: scoreSource(question, source)
		})).filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
		if (legacy.length) return legacy;
	}
	if (wantsReport) {
		const report = getSource(/\bmonthly|imm\b/.test(q) ? "miso_market_report_monthly" : "miso_market_report_daily");
		return report ? [{
			source: report,
			score: 20
		}] : [];
	}
	return MISO_SOURCES.map((source) => ({
		source,
		score: scoreSource(question, source)
	})).filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
}
function isAmbiguousRanking(ranked) {
	const first = ranked[0];
	const second = ranked[1];
	if (!first || !second) return false;
	if (first.score < 4 || second.score < 4) return false;
	return second.score >= first.score * .8;
}
MISO_SOURCES.map((s) => ({
	source_id: s.source_id,
	name: s.name,
	type: s.type,
	description: s.description.slice(0, 220),
	supports: s.supports.slice(0, 8),
	endpoint: s.endpoint,
	required: (s.parameters ?? []).filter((p) => p.required).map((p) => p.name),
	optional: (s.parameters ?? []).filter((p) => !p.required).map((p) => ({
		name: p.name,
		options: p.options,
		in: p.in
	}))
}));
//#endregion
export { rankSources as i, getSource as n, isAmbiguousRanking as r, MISO_SOURCES as t };
