import os


class LocalCorsMiddleware:
    """Allow local development plus explicitly configured production web origins."""
    allowed_origins = {
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://localhost:8080",
        "http://localhost:8081",
        *filter(None, (item.strip() for item in os.getenv("CORS_ALLOWED_ORIGINS", "").split(","))),
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = self.get_response(request)
        else:
            response = self.get_response(request)
        origin = request.headers.get("Origin")
        if origin in self.allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
            response["Vary"] = "Origin"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, X-Local-Session"
            # Chromium treats loopback-to-loopback requests as a private-network
            # access in some desktop configurations. This is limited by the
            # origin allow-list above and keeps the local React client usable.
            response["Access-Control-Allow-Private-Network"] = "true"
        return response
