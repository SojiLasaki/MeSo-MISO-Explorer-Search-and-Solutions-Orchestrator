"""Secure web-agent → local-agent instruction queue.

Payloads deliberately include a credential *reference* only.  The MISO key
remains in the backend or local environment and is never added to a handoff.
"""
import hashlib
import hmac
import json
import os

from ..models import LocalAgentHandoff


def _secret():
    return os.getenv("LOCAL_AGENT_SHARED_SECRET", "development-only-change-me").encode("utf-8")


def sign(payload):
    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hmac.new(_secret(), serialized, hashlib.sha256).hexdigest()


def verify(payload, signature):
    return hmac.compare_digest(sign(payload), signature)


def queue_handoff(endpoint, parameters, request_spec, purpose, troubleshooting=None):
    payload = {
        "version": 1,
        "purpose": purpose,
        "instruction": "Use this catalog-backed request in the local integration. Do not put a MISO subscription key in browser code or source control.",
        "endpoint": {
            "id": endpoint["id"],
            "name": endpoint["name"],
            "method": request_spec["method"],
            "url": request_spec["url"],
        },
        "parameters": parameters,
        "credential_reference": "MISO_SUBSCRIPTION_KEY",
    }
    if troubleshooting:
        payload["troubleshooting"] = {
            "status_code": troubleshooting["status_code"],
            "category": troubleshooting["category"],
            "suggested_fix": troubleshooting["suggested_fix"],
            "can_retry": troubleshooting["can_retry"],
        }
    handoff = LocalAgentHandoff.objects.create(payload=payload, signature=sign(payload))
    return {"id": str(handoff.id), "status": handoff.status, "agent_id": handoff.agent_id, "instruction": "A signed, secret-free integration instruction is queued for the local agent."}


def poll(agent_id):
    return LocalAgentHandoff.objects.filter(agent_id=agent_id, status="queued").order_by("created_at").first()


def update_handoff(handoff, status, receipt):
    handoff.status = status
    handoff.receipt = receipt or {}
    handoff.save(update_fields=["status", "receipt", "updated_at"])
    return handoff
