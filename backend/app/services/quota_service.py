import time
from dataclasses import dataclass

from app.models.enums import UserPlan

QUOTA_CONFIG = {
    UserPlan.FREE: {"limit": 5, "window_hours": 12},
    UserPlan.PREMIUM: {"limit": 50, "window_hours": 1},
    UserPlan.ENTERPRISE: {"limit": 200, "window_hours": 1},
}


@dataclass
class Usage:
    count: int
    reset_at: float


_usage_cache: dict[str, Usage] = {}


def get_user_quota(user_id: str, plan: UserPlan) -> dict:
    config = QUOTA_CONFIG.get(plan, QUOTA_CONFIG[UserPlan.FREE])
    now = time.time()
    data = _usage_cache.get(user_id)
    if not data or now >= data.reset_at:
        count = 0
        reset_at = now + config["window_hours"] * 3600
    else:
        count = data.count
        reset_at = data.reset_at
    return {
        "used": count,
        "limit": config["limit"],
        "windowHours": config["window_hours"],
        "remaining": max(0, config["limit"] - count),
        "resetAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(reset_at)),
        "percentage": round((count / config["limit"]) * 100),
    }


def consume_quota(user_id: str, plan: UserPlan) -> dict:
    config = QUOTA_CONFIG.get(plan, QUOTA_CONFIG[UserPlan.FREE])
    now = time.time()
    data = _usage_cache.get(user_id)
    if not data or now >= data.reset_at:
        data = Usage(0, now + config["window_hours"] * 3600)
    if data.count >= config["limit"]:
        return {"allowed": False, **get_user_quota(user_id, plan)}
    data.count += 1
    _usage_cache[user_id] = data
    return {"allowed": True, **get_user_quota(user_id, plan)}
