"""Server-side MISO HTTP client using only Python's standard library."""
import json
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .catalog import AUTH_HEADER, MISO_PUBLIC_BASE_URL, supports_public


class MisoClientError(Exception):
    def __init__(self, status, body, message=None):
        self.status = status
        self.body = body
        super().__init__(message or f"MISO request failed with HTTP {status}.")


def has_subscription_key():
    return bool(os.getenv("MISO_SUBSCRIPTION_KEY", "").strip())


def has_public_mode():
    """Public mode is available whenever at least one catalog op has a public feed."""
    from .catalog import public_endpoints

    return bool(public_endpoints())


def simulated_data(endpoint, parameters):
    """Deterministic development data. It is always returned with simulated=True."""
    requested_date = parameters.get("date", datetime.now(timezone.utc).date().isoformat())
    if endpoint["id"] == "realtime_generation_fuel_type":
        fuels = [
            ("Coal", 31000),
            ("Natural Gas", 29000),
            ("Nuclear", 12000),
            ("Wind", 1500),
            ("Solar", 11000),
            ("Other", 1400),
        ]
        rows = [
            {
                "marketDate": requested_date,
                "interval": "simulated",
                "fuelType": name,
                "value": value,
                "region": parameters.get("region", "MISO"),
            }
            for name, value in fuels
        ]
        return {"data": rows, "page": {"lastPage": True, "totalPages": 1}, "simulated": True}

    bases = {
        "actual_load": 72000,
        "day_ahead_demand": 70500,
        "load_forecast": 73500,
        "state_estimator_load": 71800,
        "binding_constraints": 1250,
        "outage_forecast": 680,
    }
    base = bases.get(endpoint["id"], 48)
    rows = []
    for hour in range(24):
        offset = ((hour * 37) % 19) - 9
        value = round(base + offset * (350 if base > 1000 else 1.8), 2)
        rows.append({"marketDate": requested_date, "interval": f"{hour:02d}:00", "value": value, "region": parameters.get("region", "MISO")})
    return {"data": rows, "page": {"lastPage": True, "totalPages": 1}, "simulated": True}


def normalize_public_fuel_mix(payload, parameters):
    """Map MISO public Fuel Mix JSON into the agent row shape used by the UI."""
    fuels = (((payload or {}).get("Fuel") or {}).get("Type")) or []
    ref = (payload or {}).get("RefId") or ""
    rows = []
    for item in fuels:
        if not isinstance(item, dict):
            continue
        raw_value = item.get("ACT")
        try:
            value = float(raw_value)
        except (TypeError, ValueError):
            continue
        rows.append(
            {
                "marketDate": parameters.get("date") or datetime.now(timezone.utc).date().isoformat(),
                "interval": item.get("INTERVALEST") or ref,
                "fuelType": item.get("CATEGORY") or item.get("FUEL_CATEGORY") or "Unknown",
                "value": value,
                "region": parameters.get("region", "MISO"),
                "label": item.get("FUEL_CATEGORY"),
            }
        )
    return {
        "data": rows,
        "page": {"lastPage": True, "totalPages": 1},
        "simulated": False,
        "source": "MISO Public API",
        "refId": ref,
        "totalMW": (payload or {}).get("TotalMW"),
        "raw": payload,
    }


def normalize_public_lmp(payload, parameters):
    """Map MISO's current five-minute public LMP table into agent rows."""
    headers = (payload or {}).get("headers") or []
    values = (payload or {}).get("data") or []
    positions = {str(name).upper(): index for index, name in enumerate(headers)}
    rows = []
    requested_node = parameters.get("node", "").upper()
    for item in values:
        if not isinstance(item, list):
            continue
        node = str(item[positions["CPNODE"]]) if "CPNODE" in positions and positions["CPNODE"] < len(item) else ""
        if requested_node and node.upper() != requested_node:
            continue
        raw_lmp = item[positions["LMP"]] if "LMP" in positions and positions["LMP"] < len(item) else None
        try:
            value = float(raw_lmp)
        except (TypeError, ValueError):
            continue
        interval = str(item[positions["INTERVAL"]]) if "INTERVAL" in positions and positions["INTERVAL"] < len(item) else ""
        rows.append({
            "marketDate": interval[:10],
            "interval": interval,
            "node": node,
            "value": value,
            "lmp": value,
            "marginalLoss": item[positions["MLC"]] if "MLC" in positions and positions["MLC"] < len(item) else None,
            "marginalCongestion": item[positions["MCC"]] if "MCC" in positions and positions["MCC"] < len(item) else None,
        })
    return {
        "data": rows,
        "page": {"lastPage": True, "totalPages": 1},
        "simulated": False,
        "source": "MISO Public API",
        "headers": headers,
        "recordCount": len(rows),
    }


def _http_get_json(url, headers, timeout):
    outgoing = Request(url, method="GET", headers=headers)
    try:
        with urlopen(outgoing, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw)
    except HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = {"raw": raw[:2000]}
        raise MisoClientError(error.code, body) from error
    except URLError as error:
        raise MisoClientError(503, {"message": str(error.reason)}, "Could not reach MISO.") from error
    except json.JSONDecodeError as error:
        raise MisoClientError(502, {"message": "MISO response was not valid JSON."}) from error


def execute_public(endpoint, parameters, request_spec=None):
    """Fetch an anonymous public MISO display feed. Never attaches a subscription key."""
    if not supports_public(endpoint):
        raise MisoClientError(501, {"message": "No public counterpart is configured for this operation."})
    timeout = int(os.getenv("MISO_REQUEST_TIMEOUT_SECONDS", "30"))
    url = (request_spec or {}).get("url") or (MISO_PUBLIC_BASE_URL + endpoint["public_path"])
    status, payload = _http_get_json(
        url,
        {"Accept": "application/json", "User-Agent": "MISO-AI-Local/1.0"},
        timeout,
    )
    if endpoint["id"] == "realtime_generation_fuel_type":
        return status, normalize_public_fuel_mix(payload, parameters), False
    if endpoint["id"] == "realtime_lmp":
        return status, normalize_public_lmp(payload, parameters), False
    return status, {"data": [], "raw": payload, "simulated": False, "source": "MISO Public API"}, False


def execute(request_spec, endpoint, parameters, mode):
    if mode == "simulation":
        return 200, simulated_data(endpoint, parameters), True

    if mode == "public" or (mode == "live" and supports_public(endpoint) and not has_subscription_key()):
        return execute_public(endpoint, parameters, request_spec)

    # Transitioned public ops stay on the public feed even when a Data Exchange
    # key exists, so this one path never depends on a private subscription.
    if supports_public(endpoint) and mode == "live":
        return execute_public(endpoint, parameters, request_spec)

    key = os.getenv("MISO_SUBSCRIPTION_KEY", "").strip()
    if not key:
        raise MisoClientError(401, {"message": "MISO_SUBSCRIPTION_KEY is not configured locally."})
    timeout = int(os.getenv("MISO_REQUEST_TIMEOUT_SECONDS", "30"))
    status, payload = _http_get_json(
        request_spec["url"],
        {AUTH_HEADER: key, "Accept": "application/json", "User-Agent": "MISO-AI-Local/1.0"},
        timeout,
    )
    return status, payload, False
