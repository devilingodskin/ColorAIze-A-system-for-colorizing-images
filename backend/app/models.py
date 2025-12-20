"""
Database models for the image colorization application.
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()


class ImageStatus(str, enum.Enum):
    """Image processing status enum."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Image(Base):
    """Image model for storing image metadata."""
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String, nullable=False)  # Base64 data URL or file path
    colorized_url = Column(String, nullable=True)   # Base64 data URL or file path
    status = Column(SQLEnum(ImageStatus), default=ImageStatus.PENDING, nullable=False)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    public_token = Column(String, nullable=True, index=True)  # Secure public access token (unique via index)

