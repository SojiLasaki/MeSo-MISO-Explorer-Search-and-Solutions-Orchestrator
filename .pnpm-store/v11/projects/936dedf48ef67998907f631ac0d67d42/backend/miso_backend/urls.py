from django.urls import include, path

urlpatterns = [path("api/", include("miso_agent.urls"))]

