"""Structured MISO catalog used by resolver and request builder, never an LLM prompt."""
from copy import deepcopy

MISO_BASE_URL = "https://apim.misoenergy.org"
AUTH_HEADER = "Ocp-Apim-Subscription-Key"
PORTAL_URL = "https://data-exchange.misoenergy.org/apis"


def param(name, label, required=False, location="query", options=None, description=""):
    return {
        "name": name,
        "label": label,
        "required": required,
        "in": location,
        "options": options or [],
        "description": description,
    }


CATALOG = [
    {
        "id": "actual_load",
        "name": "Actual Load",
        "group": "Load, generation & interchange",
        "description": "Actual electrical demand by MISO market date.",
        "method": "GET",
        "path": "/lgi/v1/real-time/{date}/demand/actual",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["actual load", "power usage", "demand", "load"],
        "parameters": [
            param("date", "Market date", True, "path", description="YYYY-MM-DD in MISO market time"),
            param("geoResolution", "Geographic resolution", options=["region", "localResourceZone"]),
            param("region", "Region", options=["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]),
            param("localResourceZone", "Local resource zone"),
            param("interval", "Specific interval"),
            param("timeResolution", "Time resolution", options=["hourly", "daily"]),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "day_ahead_demand",
        "name": "Day-Ahead Cleared Demand",
        "group": "Load, generation & interchange",
        "description": "Day-ahead cleared demand by market date.",
        "method": "GET",
        "path": "/lgi/v1/day-ahead/{date}/demand",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["cleared demand", "day ahead demand", "day-ahead demand"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("region", "Region", options=["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]),
            param("timeResolution", "Time resolution", options=["hourly", "daily"]),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "realtime_lmp",
        "name": "Real-Time Ex-Post LMP",
        "group": "Pricing",
        "description": "Real-time ex-post locational marginal prices.",
        "method": "GET",
        "path": "/pricing/v1/real-time/{date}/lmp-expost",
        "unit": "$/MWh",
        "documentation_url": PORTAL_URL,
        "keywords": ["market price", "market prices", "power price", "power prices", "lmp", "real time price", "real-time price"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("node", "Pricing node"),
            param("interval", "Specific interval"),
            param("timeResolution", "Time resolution", options=["5min", "hourly"]),
            param("preliminaryFinal", "Data status", options=["Preliminary", "Final"]),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "day_ahead_lmp",
        "name": "Day-Ahead Ex-Post LMP",
        "group": "Pricing",
        "description": "Day-ahead ex-post locational marginal prices.",
        "method": "GET",
        "path": "/pricing/v1/day-ahead/{date}/lmp-expost",
        "unit": "$/MWh",
        "documentation_url": PORTAL_URL,
        "keywords": ["day ahead price", "day-ahead price", "day ahead lmp", "day-ahead lmp"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("node", "Pricing node"),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "load_forecast",
        "name": "Medium-Term Load Forecast",
        "group": "Load, generation & interchange",
        "description": "Forecasted MISO load by market date.",
        "method": "GET",
        "path": "/lgi/v1/forecast/{date}/load",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["load forecast", "forecast load", "five day forecast", "5 day forecast"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("region", "Region", options=["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]),
            param("timeResolution", "Time resolution", options=["hourly", "daily"]),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "binding_constraints",
        "name": "Real-Time Binding Constraints",
        "group": "Load, generation & interchange",
        "description": "Real-time market binding constraints by MISO market date.",
        "method": "GET",
        "path": "/lgi/v1/real-time/{date}/binding-constraint",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["binding constraints", "binding constraint", "constraints", "constraint"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "state_estimator_load",
        "name": "Real-Time State Estimator Load",
        "group": "Load, generation & interchange",
        "description": "Real-time state-estimator load; it is not an ICCP or EMS control feed.",
        "method": "GET",
        "path": "/lgi/v1/real-time/{date}/demand/load-state-estimator",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["state estimator", "state-estimator load", "ems load"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("interval", "Specific interval"),
            param("timeResolution", "Time resolution", options=["hourly", "daily"]),
            param("zone", "Zone"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "realtime_generation_fuel_type",
        "name": "Real-Time Generation Fuel Type",
        "group": "Load, generation & interchange",
        "description": "Real-time generation by fuel type.",
        "method": "GET",
        "path": "/lgi/v1/real-time/{date}/generation/fuel-type",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["fuel mix", "fuel type", "generation fuel", "generation mix"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("region", "Region", options=["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
    {
        "id": "outage_forecast",
        "name": "Outage Forecast",
        "group": "Load, generation & interchange",
        "description": "Forecast outage information by MISO market date.",
        "method": "GET",
        "path": "/lgi/v1/forecast/{date}/outage",
        "unit": "MW",
        "documentation_url": PORTAL_URL,
        "keywords": ["outage forecast", "outage forecasts", "forecast outage", "outages"],
        "parameters": [
            param("date", "Market date", True, "path"),
            param("region", "Region", options=["NORTH", "CENTRAL", "SOUTH", "MISO", "NO_REGION"]),
            param("interval", "Specific interval"),
            param("pageNumber", "Page number"),
        ],
    },
]

# The web catalog carries the canonical MISO operation identifiers. Only these
# explicit aliases may pin a web-chat request to a backend operation; the
# browser never supplies an arbitrary URL or request method to execute.
WEB_SOURCE_TO_ENDPOINT_ID = {
    "get-v1-real-time-date-demand-actual": "actual_load",
    "get-v1-day-ahead-date-demand": "day_ahead_demand",
    "get-v1-real-time-date-lmp-expost": "realtime_lmp",
    "get-v1-day-ahead-date-lmp-expost": "day_ahead_lmp",
    "get-v1-forecast-date-load": "load_forecast",
    "get-v1-real-time-date-binding-constraint": "binding_constraints",
    "get-v1-real-time-date-demand-load-state-estimator": "state_estimator_load",
    "get-v1-real-time-date-generation-fuel-type": "realtime_generation_fuel_type",
    "get-v1-forecast-date-outage": "outage_forecast",
}


def endpoints():
    return deepcopy(CATALOG)


def endpoint(endpoint_id):
    for item in CATALOG:
        if item["id"] == endpoint_id:
            return deepcopy(item)
    return None


def endpoint_for_web_source(source_id):
    """Return a supported backend operation for a known, catalog-issued ID."""
    return endpoint(WEB_SOURCE_TO_ENDPOINT_ID.get(source_id, ""))


def select_endpoint(question):
    lower = question.lower()
    scores = []
    for item in CATALOG:
        # A specific phrase (e.g. “load forecast”) must beat a generic
        # fallback keyword (e.g. “load”). This keeps the resolver predictable.
        score = sum(len(keyword.split()) * 10 + len(keyword) for keyword in item["keywords"] if keyword in lower)
        if "api" in lower and score:
            score += 1
        if score:
            scores.append((score, item))
    return deepcopy(max(scores, key=lambda item: item[0])[1]) if scores else None
