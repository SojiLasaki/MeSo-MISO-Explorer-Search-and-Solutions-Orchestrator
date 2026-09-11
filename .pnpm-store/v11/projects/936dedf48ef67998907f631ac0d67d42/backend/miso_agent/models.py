"""Audit models. No model stores a raw MISO subscription key."""
from django.conf import settings
from django.db import models
import uuid


class APIConfiguration(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    base_url = models.URLField(default="https://apim.misoenergy.org")
    subscription_key_reference = models.CharField(max_length=128, blank=True)
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MISOEndpoint(models.Model):
    source_id = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=200)
    endpoint = models.CharField(max_length=500)
    method = models.CharField(max_length=10, default="GET")
    metadata = models.JSONField(default=dict)


class MISOParameter(models.Model):
    endpoint = models.ForeignKey(MISOEndpoint, related_name="parameters", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    required = models.BooleanField(default=False)
    specification = models.JSONField(default=dict)


class AgentSession(models.Model):
    session_id = models.CharField(max_length=64, unique=True)
    context = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AgentMessage(models.Model):
    session = models.ForeignKey(AgentSession, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=16)
    content = models.TextField()
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class APIRequest(models.Model):
    session = models.ForeignKey(AgentSession, null=True, blank=True, on_delete=models.SET_NULL)
    source_id = models.CharField(max_length=128)
    method = models.CharField(max_length=10)
    url = models.TextField()
    parameters = models.JSONField(default=dict)
    mode = models.CharField(max_length=16)
    status_code = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class APIResponse(models.Model):
    request = models.OneToOneField(APIRequest, related_name="response", on_delete=models.CASCADE)
    body = models.JSONField(default=dict)
    received_at = models.DateTimeField(auto_now_add=True)


class APIError(models.Model):
    request = models.ForeignKey(APIRequest, related_name="errors", null=True, blank=True, on_delete=models.SET_NULL)
    status_code = models.IntegerField(null=True, blank=True)
    category = models.CharField(max_length=64)
    message = models.TextField()
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class TroubleshootingResult(models.Model):
    error = models.OneToOneField(APIError, related_name="troubleshooting", on_delete=models.CASCADE)
    diagnosis = models.TextField()
    suggested_fix = models.TextField()
    can_retry = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class RequestHistory(models.Model):
    request = models.ForeignKey(APIRequest, on_delete=models.CASCADE)
    summary = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)


class LocalAgentHandoff(models.Model):
    """A signed, secret-free instruction sent from the web agent to a local bridge."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.CharField(max_length=128, default="default")
    status = models.CharField(
        max_length=16,
        default="queued",
        choices=[("queued", "queued"), ("received", "received"), ("completed", "completed"), ("failed", "failed")],
    )
    payload = models.JSONField(default=dict)
    signature = models.CharField(max_length=128)
    receipt = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
