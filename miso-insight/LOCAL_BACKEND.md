# Local MISO AI backend

This project separates the web conversation service from the optional local
integration service:

~~~
Web browser
            |
            | JSON requests; no MISO key in the browser
            v
Web Data Agent (Django + Django REST Framework)
            |
            | MISO calls and signed, secret-free local-agent handoffs
            v
MISO Data Exchange API                 Local Integration Agent
                                              |
                                              v
                                      reviewable local manifests
~~~

## Start locally

In one terminal:

~~~
cd backend
cp .env.example .env
# Add MISO_SUBSCRIPTION_KEY only when you are ready for verified live calls.
python3 manage.py migrate
python3 manage.py runserver 127.0.0.1:8000
~~~

In a second terminal:

~~~
npm run dev -- --host 127.0.0.1
~~~

Open http://127.0.0.1:8081/integration-lab. In development the Web Data Agent
runs at 127.0.0.1:8000; deploy it separately for web use in production.

## Local Integration Agent

The chat agent is the Web Data Agent. The optional Local Integration Agent is
a separate outbound bridge, not a chatbot. It polls the web service, verifies
an HMAC signature, and writes a reviewable instruction manifest. It receives
an endpoint, parameters, and the credential reference
MISO_SUBSCRIPTION_KEY — never the key itself.

For a local simulation while the Web Data Agent is running:

~~~
python3 local_agent/agent.py --once
~~~

For continuous pickup:

~~~
python3 local_agent/agent.py
~~~

Before production, set matching LOCAL_AGENT_SHARED_SECRET and
LOCAL_AGENT_TOKEN values in the deployed web-agent environment and the local
agent environment. Set WEB_DATA_AGENT_URL on the local agent to the deployed
HTTPS web-agent URL.

## Operating modes

Without MISO_SUBSCRIPTION_KEY, the app defaults to **Simulation**. It produces
deterministic development rows and marks every outcome **SIMULATED RESPONSE**.
It never calls MISO or claims the data is real.

With MISO_SUBSCRIPTION_KEY configured in backend/.env, select **Live MISO** in
the local-agent workspace. Django makes the request, adds
Ocp-Apim-Subscription-Key, and returns a verification block without ever
returning the secret.

MISO owns subscription creation and account verification. Use the MISO Data
Exchange portal's Products/Subscriptions experience to create or manage a key;
then put it only in backend/.env. Do not paste it into the React application,
browser storage, request URL, or a source file.

## Agent workflow

1. The browser sends the natural-language question to POST /api/chat/ on the
   Web Data Agent.
2. The parameter resolver selects an operation from the structured backend
   catalog.
3. It maps terms such as North to NORTH, hourly to hourly, and yesterday to a
   MISO market date.
4. It asks for any missing required catalog field before an API request is
   constructed.
5. The request builder validates allowed values, builds the request, and
   redacts authentication.
6. The server runs it against MISO in live mode or produces an explicitly
   labelled development response in simulation mode.
7. A non-secret audit record is saved in SQLite, and the web frontend renders
   verification, data, and execution stages.
8. The Web Data Agent signs a secret-free instruction; the Local Integration
   Agent independently polls, verifies, and acknowledges it.

## Error Center and HTTP 505

Click **Simulate HTTP 505** in the local-agent workspace to test the full local
error path:

~~~
Request -> recorded failure -> error classification -> troubleshooting advice
        -> no-retry recommendation
~~~

The 505 analyzer identifies HTTP protocol-version incompatibility and
recommends checking local proxy/TLS configuration and removing manually set
Upgrade, Connection, or HTTP/2 headers. It will not blindly retry a 505.

## API surface

| Route | Purpose |
| --- | --- |
| POST /api/chat/ | Conversation-aware resolution and execution |
| POST /api/agent/resolve/ | Resolve intent and parameters without execution |
| POST /api/agent/execute/ | Execute a catalog endpoint with edited parameters |
| POST /api/agent/handoffs/ | Queue a signed instruction for a local agent |
| GET /api/agent/handoffs/{id}/ | Read the non-secret delivery status |
| GET /api/local-agent/poll/ | Authenticated outbound pickup by a local agent |
| POST /api/local-agent/ack/ | Authenticated signed-work acknowledgement |
| POST /api/miso/test-connection/ | Test a configured live subscription key |
| GET /api/miso/subscription-key/ | Key configuration status only; never the key |
| GET /api/miso/endpoints/ | Structured local API catalog |
| GET /api/requests/ | Non-secret request history |
| GET /api/errors/ | Captured error history |
| POST /api/errors/troubleshoot/ | Diagnose an HTTP status locally |
| POST /api/errors/simulate/ | Test an intentional failure, including 505 |
| POST /api/canvas/validate/ | Validate edited request parameters |
| POST /api/canvas/execute/ | Execute a validated canvas request |

## Tests

~~~
cd backend
python3 manage.py test
~~~

The backend test suite covers natural-language parameter extraction,
required-field pauses, official region mapping, request construction without
secret leakage, simulation labelling, and 505 diagnosis.

## Acceptance coverage

The local test pass exercises the main user paths:

- Market participants: real-time LMP data and API-only request previews.
- Transmission owners: binding constraints plus a safe ICCP/EMS scope boundary.
- Interconnection customers: medium-term load forecasts.
- Reliability data providers: real-time generation fuel type.
- Operations planners: outage forecasts.
- Technical integrators: database ingestion templates without collecting a
  database or MISO secret.
- Nontechnical users: chart requests and plain-language answers.
- Historical-report users: official report links with API-first migration
  guidance.
