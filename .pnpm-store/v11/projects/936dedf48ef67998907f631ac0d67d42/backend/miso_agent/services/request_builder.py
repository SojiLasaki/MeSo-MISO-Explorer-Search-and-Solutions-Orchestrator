from urllib.parse import urlencode

from .catalog import AUTH_HEADER, MISO_BASE_URL, MISO_PUBLIC_BASE_URL, supports_public


def validate(endpoint, parameters):
    issues = []
    for spec in endpoint["parameters"]:
        value = parameters.get(spec["name"])
        if spec["required"] and not value:
            issues.append({"parameter": spec["name"], "message": f"{spec['label']} is required."})
        if value and spec["options"] and value not in spec["options"]:
            issues.append({"parameter": spec["name"], "message": f"Invalid value '{value}'.", "expected": spec["options"]})
    if parameters.get("geoResolution") == "localResourceZone" and not parameters.get("localResourceZone"):
        issues.append({"parameter": "localResourceZone", "message": "A local resource zone is required with localResourceZone resolution."})
    return issues


def build(endpoint, parameters, *, prefer_public=False):
    use_public = prefer_public and supports_public(endpoint)
    if use_public:
        path = endpoint["public_path"]
        url = MISO_PUBLIC_BASE_URL + path
        return {
            "method": endpoint["method"],
            "url": url,
            "endpoint": url,
            "params": {},
            "headers": {"Accept": "application/json"},
            "source": "public",
        }

    path = endpoint["path"]
    query = {}
    for spec in endpoint["parameters"]:
        value = parameters.get(spec["name"])
        if spec["in"] == "path" and value:
            path = path.replace("{" + spec["name"] + "}", str(value))
        elif spec["in"] == "query" and value not in (None, ""):
            query[spec["name"]] = value
    # Leave unresolved path tokens only when the caller skipped optional path params.
    if "{date}" in path and not parameters.get("date"):
        path = path.replace("{date}", "current")
    base_url = MISO_BASE_URL + path
    url = base_url + ("?" + urlencode(query) if query else "")
    return {
        "method": endpoint["method"],
        "url": url,
        "endpoint": MISO_BASE_URL + path,
        "params": query,
        "headers": {AUTH_HEADER: "[stored server-side]", "Accept": "application/json"},
        "source": "data_exchange",
    }
