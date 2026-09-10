from django.test import TestCase
from rest_framework.test import APIClient
from datetime import date, timedelta

from .services.errors import diagnose
from .services.request_builder import build, validate
from .services.resolver import resolve
from .services.handoff import verify
from .models import LocalAgentHandoff


class ParameterResolutionTests(TestCase):
    def test_actual_load_yesterday(self):
        result = resolve("actual load yesterday", today=date(2026, 9, 9))
        self.assertEqual(result["endpoint"]["id"], "actual_load")
        self.assertEqual(result["parameters"]["date"], "2026-09-08")
        self.assertEqual(result["missing"], [])

    def test_hourly_north_maps_to_official_values(self):
        result = resolve("hourly load for North yesterday", today=date(2026, 9, 9))
        self.assertEqual(result["parameters"]["region"], "NORTH")
        self.assertEqual(result["parameters"]["geoResolution"], "region")
        self.assertEqual(result["parameters"]["timeResolution"], "hourly")

    def test_incomplete_request_asks_for_date(self):
        result = resolve("I need actual load")
        self.assertEqual([item["name"] for item in result["missing"]], ["date"])

    def test_request_builder_keeps_key_out_of_url(self):
        result = resolve("actual load yesterday", today=date(2026, 9, 9))
        request = build(result["endpoint"], result["parameters"])
        self.assertIn("/lgi/v1/real-time/2026-09-08/demand/actual", request["url"])
        self.assertNotIn("subscription-key", request["url"])

    def test_invalid_region_is_reported(self):
        result = resolve("actual load yesterday", today=date(2026, 9, 9))
        errors = validate(result["endpoint"], {**result["parameters"], "region": "NORTH AMERICA"})
        self.assertEqual(errors[0]["parameter"], "region")


class TroubleshootingTests(TestCase):
    def test_505_has_protocol_specific_diagnosis(self):
        advice = diagnose(505, request={"method": "GET", "url": "https://example.test"})
        self.assertEqual(advice["category"], "http_version")
        self.assertFalse(advice["can_retry"])
        self.assertIn("HTTP/2", advice["suggested_fix"])

    def test_every_supported_http_error_has_safe_diagnosis(self):
        for status in (400, 401, 403, 404, 405, 408, 409, 429, 500, 501, 502, 503, 504, 505):
            with self.subTest(status=status):
                advice = diagnose(status)
                self.assertEqual(advice["status_code"], status)
                self.assertTrue(advice["category"])
                self.assertTrue(advice["suggested_fix"])


class ApiFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_chat_simulation_returns_explicit_label(self):
        response = self.client.post("/api/chat/", {"question": "actual load yesterday", "mode": "simulation"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertTrue(response.data["simulated"])
        self.assertEqual(response.data["verification"]["source"], "Development simulation")

    def test_follow_up_reuses_the_same_agent_context(self):
        first = self.client.post("/api/chat/", {"question": "I need actual load", "mode": "simulation"}, format="json")
        self.assertEqual(first.data["status"], "needs_input")
        self.assertEqual(first.data["missing_parameters"][0]["name"], "date")

        second = self.client.post("/api/chat/", {"question": "Yesterday.", "session_id": first.data["session_id"], "mode": "simulation"}, format="json")
        self.assertEqual(second.data["status"], "success")
        self.assertEqual(second.data["endpoint"]["id"], "actual_load")
        self.assertIn("date", second.data["parameters"])

    def test_chat_sessions_are_listed_and_reopenable(self):
        created = self.client.post("/api/chat/", {"question": "actual load yesterday", "mode": "simulation"}, format="json")
        session_id = created.data["session_id"]

        listing = self.client.get("/api/agent/sessions/")
        self.assertEqual(listing.status_code, 200)
        self.assertTrue(any(row["session_id"] == session_id for row in listing.data["sessions"]))

        detail = self.client.get(f"/api/agent/sessions/{session_id}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["session"]["session_id"], session_id)
        self.assertEqual([message["role"] for message in detail.data["messages"]], ["user", "assistant"])

    def test_505_simulation_is_persisted_and_diagnosed(self):
        response = self.client.post("/api/errors/simulate/", {"status_code": 505, "parameters": {"date": "2026-09-08"}}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["error"]["category"], "http_version")
        self.assertFalse(response.data["error"]["can_retry"])
        handoff = LocalAgentHandoff.objects.get(id=response.data["handoff"]["id"])
        self.assertTrue(verify(handoff.payload, handoff.signature))
        self.assertEqual(handoff.payload["purpose"], "error_resolution")
        self.assertEqual(handoff.payload["troubleshooting"]["status_code"], 505)

    def test_api_request_is_preview_not_data_execution(self):
        response = self.client.post("/api/chat/", {"question": "Give me the API for actual load yesterday.", "mode": "simulation"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["api_only"])
        self.assertNotIn("data", response.data)
        self.assertNotIn("handoff", response.data)
        self.assertEqual(response.data["delivery"]["target"], "web_data_agent")
        self.assertIn("has not been executed", response.data["message"])

    def test_selected_web_api_stays_pinned_to_its_catalog_operation(self):
        response = self.client.post(
            "/api/chat/",
            {
                "question": "Show the data for yesterday.",
                "selected_source_id": "get-v1-real-time-date-lmp-expost",
                "mode": "simulation",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["endpoint"]["id"], "realtime_lmp")
        self.assertEqual(response.data["parameters"]["date"], str(date.today() - timedelta(days=1)))

    def test_unenabled_selected_api_is_not_silently_substituted(self):
        response = self.client.post(
            "/api/chat/",
            {
                "question": "Show this API's data for yesterday.",
                "selected_source_id": "get-v1-real-time-date-lmp-exante",
                "mode": "simulation",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "needs_input")
        self.assertIn("will not substitute", response.data["message"])
        self.assertNotIn("endpoint", response.data)

    def test_external_user_scenarios_route_to_supported_data_or_safe_scope(self):
        cases = {
            "Show real-time binding constraints yesterday.": "binding_constraints",
            "Give me a load forecast for today.": "load_forecast",
            "Show real-time generation fuel mix yesterday.": "realtime_generation_fuel_type",
            "What are the outage forecasts for today?": "outage_forecast",
        }
        for question, expected in cases.items():
            with self.subTest(question=question):
                response = self.client.post("/api/chat/", {"question": question, "mode": "simulation"}, format="json")
                self.assertEqual(response.data["status"], "success")
                self.assertEqual(response.data["endpoint"]["id"], expected)

        operational = self.client.post("/api/chat/", {"question": "I need ICCP telemetry for my EMS.", "mode": "simulation"}, format="json")
        self.assertEqual(operational.data["status"], "success")
        self.assertIn("operational-tool", operational.data["message"])

    def test_report_and_integration_paths_do_not_make_unrelated_data_call(self):
        report = self.client.post("/api/chat/", {"question": "Find the older real-time pricing report.", "mode": "simulation"}, format="json")
        self.assertEqual(report.data["status"], "success")
        self.assertIn("report", report.data)
        self.assertNotIn("data", report.data)

        integration = self.client.post("/api/chat/", {"question": "How do I connect MISO actual load to my Postgres backend?", "mode": "simulation"}, format="json")
        self.assertEqual(integration.data["status"], "needs_input")
        self.assertEqual(integration.data["delivery"]["target"], "local_integration_agent")
        self.assertNotIn("handoff", integration.data)

        completed = self.client.post("/api/chat/", {"question": "Yesterday.", "session_id": integration.data["session_id"], "mode": "simulation"}, format="json")
        self.assertEqual(completed.data["status"], "success")
        self.assertTrue(completed.data["integration_guidance"])
        self.assertEqual(completed.data["delivery"]["target"], "local_integration_agent")
        integration = completed
        self.assertNotIn("data", integration.data)
        handoff = LocalAgentHandoff.objects.get(id=integration.data["handoff"]["id"])
        self.assertTrue(verify(handoff.payload, handoff.signature))

        new_online_request = self.client.post("/api/chat/", {"question": "What was actual load today?", "session_id": integration.data["session_id"], "mode": "simulation"}, format="json")
        self.assertEqual(new_online_request.data["status"], "success")
        self.assertEqual(new_online_request.data["delivery"]["target"], "web_data_agent")
        self.assertNotIn("handoff", new_online_request.data)

    def test_only_local_implementation_work_is_handed_off_and_requires_agent_token(self):
        online = self.client.post("/api/chat/", {"question": "actual load yesterday", "mode": "simulation"}, format="json")
        self.assertEqual(online.data["delivery"]["target"], "web_data_agent")
        self.assertNotIn("handoff", online.data)

        response = self.client.post("/api/chat/", {"question": "Add actual load yesterday to my backend", "mode": "simulation"}, format="json")
        self.assertEqual(response.data["status"], "success")
        handoff_id = response.data["handoff"]["id"]

        forbidden = self.client.get("/api/local-agent/poll/")
        self.assertEqual(forbidden.status_code, 403)
        polled = self.client.get("/api/local-agent/poll/", HTTP_X_LOCAL_AGENT_TOKEN="development-local-agent-token")
        self.assertEqual(polled.status_code, 200)
        self.assertEqual(polled.data["handoff"]["id"], handoff_id)
        self.assertTrue(verify(polled.data["handoff"]["payload"], polled.data["handoff"]["signature"]))

    def test_local_agent_download_contains_only_bridge_files(self):
        response = self.client.get("/api/local-agent/download/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/zip")
        self.assertIn("miso-local-integration-agent.zip", response["Content-Disposition"])


class PublicFuelMixTests(TestCase):
    def test_health_reports_public_without_subscription_key(self):
        response = APIClient().get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["miso_mode"], "public")

    def test_public_fuel_mix_request_targets_anonymous_host(self):
        from .services.catalog import endpoint
        from .services.request_builder import build

        operation = endpoint("realtime_generation_fuel_type")
        request = build(operation, {}, prefer_public=True)
        self.assertEqual(request["url"], "https://public-api.misoenergy.org/api/FuelMix")
        self.assertEqual(request["source"], "public")
        self.assertNotIn("Ocp-Apim-Subscription-Key", request["headers"])

    def test_normalize_public_fuel_mix_rows(self):
        from .services.miso_client import normalize_public_fuel_mix

        payload = {
            "RefId": "10-Sep-2026 - Interval 10:25 EST",
            "TotalMW": "90140",
            "Fuel": {
                "Type": [
                    {"INTERVALEST": "2026-09-10 10:25:00 AM", "CATEGORY": "Coal", "ACT": "30866", "FUEL_CATEGORY": "Coal  (30,866 MW)"},
                    {"INTERVALEST": "2026-09-10 10:25:00 AM", "CATEGORY": "Wind", "ACT": "1323", "FUEL_CATEGORY": "Wind  (1,323 MW)"},
                ]
            },
        }
        normalized = normalize_public_fuel_mix(payload, {})
        self.assertFalse(normalized["simulated"])
        self.assertEqual(normalized["source"], "MISO Public API")
        self.assertEqual(len(normalized["data"]), 2)
        self.assertEqual(normalized["data"][0]["fuelType"], "Coal")
        self.assertEqual(normalized["data"][0]["value"], 30866.0)
