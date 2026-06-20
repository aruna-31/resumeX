from uuid import UUID

from pydantic import BaseModel

from app.models.enums import JobStatus
from app.schemas.common import JsonDict, ORMModel, TimestampMixin


class JobCreate(BaseModel):
    title: str
    description: str = ""
    requiredSkills: list[str] = []
    minExp: int = 0
    location: str | None = None
    salary: str | None = None


class JobOut(ORMModel, TimestampMixin):
    id: UUID
    hr_id: UUID
    ats_job_id: str
    title: str
    description: str
    requirements: JsonDict
    status: JobStatus
    location: str | None = None


class JobResponse(BaseModel):
    success: bool = True
    job: JobOut


class JobsResponse(BaseModel):
    success: bool = True
    jobs: list[JobOut]
