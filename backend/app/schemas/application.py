from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ApplicationStatus
from app.schemas.common import ORMModel, TimestampMixin
from app.schemas.job import JobOut


class ApplyBody(BaseModel):
    jobId: UUID
    resumeId: UUID


class ApplyResumeBody(BaseModel):
    resumeId: UUID


class StatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(ORMModel, TimestampMixin):
    id: UUID
    job_id: UUID
    candidate_id: UUID
    resume_url: str
    parsed_data: dict
    match_score: int
    ai_explanation: str | None = None
    status: ApplicationStatus
    job: JobOut | None = None
