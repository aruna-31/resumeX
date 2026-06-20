from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SuccessResponse(BaseModel):
    success: bool = True


class ErrorResponse(BaseModel):
    error: str
    message: str | None = None


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, arbitrary_types_allowed=True)


class TimestampMixin(BaseModel):
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


class IdModel(ORMModel):
    id: UUID


JsonDict = dict[str, Any]
