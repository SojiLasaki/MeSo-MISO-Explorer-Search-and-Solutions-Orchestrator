import type { AccessRequest, AccessPolicyCategory, AccessPolicyDecision } from "./types";

const REAL_TIME_RESTRICTED = /\b(real[ -]?time|rt)\b[\s\w-]{0,60}\b(congestion|bottleneck|grid|information)\b|\b(congestion|bottleneck)\b[\s\w-]{0,60}\b(real[ -]?time|grid)\b/i;
const CLEARING_RESTRICTED = /\b(clear(?:ing|ed)|generator clearing|clearing information)\b[\s\w-]{0,40}\b(generator|generation|unit|resource)?/i;
const PORTAL_WORDS = /\b(dart|pi|portal|database)\b/i;
const INTERNAL_PRIVATE = /\b(internal|private|privileged|confidential|nonpublic|non-public|restricted)\b[\s\w-]{0,60}\b(system|systems|architecture|connection|integration|workflow|process|information|data)?|\b(how|where)\b[\s\w-]{0,40}\b(internal|private)\b/i;
const PERSONAL_INFO = /\b(personal|personnel|employee|individual|private)\b[\s\w-]{0,40}\b(information|data|record|records|salary|pay|compensation|wage|address|phone|email)\b|\b(salary|pay|compensation|wage)\b[\s\w-]{0,40}\b(person|employee|staff|member)\b|\b(person|employee|staff|member)'?s?\s+(salary|pay|compensation|wage)\b/i;
const BUSINESS_DECISION = /\b(business insight|business advice|make(?:\s+(?:a|the|this|that|an))?\s+[^.!?\n]{0,30}\bdecision|decide for me|recommend(?:ation)?|strategy|strategic|should (?:we|i)|what should|which should|optimize|investment advice|trading advice|bid(?:ding)? strategy)\b/i;

export function classifyAccessPolicy(question: string): AccessPolicyDecision {
  if (PERSONAL_INFO.test(question)) return { category: "personal", requestable: false };
  if (BUSINESS_DECISION.test(question)) return { category: "business", requestable: true };
  if (INTERNAL_PRIVATE.test(question)) return { category: "internal", requestable: true };
  if (REAL_TIME_RESTRICTED.test(question) || CLEARING_RESTRICTED.test(question) || PORTAL_WORDS.test(question) && /\b(clear|congestion|bottleneck|real[ -]?time|price|generator)\b/i.test(question)) {
    return { category: "portal", requestable: true };
  }
  return { category: "public", requestable: true };
}


export function buildAccessRequest(question: string, decision: AccessPolicyDecision): AccessRequest {
  const internal = decision.category === "internal";
  const business = decision.category === "business";
  const category: Exclude<AccessPolicyCategory, "public"> = decision.category === "public" ? "portal" : decision.category;
  const subject = business
    ? "MISO help request: business decision support"
    : internal
      ? "MISO help desk request: internal information access"
      : "MISO access request: DART / PI data";
  const body = business
    ? `Hello MISO Help Desk,\n\nI need assistance with this MISO business decision question:\n\n${question}\n\nPlease advise what authorized MISO resources or contacts can support this request.\n\nThank you`
    : internal
    ? `Hello MISO Help Desk,\n\nI need assistance with this internal MISO information request:\n\n${question}\n\nPlease let me know whether access can be granted, what authorization is required, and the expected timeline.\n\nThank you`
    : `Hello MISO,\n\nI need access to the MISO DART database or PI MISO for this request:\n\n${question}\n\nPlease let me know whether access can be granted, what authorization is required, and the expected timeline.\n\nThank you`;
  return {
    category,
    status: "draft",
    subject,
    body,
    recipient: process.env["MISO_HELP_DESK_EMAIL"] || "support@askmiso.com",
    timeline: "MISO will confirm the authorization requirements and expected access date, or explain why access cannot be granted.",
  };
}
