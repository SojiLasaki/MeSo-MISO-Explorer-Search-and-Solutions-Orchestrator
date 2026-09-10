"""Agent orchestration service: resolve → validate → build → execute → diagnose."""
from datetime import date, timedelta
from uuid import uuid4
import re

from ..models import APIError, APIRequest, APIResponse, AgentMessage, AgentSession, RequestHistory, TroubleshootingResult
from .catalog import endpoint as catalog_endpoint, endpoint_for_web_source, supports_public
from .errors import diagnose
from .handoff import queue_handoff
from .miso_client import MisoClientError, execute, has_public_mode, has_subscription_key
from .reports import find_report
from .request_builder import build, validate
from .resolver import gemini_general_answer, resolve
from .routing import classify
from .access_policy import classify_access, restricted_response


def _session(session_id):
    if session_id:
        session, _ = AgentSession.objects.get_or_create(session_id=session_id)
        return session
    return AgentSession.objects.create(session_id=uuid4().hex)


def _question_for(spec):
    if spec["name"] == "date":
        return "What market date would you like? You can say “yesterday,” “today,” or YYYY-MM-DD."
    return f"What {spec['label'].lower()} should I use?"


def _summary(data):
    rows = data.get("data", []) if isinstance(data, dict) else []
    values = [row.get("value") for row in rows if isinstance(row, dict) and isinstance(row.get("value"), (int, float))]
    if not values:
        return {}
    return {"peak": max(values), "average": round(sum(values) / len(values), 2), "minimum": min(values), "records": len(values)}


def _event(stage, status, message):
    return {"stage": stage, "status": status, "message": message}


def _casual_reply(question):
    lower = question.lower().strip()
    if "do you love me" in lower:
        return "I don’t experience love, but I’m here to help you work through MISO data and reliable energy-data workflows."
    if re.search(r"\b(hello|hi|hey)\b", lower):
        return "Hi — ask me about MISO prices, load, forecasts, generation, outages, reports, or API integration."
    if "thank" in lower:
        return "You’re welcome. I can help with the next MISO data request whenever you’re ready."
    return None


def _operational_scope_reply(question):
    lower = question.lower()
    if "iccp" in lower or re.search(r"\bems\b", lower):
        return (
            "ICCP telemetry and EMS access are operational-tool and authorization decisions, not Data Exchange API functions. "
            "I can help retrieve a catalog-backed state-estimator load or constraint dataset, but please use the appropriate MISO operational access channel for ICCP or EMS provisioning."
        )
    return None


def _record_failure(request, status, body):
    advice = diagnose(status, body, {"method": request.method, "url": request.url})
    error = APIError.objects.create(request=request, status_code=status, category=advice["category"], message=advice["what_happened"], details=advice)
    TroubleshootingResult.objects.create(error=error, diagnosis=advice["what_happened"], suggested_fix=advice["suggested_fix"], can_retry=advice["can_retry"])
    return advice, error


def run_chat(question, session_id=None, mode=None, force_status=None, selected_source_id=None):
    session = _session(session_id)
    AgentMessage.objects.create(session=session, role="user", content=question, payload={})
    policy_category = classify_access(question)
    if policy_category != "public":
        payload = {"session_id": session.session_id, **restricted_response(question, policy_category)}
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload
    casual = _casual_reply(question)
    operational_scope = _operational_scope_reply(question)
    if casual or operational_scope:
        payload = {
            "session_id": session.session_id,
            "status": "success",
            "message": casual or operational_scope,
            "delivery": classify(question, "web_response"),
            "events": [_event("intent", "success", "Recognized a conversational or operational-access question."), _event("response", "success", "Returned guidance without attempting an unrelated MISO request.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    report = find_report(question) if "report" in question.lower() or "archive" in question.lower() else None
    if report:
        replacement = catalog_endpoint(report["api_replacement"]) if report["api_replacement"] else None
        message = report["description"]
        if replacement:
            message += f" The API-first replacement is {replacement['name']}."
        payload = {
            "session_id": session.session_id,
            "status": "success",
            "report": report,
            "delivery": classify(question, "report"),
            "message": message,
            "events": [_event("intent", "success", "Identified a market-report request."), _event("report", "success", "Returned an official report reference and the supported API migration path.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    preferred_endpoint = endpoint_for_web_source(selected_source_id) if selected_source_id else None
    if selected_source_id and not preferred_endpoint:
        payload = {
            "session_id": session.session_id,
            "status": "needs_input",
            "message": (
                "This selected API is loaded in the chat from the official catalog, but it is not yet enabled "
                "by this local execution adapter. I will not substitute a different endpoint. You can review its "
                "parameters here, open its official documentation, or select an enabled API to execute data."
            ),
            "delivery": classify(question, "web_response"),
            "events": [
                _event("dataset", "success", "Kept the conversation scoped to the selected catalog operation."),
                _event("availability", "warning", "This operation is not enabled by the local execution adapter; no request was sent."),
            ],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload
    resolution = resolve(question, session.context, preferred_endpoint=preferred_endpoint)
    endpoint = resolution["endpoint"]
    events = [_event("intent", "success", "Understanding your request.")]

    if resolution["intent"] == "general_info":
        answer = gemini_general_answer(question)
        if not answer:
            payload = {
                "session_id": session.session_id,
                "status": "error",
                "intent": "general_info",
                "message": "Gemini could not answer this MISO question. Please check the Gemini configuration or try again.",
                "delivery": classify(question, "general_info"),
                "events": events + [_event("response", "error", "Gemini did not return a response; no deterministic substitute was used.")],
            }
            AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
            return payload
        payload = {
            "session_id": session.session_id,
            "status": "success",
            "intent": "general_info",
            "message": answer,
            "delivery": classify(question, "general_info"),
            "events": events + [_event("response", "success", "Answered an in-scope MISO overview question without calling a data endpoint.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=answer, payload=payload)
        return payload

    if not endpoint:
        payload = {
            "session_id": session.session_id,
            "status": "needs_input",
            "message": resolution["message"],
            "delivery": classify(question, "clarify"),
            "events": events + [_event("dataset", "warning", "A supported MISO dataset still needs to be selected.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    events.extend([
        _event("dataset", "success", f"Identified: {endpoint['name']}."),
        _event("parameters", "success", "Resolved official MISO parameter values from your message and prior context."),
    ])
    delivery = classify(question, resolution["intent"])
    session.context = {"endpoint": endpoint, "parameters": resolution["parameters"], "intent": resolution["intent"]}
    session.save(update_fields=["context", "updated_at"])

    if resolution["missing"]:
        missing = [{**item, "question": _question_for(item)} for item in resolution["missing"]]
        action = "before I can send this secure integration instruction to your local agent" if delivery["requires_local_agent"] else "before I can call MISO"
        payload = {
            "session_id": session.session_id, "status": "needs_input", "intent": resolution["intent"],
            "endpoint": endpoint, "parameters": resolution["parameters"], "missing_parameters": missing,
            "delivery": delivery,
            "message": f"{missing[0]['question']} I need this {action}.",
            "events": events + [_event("parameters", "warning", "Paused before making an invalid request or local handoff.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    issues = validate(endpoint, resolution["parameters"])
    if issues:
        preview_spec = build(endpoint, resolution["parameters"])
        payload = {
            "session_id": session.session_id, "status": "validation_error", "endpoint": endpoint,
            "parameters": resolution["parameters"], "request": preview_spec, "issues": issues,
            "delivery": delivery,
            "message": "I found a parameter that needs correction before MISO is called.",
            "events": events + [_event("validation", "error", "Parameter validation failed; no MISO request was sent.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    chosen_mode = mode or ("live" if has_subscription_key() else ("public" if supports_public(endpoint) and has_public_mode() else "simulation"))
    # Public mode only has a real feed for mapped operations; other datasets stay simulated.
    if chosen_mode == "public" and not supports_public(endpoint):
        chosen_mode = "simulation"
        events.append(_event("availability", "warning", "This dataset is not on MISO's anonymous public API yet; using labeled simulation."))
    prefer_public = chosen_mode == "public" or (chosen_mode == "live" and supports_public(endpoint))
    request_spec = build(endpoint, resolution["parameters"], prefer_public=prefer_public)

    if resolution["intent"] == "integration_guidance":
        request = APIRequest.objects.create(session=session, source_id=endpoint["id"], method=request_spec["method"], url=request_spec["url"], parameters=resolution["parameters"], mode="template")
        RequestHistory.objects.create(request=request, summary=f"Integration template — {endpoint['name']}")
        handoff = queue_handoff(endpoint, resolution["parameters"], request_spec, "integration_template")
        payload = {
            "session_id": session.session_id,
            "status": "success",
            "intent": resolution["intent"],
            "integration_guidance": True,
            "endpoint": endpoint,
            "parameters": resolution["parameters"],
            "request": request_spec,
            "delivery": delivery,
            "handoff": handoff,
            "message": (
                f"I have all required values and queued a signed {endpoint['name']} implementation instruction for your local agent. "
                "It will generate a reviewable backend client only; your subscription key stays in the backend environment."
            ),
            "events": events + [_event("integration", "success", "Prepared a secure backend integration template; no data request was made."), _event("request", "success", "Generated a redacted API request template."), _event("handoff", "success", "Queued only the approved, secret-free local implementation instruction.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    if resolution["intent"] == "api_request":
        request = APIRequest.objects.create(session=session, source_id=endpoint["id"], method=request_spec["method"], url=request_spec["url"], parameters=resolution["parameters"], mode="preview")
        RequestHistory.objects.create(request=request, summary=f"API request preview — {endpoint['name']}")
        payload = {
            "session_id": session.session_id,
            "status": "success",
            "intent": resolution["intent"],
            "api_only": True,
            "endpoint": endpoint,
            "parameters": resolution["parameters"],
            "request": request_spec,
            "delivery": delivery,
            "message": f"Here is the validated {endpoint['name']} API request. It has not been executed.",
            "verification": {"tested": False, "status_code": None, "source": "Catalog-backed request preview", "authentication": "subscription key will be applied server-side only when executed"},
            "events": events + [_event("validation", "success", "Required parameters are complete and valid."), _event("request", "success", "Generated a redacted request preview; no local handoff is needed.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    request = APIRequest.objects.create(session=session, source_id=endpoint["id"], method=request_spec["method"], url=request_spec["url"], parameters=resolution["parameters"], mode=chosen_mode)
    auth_note = (
        "Public MISO feed; no subscription key used."
        if prefer_public
        else "Subscription key remains server-side."
    )
    events.extend([
        _event("validation", "success", "Required parameters are complete and valid."),
        _event("request", "success", f"Built {request_spec['method']} request. {auth_note}"),
    ])

    if force_status:
        advice, error = _record_failure(request, int(force_status), {"simulated": True, "message": "Intentional diagnostic response."})
        request.status_code = int(force_status)
        request.save(update_fields=["status_code"])
        handoff = queue_handoff(endpoint, resolution["parameters"], request_spec, "error_resolution", troubleshooting=advice)
        error_delivery = classify(question, resolution["intent"], error=True)
        payload = {
            "session_id": session.session_id, "status": "error", "endpoint": endpoint, "parameters": resolution["parameters"],
            "request": request_spec, "error": advice, "error_id": error.id, "delivery": error_delivery, "handoff": handoff, "message": f"HTTP {force_status}: {advice['what_happened']}",
            "events": events + [_event("api", "error", f"Received HTTP {force_status} in diagnostic mode."), _event("troubleshooting", "success", "The web agent produced a safe remediation plan."), _event("handoff", "success", "The web agent queued the safe diagnosis for the local agent.")],
        }
        AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
        return payload

    try:
        status, data, simulated = execute(request_spec, endpoint, resolution["parameters"], chosen_mode)
        request.status_code = status
        request.save(update_fields=["status_code"])
        APIResponse.objects.create(request=request, body=data)
        RequestHistory.objects.create(request=request, summary=f"{endpoint['name']} — {resolution['parameters'].get('date', '')}")
        if simulated:
            label = "SIMULATED RESPONSE — no MISO request was sent."
            source = "Development simulation"
            authentication = "not used in simulation"
        elif prefer_public:
            label = "Retrieved from MISO Public API (anonymous Fuel Mix / display feed)."
            source = "MISO Public API"
            authentication = "none — public anonymous endpoint"
        else:
            label = "Retrieved from MISO Data Exchange API."
            source = "MISO Data Exchange API"
            authentication = "subscription key applied server-side"
        payload = {
            "session_id": session.session_id, "status": "success", "intent": resolution["intent"], "endpoint": endpoint,
            "parameters": resolution["parameters"], "request": request_spec, "data": data, "summary": _summary(data), "simulated": simulated,
            "delivery": delivery,
            "chart_requested": resolution["chart_requested"],
            "message": f"{label} {endpoint['name']} is ready.",
            "verification": {
                "tested": True, "status_code": status,
                "source": source,
                "authentication": authentication,
            },
            "events": events + [_event("api", "success", label), _event("response", "success", "Validated JSON response and stored non-secret request history. No local handoff was needed.")],
        }
    except MisoClientError as exc:
        request.status_code = exc.status
        request.save(update_fields=["status_code"])
        advice, error = _record_failure(request, exc.status, exc.body)
        handoff = queue_handoff(endpoint, resolution["parameters"], request_spec, "error_resolution", troubleshooting=advice)
        error_delivery = classify(question, resolution["intent"], error=True)
        payload = {
            "session_id": session.session_id, "status": "error", "endpoint": endpoint, "parameters": resolution["parameters"],
            "request": request_spec, "error": advice, "error_id": error.id, "delivery": error_delivery, "handoff": handoff, "message": f"HTTP {exc.status}: {advice['what_happened']}",
            "events": events + [_event("api", "error", f"MISO request failed with HTTP {exc.status}."), _event("troubleshooting", "success", "The web agent produced a safe remediation plan."), _event("handoff", "success", "The web agent queued the safe diagnosis for the local agent.")],
        }
    AgentMessage.objects.create(session=session, role="assistant", content=payload["message"], payload=payload)
    return payload


def run_endpoint(endpoint_id, parameters, mode=None, force_status=None):
    operation = catalog_endpoint(endpoint_id)
    if not operation:
        return {"status": "error", "message": "Unknown catalog endpoint."}
    session = AgentSession.objects.create(session_id=uuid4().hex, context={"endpoint": operation, "parameters": parameters})
    return run_chat(operation["name"] + " " + parameters.get("date", ""), session.session_id, mode=mode, force_status=force_status)


def connection_test():
    if not has_subscription_key():
        return {"connected": False, "mode": "configuration_required", "status_code": 401, "error": diagnose(401, {"message": "MISO_SUBSCRIPTION_KEY is not configured."})}
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    return run_endpoint("actual_load", {"date": yesterday}, mode="live")
