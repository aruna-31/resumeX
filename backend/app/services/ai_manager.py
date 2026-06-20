import hashlib
import json
import logging
import time
from dataclasses import dataclass
from typing import Any, Literal, TypeVar

import google.generativeai as genai
from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)
T = TypeVar("T")
AIProvider = Literal["gemini", "groq"]


@dataclass
class AIResponse:
    success: bool
    data: Any | None
    provider: AIProvider
    model: str
    latencyMs: int
    cached: bool
    tokensEstimate: int
    costEstimateUsd: float
    error: str | None = None


_memory_cache: dict[str, tuple[float, Any]] = {}


def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def estimate_cost(tokens: int, model: str) -> float:
    rates = {"gemini-2.0-flash": 0.075, "llama-3.1-8b-instant": 0.02}
    return tokens / 1_000_000 * rates.get(model, 0.1)


def extract_json(text: str) -> Any | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    if "```" in text:
        cleaned = text.replace("```json", "```").split("```")
        for part in cleaned:
            try:
                return json.loads(part.strip())
            except json.JSONDecodeError:
                continue
    start, end = text.find("{"), text.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return None
    return None


def compress_resume_text(resume_json: Any, max_tokens: int = 1500) -> str:
    text = resume_json if isinstance(resume_json, str) else json.dumps(resume_json, default=str)
    max_chars = max_tokens * 4
    return text if len(text) <= max_chars else text[:max_chars] + "\n... [truncated for token optimization]"


def _cache_key(prompt: str) -> str:
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]


def _log_ai_usage(db: Session | None, user_id: str | None, feature: str, model: str, tokens: int, cost: float, success: bool, provider: str) -> None:
    if not db or not user_id:
        return
    try:
        db.add(AuditLog(user_id=user_id, action=f"AI_{feature}", entity_id=feature, details={"model": model, "provider": provider, "tokensUsed": tokens, "costUsd": cost, "success": success}))
        db.commit()
    except Exception:
        db.rollback()


async def call_ai(
    prompt: str,
    feature: str,
    db: Session | None = None,
    user_id: str | None = None,
    use_cache: bool = True,
    max_retries: int = 3,
    temperature: float = 0.2,
    parse_json: bool = True,
) -> AIResponse:
    settings = get_settings()
    start = time.time()
    primary_model = "gemini-2.0-flash"
    fallback_model = "llama-3.1-8b-instant"

    if not settings.ai_enabled:
        return AIResponse(False, None, "gemini", primary_model, int((time.time() - start) * 1000), False, 0, 0, "AI not configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.")

    key = _cache_key(prompt)
    if use_cache and key in _memory_cache:
        expires_at, cached = _memory_cache[key]
        if time.time() < expires_at:
            return AIResponse(True, cached, "gemini", primary_model, int((time.time() - start) * 1000), True, 0, 0)
        _memory_cache.pop(key, None)

    last_error = ""
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(primary_model, generation_config={"response_mime_type": "application/json", "temperature": temperature})
        for attempt in range(max_retries):
            try:
                result = await model.generate_content_async(prompt)
                text = result.text or ""
                data = extract_json(text) if parse_json else text
                if parse_json and data is None:
                    raise ValueError("Failed to parse JSON from Gemini")
                tokens = estimate_tokens(prompt + text)
                cost = estimate_cost(tokens, primary_model)
                if use_cache:
                    _memory_cache[key] = (time.time() + settings.ai_cache_ttl_hours * 3600, data)
                _log_ai_usage(db, user_id, feature, primary_model, tokens, cost, True, "gemini")
                return AIResponse(True, data, "gemini", primary_model, int((time.time() - start) * 1000), False, tokens, cost)
            except Exception as exc:
                last_error = str(exc)
                if attempt + 1 < max_retries:
                    time.sleep(1 + attempt)

    if settings.groq_api_key:
        try:
            client = Groq(api_key=settings.groq_api_key)
            completion = client.chat.completions.create(
                model=fallback_model,
                messages=[{"role": "system", "content": "Always respond with valid JSON."}, {"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=4096,
            )
            text = completion.choices[0].message.content or ""
            data = extract_json(text) if parse_json else text
            if parse_json and data is None:
                raise ValueError("Failed to parse JSON from Groq")
            tokens = estimate_tokens(prompt + text)
            cost = estimate_cost(tokens, fallback_model)
            if use_cache:
                _memory_cache[key] = (time.time() + settings.ai_cache_ttl_hours * 3600, data)
            _log_ai_usage(db, user_id, feature, fallback_model, tokens, cost, True, "groq")
            return AIResponse(True, data, "groq", fallback_model, int((time.time() - start) * 1000), False, tokens, cost)
        except Exception as exc:
            last_error = str(exc)

    _log_ai_usage(db, user_id, feature, primary_model, 0, 0, False, "gemini")
    logger.warning("AI call failed for %s: %s", feature, last_error)
    return AIResponse(False, None, "gemini", primary_model, int((time.time() - start) * 1000), False, 0, 0, last_error)
