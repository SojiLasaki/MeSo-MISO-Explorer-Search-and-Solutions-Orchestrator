from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.HealthView.as_view()),
    path("chat/", views.ChatView.as_view()),
    path("agent/sessions/", views.AgentSessionListView.as_view()),
    path("agent/sessions/<str:session_id>/", views.AgentSessionDetailView.as_view()),
    path("agent/resolve/", views.ResolveView.as_view()),
    path("agent/execute/", views.ExecuteView.as_view()),
    path("agent/handoffs/", views.HandoffView.as_view()),
    path("agent/handoffs/<uuid:handoff_id>/", views.HandoffStatusView.as_view()),
    path("local-agent/poll/", views.LocalAgentPollView.as_view()),
    path("local-agent/ack/", views.LocalAgentAckView.as_view()),
    path("local-agent/download/", views.LocalAgentDownloadView.as_view()),
    path("miso/request/", views.ExecuteView.as_view()),
    path("miso/test-connection/", views.ConnectionTestView.as_view()),
    path("miso/subscription-key/", views.SubscriptionStatusView.as_view()),
    path("miso/endpoints/", views.EndpointsView.as_view()),
    path("miso/endpoints/<str:endpoint_id>/", views.EndpointDetailView.as_view()),
    path("requests/", views.RequestHistoryView.as_view()),
    path("requests/<int:request_id>/", views.RequestDetailView.as_view()),
    path("errors/", views.ErrorListView.as_view()),
    path("errors/<int:error_id>/", views.ErrorDetailView.as_view()),
    path("errors/troubleshoot/", views.TroubleshootView.as_view()),
    path("errors/simulate/", views.ErrorSimulationView.as_view()),
    path("canvas/validate/", views.CanvasValidateView.as_view()),
    path("canvas/execute/", views.ExecuteView.as_view()),
]
