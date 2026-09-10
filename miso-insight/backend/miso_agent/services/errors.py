"""Conservative troubleshooting; it never exposes a subscription key."""

ERRORS = {
    400: ("invalid_request", "MISO rejected a parameter or request shape.", "Check the highlighted parameter names, official values, and date format before retrying.", True),
    401: ("authentication", "The MISO subscription key is absent, expired, or rejected.", "Create or retrieve a key in the MISO Data Exchange portal, set MISO_SUBSCRIPTION_KEY in backend/.env, then restart Django.", True),
    403: ("authorization", "The key is valid but is not entitled to this MISO product.", "Confirm the subscription includes this API product in the MISO Data Exchange portal.", True),
    404: ("not_found", "The endpoint or market-date resource was not found.", "Verify the catalog endpoint and requested market date; do not substitute a guessed URL.", True),
    405: ("method", "The endpoint does not accept this HTTP method.", "Use the catalog method shown in Request Verification (GET for these read operations).", True),
    408: ("timeout", "The upstream request timed out.", "Retry the same safe GET request with bounded backoff; reduce the date or filter scope if supported.", True),
    409: ("conflict", "The request conflicts with current upstream state.", "Read the response body, refresh endpoint metadata, and retry only after the conflict is resolved.", True),
    429: ("rate_limit", "MISO rate-limited the request.", "Honor Retry-After and retry with exponential backoff and jitter.", True),
    500: ("upstream", "MISO returned an internal server error.", "Retry later with backoff; retain the non-secret request ID for support.", True),
    501: ("upstream", "The upstream service does not implement this operation.", "Reconfirm the operation against the current MISO catalog; do not retry blindly.", False),
    502: ("gateway", "A gateway received an invalid upstream response.", "Retry later with backoff and check any local proxy configuration.", True),
    503: ("unavailable", "MISO is temporarily unavailable.", "Retry later with bounded backoff; do not treat this as empty data.", True),
    504: ("timeout", "The gateway timed out waiting for MISO.", "Retry later with bounded backoff and preserve the failed request audit record.", True),
    505: ("http_version", "The server or gateway does not support the HTTP protocol version used.", "Remove manual Upgrade, Connection, or HTTP/2 headers; use the backend's standard HTTPS client and check proxy/TLS protocol settings before retrying.", False),
}


def diagnose(status, body=None, request=None):
    category, explanation, fix, retry = ERRORS.get(status, ("network", "The request could not be completed.", "Check connectivity and the non-secret request details, then retry if safe.", True))
    return {
        "status_code": status,
        "category": category,
        "what_happened": explanation,
        "suggested_fix": fix,
        "can_retry": retry,
        "safe_request_context": {
            "method": (request or {}).get("method"),
            "url": (request or {}).get("url"),
            "body": body if isinstance(body, (dict, list, str)) else None,
        },
    }
