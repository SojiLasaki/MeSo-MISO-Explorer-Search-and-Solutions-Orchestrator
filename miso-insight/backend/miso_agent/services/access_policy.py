"""Deterministic access and privacy policy for the local MISO chat adapter."""
import re

PERSONAL_INFO = re.compile(r"\b(personal|personnel|employee|individual|private)\b[\s\w-]{0,40}\b(information|data|record|records|salary|pay|compensation|wage|address|phone|email)\b|\b(salary|pay|compensation|wage)\b[\s\w-]{0,40}\b(person|employee|staff|member)\b|\b(person|employee|staff|member)'?s?\s+(salary|pay|compensation|wage)\b", re.I)
BUSINESS_DECISION = re.compile(r"\b(business insight|business advice|make(?:\s+(?:a|the|this|that|an))?\s+[^.!?\n]{0,30}\bdecision|decide for me|recommend(?:ation)?|strategy|strategic|should (?:we|i)|what should|which should|optimize|investment advice|trading advice|bid(?:ding)? strategy)\b", re.I)
INTERNAL_PRIVATE = re.compile(r"\b(internal|private|privileged|confidential|nonpublic|non-public|restricted)\b[\s\w-]{0,60}\b(system|systems|architecture|connection|integration|workflow|process|information|data)?|\b(how|where)\b[\s\w-]{0,40}\b(internal|private)\b", re.I)
PORTAL_DATA = re.compile(r"\b(real[ -]?time|rt)\b[\s\w-]{0,60}\b(price|pricing|lmp|congestion|bottleneck|grid|information)\b|\b(price|pricing|lmp|congestion|bottleneck)\b[\s\w-]{0,60}\b(real[ -]?time|grid)\b|\b(clear(?:ing|ed)|generator clearing|clearing information)\b[\s\w-]{0,40}\b(generator|generation|unit|resource)?", re.I)


def classify_access(question):
    if PERSONAL_INFO.search(question):
        return "personal"
    if BUSINESS_DECISION.search(question):
        return "business"
    if INTERNAL_PRIVATE.search(question):
        return "internal"
    if PORTAL_DATA.search(question):
        return "portal"
    return "public"


def restricted_response(question, category):
    if category == "personal":
        return {
            "status": "success",
            "message": "I can’t provide personal or personnel information, including a person’s salary, compensation, or private records.",
            "policy_category": category,
        }
    if category == "business":
        subject = "MISO help request: business decision support"
        body = f"Hello MISO Help Desk,\n\nI need assistance with this MISO business decision question:\n\n{question}\n\nPlease advise what authorized MISO resources or contacts can support this request.\n\nThank you"
        message = "I can provide MISO data and explain what it shows, but I can’t provide business insights or make a business decision for you. Please contact MISO at support@askmiso.com."
    elif category == "internal":
        subject = "MISO help desk request: internal information access"
        body = f"Hello MISO Help Desk,\n\nI need assistance with this internal MISO information request:\n\n{question}\n\nPlease let me know what authorization is required and the expected timeline.\n\nThank you"
        message = "I can’t retrieve privileged internal information about MISO systems or how they are connected. Please contact MISO’s help desk at support@askmiso.com."
    else:
        subject = "MISO access request: DART / PI data"
        body = f"Hello MISO,\n\nI need access to the MISO DART database or PI MISO for this request:\n\n{question}\n\nPlease let me know what authorization is required and the expected timeline.\n\nThank you"
        message = "That information is not publicly accessible through this assistant. Log into the MISO portal and go to the DART database MISO or PI MISO. Please contact support@askmiso.com if you need access assistance."
    return {
        "status": "needs_input",
        "message": message,
        "policy_category": category,
        "access_request": {
            "status": "draft",
            "recipient": "support@askmiso.com",
            "subject": subject,
            "body": body,
            "timeline": "MISO will confirm the authorization requirements and expected access date, or explain why access cannot be granted.",
        },
    }
