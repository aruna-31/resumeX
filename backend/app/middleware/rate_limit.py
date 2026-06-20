import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class InMemoryRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int, window_seconds: int, path_prefix: str = "/api"):
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds
        self.path_prefix = path_prefix
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        if request.url.path.startswith(self.path_prefix):
            client = request.client.host if request.client else "unknown"
            key = f"{client}:{self.path_prefix}"
            now = time.time()
            bucket = self.requests[key]
            while bucket and now - bucket[0] > self.window_seconds:
                bucket.popleft()
            if len(bucket) >= self.limit:
                return Response(
                    content='{"error":"rate_limited","message":"Too many requests. Please try again later."}',
                    media_type="application/json",
                    status_code=429,
                )
            bucket.append(now)
        return await call_next(request)
