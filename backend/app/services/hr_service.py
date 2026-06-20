import csv
import json
from io import StringIO
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.enums import ApplicationStatus, UserRole
from app.models.job import Job
from app.models.user import User
from app.services.ai_features import rank_candidates, rewrite_resume
from app.utils.files import extract_text_from_upload


async def screen_candidates(db: Session, user: User, body: dict[str, Any], files: list[tuple[str, bytes]]) -> dict:
    job = Job(
        hr_id=user.id,
        ats_job_id=f"JOB-{__import__('time').time_ns() // 1_000_000}",
        title=body.get("jobRole") or "New Screening Job",
        description=body.get("jobDescription") or "",
        requirements={"skills": body.get("requiredSkills") or [], "minExp": int(body.get("experienceRequired") or 0)},
    )
    db.add(job)
    db.flush()

    candidates = []
    for filename, content in files:
        text = extract_text_from_upload(filename, content)
        if not text:
            continue
        structured = await rewrite_resume(text, db=db, user_id=str(user.id))
        if not structured:
            continue
        app = Application(job_id=job.id, candidate_id=user.id, resume_url="uploaded", parsed_data=structured, match_score=0, status=ApplicationStatus.APPLIED)
        db.add(app)
        db.flush()
        candidates.append({"name": structured.get("name") or filename, "id": str(app.id), "resume": structured})

    raw_candidates = body.get("candidates") or []
    if isinstance(raw_candidates, str):
        raw_candidates = json.loads(raw_candidates or "[]")
    for candidate in raw_candidates if isinstance(raw_candidates, list) else []:
        parsed = candidate.get("resume", candidate)
        app = Application(job_id=job.id, candidate_id=user.id, resume_url="imported", parsed_data=parsed, match_score=0, status=ApplicationStatus.APPLIED)
        db.add(app)
        db.flush()
        candidates.append({"name": candidate.get("name") or "Imported Candidate", "id": str(app.id), "resume": parsed})

    if not candidates:
        db.rollback()
        raise HTTPException(status_code=400, detail={"error": "no_candidates", "message": "No valid resumes to screen."})

    ranking = await rank_candidates(job.title, job.description, candidates, db=db, user_id=str(user.id))
    if ranking:
        by_id = {str(item.get("candidateId")): item for item in ranking.get("rankedCandidates", [])}
        for app_id, item in by_id.items():
            app = db.get(Application, app_id)
            if app:
                app.match_score = item.get("overallScore", 0)
                app.ai_explanation = item.get("strengthSummary", "")
    db.commit()
    return {"success": True, "jobId": job.id, "ranking": ranking}


def export_job_results(db: Session, user: User, job_id: str) -> str:
    job = db.get(Job, job_id)
    if not job or (job.hr_id != user.id and user.role != UserRole.ADMIN):
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["Name", "Score", "Status", "Explanation", "AppliedAt"])
    writer.writeheader()
    for app in db.query(Application).filter(Application.job_id == job.id).all():
        writer.writerow({
            "Name": app.parsed_data.get("name", "Unknown"),
            "Score": app.match_score,
            "Status": app.status.value,
            "Explanation": app.ai_explanation or "",
            "AppliedAt": app.createdAt.isoformat(),
        })
    return output.getvalue()


def dashboard(db: Session, user: User) -> dict:
    jobs = db.query(Job).filter(Job.hr_id == user.id).all()
    total_apps = sum(db.query(Application).filter(Application.job_id == job.id).count() for job in jobs)
    return {"success": True, "stats": {"totalJobs": len(jobs), "activeJobs": len([j for j in jobs if j.status.value == "OPEN"]), "totalApplications": total_apps}, "recentJobs": jobs[:5]}
