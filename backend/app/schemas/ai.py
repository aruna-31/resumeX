from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ATSScoreRequest(BaseModel):
    resumeId: UUID
    jobDescription: str | None = None


class OptimizeATSRequest(BaseModel):
    resumeId: UUID
    jobDescription: str = Field(min_length=50)


class RewriteResumeRequest(BaseModel):
    rawText: str = Field(min_length=100)


class CoverLetterRequest(BaseModel):
    resumeId: UUID
    jobTitle: str = Field(min_length=2)
    companyName: str = Field(min_length=2)
    jobDescription: str = Field(min_length=50)


class InterviewQuestionsRequest(BaseModel):
    resumeId: UUID
    roleTitle: str = Field(min_length=2)
    difficulty: Literal["Junior", "Mid", "Senior"] = "Mid"


class SkillGapRequest(BaseModel):
    resumeId: UUID
    targetRole: str = Field(min_length=2)
    jobDescription: str = Field(min_length=30)


class ResumeIdRequest(BaseModel):
    resumeId: UUID


class JobMatchRequest(BaseModel):
    resumeId: UUID
    jobId: UUID


class JobIdRequest(BaseModel):
    jobId: UUID


class AnalysisRunRequest(BaseModel):
    resumeId: UUID
    role: str


class OptimizeResumeRequest(BaseModel):
    resumeData: dict[str, Any]
    jobDescription: str


class RewriteSectionRequest(BaseModel):
    role: str | None = None
    sectionName: str
    sectionText: str
