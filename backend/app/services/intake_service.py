import csv
import json
import re
import zipfile
from io import BytesIO, StringIO
from typing import Any

from app.services.ai_features import rewrite_resume
from app.utils.files import extract_text_from_upload


def empty_candidate(name: str, email: str) -> dict[str, Any]:
    return {"name": name or "Unknown", "email": email or "candidate@import.local", "skills": [], "experience_years": 0, "education": [], "projects": [], "parsed_text": ""}


def extract_name_and_email(text: str) -> tuple[str, str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = (lines[0] if lines else "Unknown")[:255]
    match = re.search(r"[\w.+-]+@[\w.-]+\.\w+", text)
    email = match.group(0)[:255] if match else "unknown@uploaded.local"
    return name, email


def process_csv_buffer(content: bytes) -> list[dict[str, Any]]:
    rows = csv.DictReader(StringIO(content.decode("utf-8-sig")))
    candidates = []
    for row in rows:
        name = (row.get("name") or row.get("full_name") or row.get("Name") or row.get("Full Name") or "Unknown").strip()[:255]
        email = (row.get("email") or row.get("Email") or "candidate@import.local").strip()[:255]
        skills_raw = row.get("skills") or row.get("Skills") or ""
        projects = []
        try:
            if row.get("projects") or row.get("Projects"):
                projects = json.loads(row.get("projects") or row.get("Projects") or "[]")
        except json.JSONDecodeError:
            projects = []
        candidates.append({
            "name": name,
            "email": email,
            "skills": [s.strip() for s in re.split(r"[,;|]", skills_raw) if s.strip()],
            "experience_years": int(row.get("experience_years") or row.get("experience") or row.get("Years of Experience") or 0),
            "education": [s.strip() for s in re.split(r"[,;]", row.get("education") or row.get("Education") or "") if s.strip()],
            "projects": projects,
            "parsed_text": "",
        })
    return candidates


async def process_resume_buffer(content: bytes, filename: str) -> list[dict[str, Any]]:
    text = extract_text_from_upload(filename, content)
    if len(text) < 20:
        return []
    name, email = extract_name_and_email(text)
    candidate = empty_candidate(name, email)
    candidate["parsed_text"] = text
    parsed = await rewrite_resume(text)
    if parsed:
        candidate["skills"] = parsed.get("technicalSkills", [])
        candidate["projects"] = parsed.get("projects", [])
        candidate["education"] = parsed.get("education", [])
    return [candidate]


async def process_zip_buffer(content: bytes) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    with zipfile.ZipFile(BytesIO(content)) as archive:
        for name in archive.namelist():
            if name.endswith("/"):
                continue
            data = archive.read(name)
            lower = name.lower()
            if lower.endswith(".csv"):
                candidates.extend(process_csv_buffer(data))
            elif lower.endswith((".pdf", ".docx", ".doc")):
                candidates.extend(await process_resume_buffer(data, name))
    return candidates


async def process_file(content: bytes, filename: str) -> dict[str, Any]:
    lower = filename.lower()
    try:
        if lower.endswith(".csv"):
            return {"candidates": process_csv_buffer(content)}
        if lower.endswith(".zip"):
            return {"candidates": await process_zip_buffer(content)}
        if lower.endswith((".pdf", ".docx", ".doc")):
            return {"candidates": await process_resume_buffer(content, filename)}
        return {"candidates": [], "error": f"Unsupported type: {filename}"}
    except Exception as exc:
        return {"candidates": [], "error": str(exc)}
