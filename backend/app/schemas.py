"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import ImageStatus


class ImageResponse(BaseModel):
    """Image response schema."""
    id: int
    originalUrl: str
    colorizedUrl: Optional[str] = None
    status: str
    errorMessage: Optional[str] = None
    createdAt: str

    class Config:
        from_attributes = True


class ImageListResponse(BaseModel):
    """List of images response schema."""
    images: list[ImageResponse]

