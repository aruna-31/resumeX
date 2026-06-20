from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.schemas.common import ORMModel, TimestampMixin


class ResumeSave(BaseModel):
    id: UUID | None = None
    name: str | None = None
    templateId: str | None = None
    content: dict[str, Any]
    autoSave: bool = False


class ResumeOut(ORMModel, TimestampMixin):
    id: UUID
    userId: UUID
    name: str
    templateId: str
    content: dict[str, Any]


class ResumeVersionOut(ORMModel):
    id: UUID
    resumeId: UUID
    content: dict[str, Any]
    changeSummary: str | None = None
    createdAt: Any = None
