"""
FastAPI application for image colorization.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import base64
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

from .database import get_db, init_db
from .models import Image, ImageStatus
from .colorizer import get_colorizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Image Colorizer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for async colorization
executor = ThreadPoolExecutor(max_workers=2)


@app.on_event("startup")
async def startup_event():
    """Initialize database and colorizer on startup."""
    init_db()
    logger.info("Database initialized")
    
    # Try to initialize colorizer (will fail gracefully if DeOldify not available)
    try:
        get_colorizer()
        logger.info("Colorizer initialized")
    except Exception as e:
        logger.warning(f"Colorizer initialization failed: {e}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Image Colorizer API", "status": "running"}


@app.get("/api/images")
async def list_images(db: Session = Depends(get_db)):
    """Get all images."""
    images = db.query(Image).order_by(Image.created_at.desc()).all()
    return [
        {
            "id": img.id,
            "originalUrl": img.original_url,
            "colorizedUrl": img.colorized_url,
            "status": img.status.value,
            "errorMessage": img.error_message,
            "createdAt": img.created_at.isoformat(),
        }
        for img in images
    ]


@app.get("/api/images/{image_id}")
async def get_image(image_id: int, db: Session = Depends(get_db)):
    """Get a single image by ID."""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {
        "id": image.id,
        "originalUrl": image.original_url,
        "colorizedUrl": image.colorized_url,
        "status": image.status.value,
        "errorMessage": image.error_message,
        "createdAt": image.created_at.isoformat(),
    }


@app.post("/api/images")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and colorize an image."""
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Convert to base64 data URL
        base64_data = base64.b64encode(file_content).decode("utf-8")
        original_url = f"data:{file.content_type};base64,{base64_data}"
        
        # Create database record
        db_image = Image(
            original_url=original_url,
            status=ImageStatus.PROCESSING
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        # Process image asynchronously
        asyncio.create_task(process_image_async(db_image.id, file_content, file.content_type))
        
        return {
            "id": db_image.id,
            "originalUrl": db_image.original_url,
            "colorizedUrl": db_image.colorized_url,
            "status": db_image.status.value,
            "errorMessage": db_image.error_message,
            "createdAt": db_image.created_at.isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


async def process_image_async(image_id: int, image_data: bytes, mime_type: str):
    """Process image colorization asynchronously."""
    from .database import SessionLocal
    db = SessionLocal()
    try:
        # Update status to processing
        image = db.query(Image).filter(Image.id == image_id).first()
        if not image:
            logger.error(f"Image {image_id} not found")
            return
        
        image.status = ImageStatus.PROCESSING
        db.commit()
        
        # Run colorization in thread pool (blocking operation)
        loop = asyncio.get_event_loop()
        colorizer = get_colorizer()
        
        # Extract base64 from data URL
        original_base64 = image.original_url
        if original_base64.startswith("data:"):
            original_base64 = original_base64.split(",", 1)[1]
        
        colorized_data_url = await loop.run_in_executor(
            executor,
            colorizer.colorize_from_base64,
            original_base64,
            mime_type
        )
        
        # Update database with result
        image.colorized_url = colorized_data_url
        image.status = ImageStatus.COMPLETED
        db.commit()
        
        logger.info(f"Image {image_id} colorized successfully")
        
    except Exception as e:
        logger.error(f"Colorization failed for image {image_id}: {e}")
        # Update database with error
        image = db.query(Image).filter(Image.id == image_id).first()
        if image:
            image.status = ImageStatus.FAILED
            image.error_message = str(e)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

