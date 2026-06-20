from app.services.ai_features import analyze_ats_score, rewrite_resume
from app.utils.files import extract_text_from_upload


async def parse_resume_upload(filename: str, content: bytes, target_role: str | None = None) -> dict:
    raw_text = extract_text_from_upload(filename, content)
    if not raw_text or len(raw_text) < 50:
        return {"error": "parse_error", "message": "Could not extract enough text from the resume."}
    structured = await rewrite_resume(raw_text)
    if not structured:
        return {"error": "ai_error", "message": "AI failed to structure the resume text."}
    analysis = await analyze_ats_score(structured, target_role) if target_role else None
    return {
        "success": True,
        "data": {**structured, "name": filename.rsplit(".", 1)[0] or "Candidate"},
        "analysis": analysis,
        "rawTextLength": len(raw_text),
    }


async def structure_text(text: str, target_role: str | None = None) -> dict:
    if not text or len(text) < 50:
        return {"error": "validation_error", "message": "Resume text is too short."}
    structured = await rewrite_resume(text)
    if not structured:
        return {"error": "ai_error"}
    analysis = await analyze_ats_score(structured, target_role) if target_role else None
    return {"success": True, "data": structured, "analysis": analysis}
