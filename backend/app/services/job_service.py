import time
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.enums import UserRole
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate
from app.services.ai_features import rank_candidates


def create_job(db: Session, user: User, payload: JobCreate) -> Job:
    if not payload.title:
        raise HTTPException(status_code=400, detail={"error": "validation_error", "message": "Title is required"})
    job = Job(
        hr_id=user.id,
        ats_job_id=f"JOB-{int(time.time() * 1000)}",
        title=payload.title,
        description=payload.description or "",
        requirements={"skills": payload.requiredSkills or [], "minExp": payload.minExp or 0, "location": payload.location, "salary": payload.salary},
        location=payload.location,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def list_jobs(db: Session, user: User) -> list[Job]:
    if user.role in (UserRole.HR, UserRole.ADMIN):
        return db.query(Job).filter(Job.hr_id == user.id).all()
    return db.query(Job).filter(Job.status == "OPEN").all()


def get_job_or_404(db: Session, job_id: UUID) -> Job:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    return job


def assert_job_owner(job: Job, user: User) -> None:
    if job.hr_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail={"error": "forbidden"})


async def shortlist_for_job(db: Session, user: User, job_id: UUID) -> dict:
    job = get_job_or_404(db, job_id)
    assert_job_owner(job, user)
    applications = db.query(Application).filter(Application.job_id == job.id).all()
    candidates = [{"name": app.parsed_data.get("name", "Candidate"), "id": str(app.candidate_id), "resume": app.parsed_data} for app in applications if app.parsed_data]
    if not candidates:
        return {"success": True, "ranking": None, "message": "No candidates have applied yet."}
    ranking = await rank_candidates(job.title, job.description, candidates, db=db, user_id=str(user.id))
    return {"success": True, "ranking": ranking}
