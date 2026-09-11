"""Decide whether work remains in the Web Data Agent or needs a local agent.

This is intentionally deterministic and auditable.  A market-data lookup or
API explanation has no reason to touch a user's computer.  Only a request to
implement, modify, troubleshoot, or otherwise affect a local integration is
eligible for a signed Local Integration Agent handoff.
"""
import re


LOCAL_AGENT_PATTERN = re.compile(
    r"\b("
    r"local agent|send (?:it|this|the request) to (?:the )?agent|"
    r"download (?:the )?agent|run (?:the )?agent|"
    r"backend|database|postgres(?:ql)?|warehouse|etl|pipeline|"
    r"integration|implement|write code|change (?:my|the) code|"
    r"add (?:it|this|the api) to (?:my|the) (?:app|project|service)|"
    r"local machine|source code|fix (?:the )?(?:error|integration)"
    r")\b",
    re.IGNORECASE,
)


def classify(question, intent, error=False):
    """Return an explainable delivery decision for the current conversation turn."""
    if error:
        return {
            "target": "local_integration_agent",
            "reason": "The request failed and a reviewed local remediation may be needed.",
            "requires_local_agent": True,
        }
    if intent == "integration_guidance" or LOCAL_AGENT_PATTERN.search(question):
        return {
            "target": "local_integration_agent",
            "reason": "This request asks to create, modify, or troubleshoot a local backend integration.",
            "requires_local_agent": True,
        }
    return {
        "target": "web_data_agent",
        "reason": "This request can be answered from the web data service without sharing work with a local machine.",
        "requires_local_agent": False,
    }
