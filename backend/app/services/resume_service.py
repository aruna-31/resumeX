from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.resume import Resume, ResumeVersion
from app.models.user import User
from app.schemas.resume import ResumeSave


def save_resume(db: Session, user: User, payload: ResumeSave, resume_id: UUID | None = None) -> Resume:
    target_id = resume_id or payload.id
    resume = None
    if target_id:
        resume = db.query(Resume).filter(Resume.id == target_id, Resume.userId == user.id).first()
        if resume:
            resume.name = payload.name or resume.name
            resume.templateId = payload.templateId or resume.templateId
            resume.content = payload.content
    if not resume:
        resume = Resume(userId=user.id, name=payload.name or "Untitled Resume", templateId=payload.templateId or "professional", content=payload.content)
        db.add(resume)
        db.flush()
    if not payload.autoSave:
        db.add(ResumeVersion(resumeId=resume.id, content=payload.content, changeSummary=f"Manual save: {datetime.now().isoformat(timespec='seconds')}"))
    db.commit()
    db.refresh(resume)
    return resume


def get_owned_resume(db: Session, user: User, resume_id: UUID) -> Resume:
    resume = db.get(Resume, resume_id)
    if not resume or resume.userId != user.id:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    return resume
