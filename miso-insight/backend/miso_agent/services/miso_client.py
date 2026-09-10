"""Server-side MISO HTTP client using only Python's standard library."""
import json
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .catalog import AUTH_HEADER


class MisoClientError(Exception):
    def __init__(self, status, body, message=None):
        self.status = status
        self.body = body
        super().__init__(message or f"MISO request failed with HTTP {status}.")


def has_subscription_key():
    return bool(os.getenv("MISO_SUBSCRIPTION_KEY", "").strip())


def simulated_data(endpoint, parameters):
    """Deterministic development data. It is always returned with simulated=True."""
    requested_date = parameters.get("date", datetime.now(timezone.utc).date().isoformat())
    bases = {
        "actual_load": 72000,
        "day_ahead_demand": 70500,
        "load_forecast": 73500,
        "state_estimator_load": 71800,
        "binding_constraints": 1250,
        "realtime_generation_fuel_type": 9600,
        "outage_forecast": 680,
    }
    base = bases.get(endpoint["id"], 48)
    rows = []
    for hour in range(24):
        offset = ((hour * 37) % 19) - 9
        value = round(base + offset * (350 if base > 1000 else 1.8), 2)
        rows.append({"marketDate": requested_date, "interval": f"{hour:02d}:00", "value": value, "region": parameters.get("region", "MISO")})
    return {"data": rows, "page": {"lastPage": True, "totalPages": 1}, "simulated": True}


def execute(request_spec, endpoint, parameters, mode):
    if mode == "simulation":
        return 200, simulated_data(endpoint, parameters), True

    key = os.getenv("MISO_SUBSCRIPTION_KEY", "").strip()
    if not key:
        raise MisoClientError(401, {"message": "MISO_SUBSCRIPTION_KEY is not configured locally."})
    timeout = int(os.getenv("MISO_REQUEST_TIMEOUT_SECONDS", "30"))
    outgoing = Request(request_spec["url"], method=request_spec["method"], headers={AUTH_HEADER: key, "Accept": "application/json", "User-Agent": "MISO-AI-Local/1.0"})
    try:
        with urlopen(outgoing, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw), False
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
