#!/usr/bin/env python3
"""Turn miso-data-exchange-catalog CSVs into the app registry JSON."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = Path("/Users/oluwasojilasaki/Downloads/code/miso-data-exchange-catalog/output")
OUT = ROOT / "src/lib/miso/catalog.json"

ALIASES = {
    "get-v1-real-time-date-demand-actual": [
        "actual load",
        "yesterday load",
        "real time load",
        "real-time demand",
        "demand actual",
        "power usage",
        "historical load",
    ],
    "get-v1-forecast-date-load": [
        "load forecast",
        "forecast load",
        "expected demand",
        "tomorrow load",
        "medium term load",
    ],
    "get-v1-real-time-date-demand-forecast": [
        "real-time cleared demand",
        "rt demand",
        "cleared demand real-time",
    ],
    "get-v1-day-ahead-date-demand": [
        "day ahead demand",
        "day-ahead cleared demand",
        "da demand",
    ],
    "get-v1-real-time-date-generation-fuel-type": [
        "fuel mix",
        "generation mix",
        "resource mix",
        "real-time fuel",
    ],
    "get-v1-day-ahead-date-generation-fuel-type": [
        "day ahead fuel mix",
        "day-ahead generation fuel",
        "da fuel type",
    ],
    "get-v1-real-time-date-lmp-expost": [
        "real-time lmp",
        "rt lmp",
        "real time prices",
        "market prices",
        "lmp",
        "energy price",
        "today prices",
    ],
    "get-v1-real-time-date-lmp-exante": [
        "real-time ex-ante lmp",
        "rt ex ante lmp",
        "exante lmp real-time",
    ],
    "get-v1-day-ahead-date-lmp-expost": [
        "day ahead lmp",
        "day-ahead lmp",
        "day-ahead prices",
        "day ahead prices",
        "da lmp",
        "cleared prices",
        "expost lmp day-ahead",
    ],
    "get-v1-day-ahead-date-lmp-exante": [
        "day ahead ex-ante lmp",
        "da exante lmp",
    ],
    "get-v1-real-time-date-asm-expost": [
        "real-time mcp",
        "ancillary prices",
        "asm expost",
        "regulation price",
    ],
    "get-v1-real-time-date-asm-summary": [
        "mcp summary",
        "ancillary summary",
    ],
    "get-v1-aggregated-pnode": [
        "aggregated pnode",
        "hub list",
        "pricing nodes",
        "cpnode",
        "indiana hub",
        "node list",
    ],
    "get-v1-real-time-date-interchange-net-scheduled": [
        "interchange",
        "imports",
        "exports",
        "transfers",
        "net scheduled interchange",
        "nsi",
    ],
    "get-v1-real-time-date-interchange-net-actual": [
        "net actual interchange",
        "nai",
        "actual interchange",
    ],
    "get-v1-day-ahead-date-interchange-net-scheduled": [
        "day ahead interchange",
        "da nsi",
    ],
    "get-v1-real-time-date-outage": [
        "real-time outages",
        "rt outages",
        "generation outages",
    ],
    "get-v1-forecast-date-outage": [
        "outage forecast",
        "expected outages",
    ],
    "get-v1-real-time-date-binding-constraint": [
        "binding constraints",
        "congestion constraints",
    ],
    "get-v1-real-time-date-demand-load-state-estimator": [
        "state estimator load",
        "eia-930",
        "preliminary actual load",
    ],
}


def parse_params(blob: str, loc: str) -> list[dict]:
    if not blob or not blob.strip():
        return []
    parts = [p.strip() for p in re.split(r"\s\|\s", blob) if p.strip()]
    out: list[dict] = []
    for part in parts:
        m = re.match(
            r"^([A-Za-z][A-Za-z0-9]*)\s*\(([^)]+)\)(?:\s*[—\-]\s*(.*))?$",
            part,
        )
        if not m:
            continue
        name, meta, desc = m.group(1), m.group(2), (m.group(3) or "").strip()
        bits = [b.strip() for b in meta.split(",")]
        required = any(b == "required" for b in bits)
        typ = "string"
        default = None
        enum = None
        for bit in bits:
            if bit.startswith("string:date") or bit == "string:date":
                typ = "date"
            elif bit.startswith("integer") or bit.startswith("number"):
                typ = "number"
            elif bit.startswith("default="):
                default = bit.split("=", 1)[1]
            elif bit.startswith("enum="):
                enum = bit.split("=", 1)[1].split("|")
        item: dict = {
            "name": name,
            "label": re.sub(r"([a-z])([A-Z])", r"\1 \2", name).replace("_", " ").title(),
            "type": typ,
            "required": required,
            "in": loc,
            "description": desc or f"{name} ({loc} parameter)",
        }
        if default:
            item["example"] = default
        elif typ == "date":
            item["example"] = "2026-09-06"
        if enum:
            item["options"] = enum
            item["type"] = "enum"
        out.append(item)
    return out


def supports_for(row: dict) -> list[str]:
    aliases = ALIASES.get(row["operation_id"], [])
    name = row["operation_name"].lower()
    tokens = [name, name.replace(",", ""), name.replace("—", " ")]
    return list(dict.fromkeys(aliases + tokens))


def main() -> None:
    ops_path = CATALOG / "miso_api_operations.csv"
    api_path = CATALOG / "miso_apis.csv"
    with api_path.open(newline="", encoding="utf-8") as f:
        apis = {r["api_id"]: r for r in csv.DictReader(f)}
    with ops_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    operations = []
    for row in rows:
        api = apis.get(row["api_id"], {})
        path_params = parse_params(row.get("path_parameters") or "", "path")
        query_params = parse_params(row.get("query_parameters") or "", "query")
        parameters = path_params + query_params
        source_id = row["operation_id"]
        unit = "MW"
        value_label = row["operation_name"]
        low = (row["operation_name"] + " " + row["description"]).lower()
        if "lmp" in low or "locational marginal" in low:
            unit = "$/MWh"
            value_label = "LMP"
        elif "mcp" in low or "market clearing" in low:
            unit = "$/MWh"
            value_label = "MCP"
        elif "load" in low or "demand" in low:
            value_label = "Load"
        elif "interchange" in low:
            value_label = "Interchange"
        elif "fuel" in low or "generation" in low:
            value_label = "Generation"
        operations.append(
            {
                "source_id": source_id,
                "name": row["operation_name"],
                "type": "api",
                "api_id": row["api_id"],
                "api_name": row["api_name"],
                "description": row["description"].strip(),
                "supports": supports_for(row),
                "requires_authentication": True,
                "supports_api_generation": True,
                "supports_visualization": True,
                "base_url": row["base_url"].rstrip("/"),
                "url_template": row["url_template"],
                "endpoint": f"{row['base_url'].rstrip('/')}{row['url_template']}",
                "method": row["http_method"],
                "documentation_url": row["portal_url"],
                "auth_header": row["auth_header"],
                "value_label": value_label,
                "unit": unit,
                "parameters": parameters,
                "required": [p["name"] for p in parameters if p["required"]],
                "optional": [p["name"] for p in parameters if not p["required"]],
                "availability_note": next(
                    (
                        sent.strip()
                        for sent in row["description"].split(".")
                        if "available" in sent.lower()
                    ),
                    "",
                ),
                "product": {
                    "id": api.get("api_id", row["api_id"]),
                    "path": api.get("path", row["api_path"]),
                    "portal": api.get("portal_details_url", row["portal_url"]),
                },
            }
        )

    payload = {
        "source": "miso-data-exchange-catalog",
        "gateway": "https://apim.misoenergy.org",
        "portal": "https://data-exchange.misoenergy.org",
        "auth_header": "Ocp-Apim-Subscription-Key",
        "required_env_var": "MISO_SUBSCRIPTION_KEY",
        "rate_limit": "100 calls/minute",
        "operations": operations,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {len(operations)} operations to {OUT}")


if __name__ == "__main__":
    main()
