"""Natural language to catalog parameters. Rules are explainable and deterministic."""
from datetime import date, timedelta
import re

from .catalog import select_endpoint

REGIONS = {"north": "NORTH", "central": "CENTRAL", "south": "SOUTH", "miso": "MISO"}
NODES = {
    "indiana hub": "INDIANA.HUB",
    "indiana": "INDIANA.HUB",
    "michigan": "MICHIGAN.HUB",
    "louisiana": "LOUISIANA.HUB",
}


def market_date(question, today=None):
    today = today or date.today()
    lower = question.lower()
    if "yesterday" in lower:
        return (today - timedelta(days=1)).isoformat()
    if "today" in lower:
        return today.isoformat()
    match = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", question)
    return match.group(1) if match else None


def resolve(question, context=None, today=None, preferred_endpoint=None):
    """Select operation, resolve official values, and list only genuinely required missing fields."""
    context = context or {}
    # A focused Ask AI action pins resolution to a catalog operation that the
    # backend itself recognized. This prevents nearby words in the follow-up
    # prompt from silently switching the selected API.
    explicit_endpoint = preferred_endpoint or select_endpoint(question)
    endpoint = explicit_endpoint or context.get("endpoint")
    if not endpoint:
        return {
            "intent": "clarify",
            "endpoint": None,
            "parameters": {},
            "missing": [],
            "message": "I can help with actual load, day-ahead demand, load forecasts, or LMP prices. Which data would you like?",
        }

    same_endpoint = context.get("endpoint", {}).get("id") == endpoint["id"]
    parameters = dict(context.get("parameters", {})) if same_endpoint else {}
    resolved_date = market_date(question, today)
    if resolved_date:
        parameters["date"] = resolved_date

    lower = question.lower()
    for human, official in REGIONS.items():
        if re.search(rf"\b{re.escape(human)}\b", lower):
            parameters["region"] = official
            parameters.setdefault("geoResolution", "region")
    for human, official in NODES.items():
        if human in lower:
            parameters["node"] = official
            break
    if "hourly" in lower:
        parameters["timeResolution"] = "hourly"
    elif "daily" in lower:
        parameters["timeResolution"] = "daily"
    elif "5 min" in lower or "5-minute" in lower or "5min" in lower:
        parameters["timeResolution"] = "5min"
    if "final" in lower:
        parameters["preliminaryFinal"] = "Final"
    elif "preliminary" in lower:
        parameters["preliminaryFinal"] = "Preliminary"

    missing = [item for item in endpoint["parameters"] if item["required"] and not parameters.get(item["name"])]
    technical = bool(re.search(r"\b(api|endpoint|curl|request|code)\b", lower))
    integration = bool(re.search(r"\b(database|postgres(?:ql)?|backend|warehouse|etl|pipeline|integration|local agent|local machine|implement|write code|change (?:my|the) code)\b", lower))
    # Follow-up answers such as "yesterday" should retain the purpose of the
    # original request; otherwise the web agent would lose the intended route
    # while collecting required values for a local integration.
    prior_intent = context.get("intent") if same_endpoint else None
    if not integration and not explicit_endpoint and prior_intent == "integration_guidance":
        integration = True
    elif not technical and not explicit_endpoint and prior_intent == "api_request":
        technical = True
    return {
        "intent": "integration_guidance" if integration else ("api_request" if technical else "retrieve_data"),
        "endpoint": endpoint,
        "parameters": parameters,
        "missing": missing,
        "chart_requested": bool(re.search(r"\b(chart|graph|plot|visuali[sz])\b", lower)),
        "message": "",
    }
