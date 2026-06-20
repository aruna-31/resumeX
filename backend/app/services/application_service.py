from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.application import Application
from app.models.enums import ApplicationStatus
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.services.ai_features import predict_job_match


async def create_application(db: Session, user: User, job_id: UUID, resume_id: UUID) -> Application:
    existing = db.query(Application).filter(Application.job_id == job_id, Application.candidate_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail={"error": "already_applied", "message": "You have already applied to this job."})
    job = db.get(Job, job_id)
    resume = db.get(Resume, resume_id)
    if not job:
        raise HTTPException(status_code=404, detail={"error": "job_not_found"})
    if not resume or resume.userId != user.id:
        raise HTTPException(status_code=400, detail={"error": "resume_not_found"})

    match_score = 0
    ai_explanation = ""
    if get_settings().ai_enabled:
        analysis = await predict_job_match(resume.content, job, db=db, user_id=str(user.id))
        match_score = analysis.get("overallMatch", 0) if analysis else 0
        ai_explanation = analysis.get("recommendation", "") if analysis else ""

    application = Application(job_id=job_id, candidate_id=user.id, resume_url=str(resume_id), parsed_data=resume.content, match_score=match_score, ai_explanation=ai_explanation, status=ApplicationStatus.APPLIED)
    db.add(application)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail={"error": "already_applied", "message": "You have already applied to this job."})
    db.refresh(application)
    return application
