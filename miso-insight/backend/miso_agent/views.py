from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.crypto import constant_time_compare
from django.http import HttpResponse
import os
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from .models import APIError, APIRequest, AgentSession, LocalAgentHandoff
from .services.agent import connection_test, run_chat, run_endpoint
from .services.catalog import PORTAL_URL, endpoint, endpoints
from .services.errors import diagnose
from .services.miso_client import has_subscription_key
from .services.request_builder import build, validate
from .services.resolver import resolve
from .services.handoff import poll, queue_handoff, update_handoff, verify


class LocalAPIView(APIView):
    authentication_classes = []
    permission_classes = []


class HealthView(LocalAPIView):
    def get(self, request):
        return Response({"ok": True, "service": "miso-ai-django", "miso_mode": "live" if has_subscription_key() else "simulation"})


class ChatView(LocalAPIView):
    def post(self, request):
        question = str(request.data.get("question", "")).strip()
        if not question:
            return Response({"detail": "question is required"}, status=status.HTTP_400_BAD_REQUEST)
        mode = request.data.get("mode")
        if mode not in {None, "live", "simulation"}:
            return Response({"detail": "mode must be live or simulation"}, status=status.HTTP_400_BAD_REQUEST)
        selected_source_id = request.data.get("selected_source_id")
        if selected_source_id is not None and not isinstance(selected_source_id, str):
            return Response({"detail": "selected_source_id must be a string"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(run_chat(question, request.data.get("session_id"), mode=mode, selected_source_id=selected_source_id))


class AgentSessionListView(LocalAPIView):
    """Recent local web-agent conversations; message contents stay in the local database."""

    def get(self, request):
        sessions = AgentSession.objects.order_by("-updated_at")[:30]
        rows = []
        for session in sessions:
            last_user = session.messages.filter(role="user").order_by("-created_at").first()
            rows.append({
                "session_id": session.session_id,
                "preview": last_user.content if last_user else "New MISO conversation",
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "message_count": session.messages.count(),
            })
        return Response({"sessions": rows})


class AgentSessionDetailView(LocalAPIView):
    def get(self, request, session_id):
        try:
            session = AgentSession.objects.get(session_id=session_id)
        except AgentSession.DoesNotExist:
            return Response({"detail": "chat session not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "session": {
                "session_id": session.session_id,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
            },
            "messages": [{
                "role": message.role,
                "content": message.content,
                "payload": message.payload,
                "created_at": message.created_at,
            } for message in session.messages.order_by("created_at")],
        })


class ResolveView(LocalAPIView):
    def post(self, request):
        question = str(request.data.get("question", "")).strip()
        if not question:
            return Response({"detail": "question is required"}, status=status.HTTP_400_BAD_REQUEST)
        result = resolve(question, request.data.get("context") or {})
        if result["endpoint"]:
            result["request_preview"] = build(result["endpoint"], result["parameters"])
        return Response(result)


class ExecuteView(LocalAPIView):
    def post(self, request):
        endpoint_id = request.data.get("endpoint_id")
        parameters = request.data.get("parameters") or {}
        if not isinstance(parameters, dict):
            return Response({"detail": "parameters must be an object"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(run_endpoint(endpoint_id, parameters, request.data.get("mode"), request.data.get("force_status")))


class HandoffView(LocalAPIView):
    """The browser asks the web agent to queue a secret-free local instruction."""

    def post(self, request):
        operation = endpoint(request.data.get("endpoint_id"))
        parameters = request.data.get("parameters") or {}
        if not operation or not isinstance(parameters, dict):
            return Response({"detail": "A known endpoint_id and parameters object are required."}, status=status.HTTP_400_BAD_REQUEST)
        issues = validate(operation, parameters)
        if issues:
            return Response({"detail": "Request parameters need attention.", "issues": issues}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"handoff": queue_handoff(operation, parameters, build(operation, parameters), request.data.get("purpose", "manual_handoff"))})


class HandoffStatusView(LocalAPIView):
    def get(self, request, handoff_id):
        try:
            handoff = LocalAgentHandoff.objects.get(id=handoff_id)
        except LocalAgentHandoff.DoesNotExist:
            return Response({"detail": "handoff not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"id": str(handoff.id), "status": handoff.status, "receipt": handoff.receipt, "updated_at": handoff.updated_at})


def _local_agent_authorized(request):
    expected = os.getenv("LOCAL_AGENT_TOKEN", "development-local-agent-token")
    provided = request.headers.get("X-Local-Agent-Token", "")
    return bool(provided) and constant_time_compare(provided, expected)


class LocalAgentPollView(LocalAPIView):
    """Outbound local bridge polls the web service; the browser cannot poll it."""

    def get(self, request):
        if not _local_agent_authorized(request):
            return Response({"detail": "local agent authentication failed"}, status=status.HTTP_403_FORBIDDEN)
        agent_id = request.query_params.get("agent_id", "default")
        handoff = poll(agent_id)
        if not handoff:
            return Response({"handoff": None})
        return Response({"handoff": {"id": str(handoff.id), "payload": handoff.payload, "signature": handoff.signature}})


class LocalAgentAckView(LocalAPIView):
    def post(self, request):
        if not _local_agent_authorized(request):
            return Response({"detail": "local agent authentication failed"}, status=status.HTTP_403_FORBIDDEN)
        try:
            handoff = LocalAgentHandoff.objects.get(id=request.data.get("id"))
        except (LocalAgentHandoff.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "handoff not found"}, status=status.HTTP_404_NOT_FOUND)
        if not verify(handoff.payload, handoff.signature):
            return Response({"detail": "handoff signature validation failed"}, status=status.HTTP_409_CONFLICT)
        state = request.data.get("status")
        if state not in {"received", "completed", "failed"}:
            return Response({"detail": "invalid local agent status"}, status=status.HTTP_400_BAD_REQUEST)
        updated = update_handoff(handoff, state, request.data.get("receipt") or {})
        return Response({"id": str(updated.id), "status": updated.status})


class LocalAgentDownloadView(LocalAPIView):
    """Download the secret-free local bridge without exposing backend settings."""

    def get(self, request):
        agent_root = Path(__file__).resolve().parents[2] / "local_agent"
        archive = BytesIO()
        with ZipFile(archive, "w", ZIP_DEFLATED) as bundle:
            for source, destination in ((agent_root / "agent.py", "miso-local-agent/agent.py"), (agent_root / ".env.example", "miso-local-agent/.env.example")):
                bundle.writestr(destination, source.read_bytes())
            bundle.writestr("miso-local-agent/README.md", """# MISO Local Integration Agent

This bridge polls the Web Data Agent for signed, secret-free instructions. It
never receives or writes the MISO subscription key. Configure the values in
`.env.example` in your local environment, then run:

```bash
python agent.py --apply
```

Use `--once --apply` to process one handoff. Review each generated package
before moving it into a production backend.
""")
        response = HttpResponse(archive.getvalue(), content_type="application/zip")
        response["Content-Disposition"] = 'attachment; filename="miso-local-integration-agent.zip"'
        return response


class ConnectionTestView(LocalAPIView):
    def post(self, request):
        return Response(connection_test())


class SubscriptionStatusView(LocalAPIView):
    def get(self, request):
        return Response({
            "configured": has_subscription_key(),
            "reference": "MISO_SUBSCRIPTION_KEY" if has_subscription_key() else None,
            "portal_url": PORTAL_URL,
            "message": "The key itself is never returned. Create or manage it in the MISO Data Exchange portal, then set it in backend/.env.",
        })


class EndpointsView(LocalAPIView):
    def get(self, request):
        return Response({"endpoints": endpoints()})


class EndpointDetailView(LocalAPIView):
    def get(self, request, endpoint_id):
        operation = endpoint(endpoint_id)
        if not operation:
            return Response({"detail": "endpoint not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(operation)


class RequestHistoryView(LocalAPIView):
    def get(self, request):
        rows = APIRequest.objects.order_by("-created_at")[:50]
        return Response({"requests": [{"id": item.id, "source_id": item.source_id, "method": item.method, "url": item.url, "parameters": item.parameters, "mode": item.mode, "status_code": item.status_code, "created_at": item.created_at} for item in rows]})


class RequestDetailView(LocalAPIView):
    def get(self, request, request_id):
        try:
            item = APIRequest.objects.get(id=request_id)
        except APIRequest.DoesNotExist:
            return Response({"detail": "request not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"id": item.id, "source_id": item.source_id, "method": item.method, "url": item.url, "parameters": item.parameters, "mode": item.mode, "status_code": item.status_code, "response": item.response.body if hasattr(item, "response") else None})


class ErrorListView(LocalAPIView):
    def get(self, request):
        rows = APIError.objects.order_by("-created_at")[:50]
        return Response({"errors": [{"id": item.id, "status_code": item.status_code, "category": item.category, "message": item.message, "created_at": item.created_at} for item in rows]})


class ErrorDetailView(LocalAPIView):
    def get(self, request, error_id):
        try:
            item = APIError.objects.get(id=error_id)
        except APIError.DoesNotExist:
            return Response({"detail": "error not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"id": item.id, "status_code": item.status_code, "category": item.category, "message": item.message, "details": item.details, "troubleshooting": {"diagnosis": item.troubleshooting.diagnosis, "suggested_fix": item.troubleshooting.suggested_fix, "can_retry": item.troubleshooting.can_retry} if hasattr(item, "troubleshooting") else None})


class TroubleshootView(LocalAPIView):
    def post(self, request):
        code = request.data.get("status_code")
        try:
            code = int(code)
        except (TypeError, ValueError):
            return Response({"detail": "status_code must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(diagnose(code, request.data.get("body"), request.data.get("request")))


class ErrorSimulationView(LocalAPIView):
    def post(self, request):
        code = request.data.get("status_code", 505)
        try:
            code = int(code)
        except (TypeError, ValueError):
            return Response({"detail": "status_code must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        params = request.data.get("parameters") or {"date": "2026-09-08"}
        return Response(run_endpoint(request.data.get("endpoint_id", "actual_load"), params, mode="simulation", force_status=code))


class CanvasValidateView(LocalAPIView):
    def post(self, request):
        operation = endpoint(request.data.get("endpoint_id"))
        if not operation:
            return Response({"detail": "endpoint not found"}, status=status.HTTP_404_NOT_FOUND)
        parameters = request.data.get("parameters") or {}
        issues = validate(operation, parameters)
        return Response({"valid": not issues, "issues": issues, "request_preview": build(operation, parameters)})
