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
import secrets
import string

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_public_token() -> str:
    """Generate a secure random token for public access."""
    # Generate 32-character random token
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

# Suppress fastai and torchvision warnings (they're just deprecation warnings)
import warnings
warnings.filterwarnings("ignore", message="Your training set is empty")
warnings.filterwarnings("ignore", message="Your validation set is empty")
warnings.filterwarnings("ignore", category=UserWarning, module="fastai")
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")
warnings.filterwarnings("ignore", category=FutureWarning, module="torch")

app = FastAPI(title="Image Colorizer API", version="1.0.0")

# CORS middleware
# In production, set ALLOWED_ORIGINS environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (frontend build)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Check if frontend build exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend SPA."""
        # Don't serve API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all routes (SPA routing)
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend not found")

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
            "publicToken": img.public_token,
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
        "publicToken": image.public_token,
    }


@app.get("/api/public/{public_token}")
async def get_image_by_token(public_token: str, db: Session = Depends(get_db)):
    """Get image by public token (for sharing)."""
    image = db.query(Image).filter(Image.public_token == public_token).first()
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
        
        # Validate file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        # Create database record with secure public token
        public_token = generate_public_token()
        db_image = Image(
            original_url=original_url,
            status=ImageStatus.PENDING,  # Start with PENDING, not PROCESSING
            public_token=public_token
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        # Process image asynchronously (don't await - let it run in background)
        try:
            asyncio.create_task(process_image_async(db_image.id, file_content, file.content_type or "image/jpeg"))
        except Exception as task_error:
            logger.error(f"Failed to start processing task: {task_error}")
            # Update status to failed
            db_image.status = ImageStatus.FAILED
            db_image.error_message = f"Failed to start processing: {str(task_error)}"
            db.commit()
        
        return {
            "id": db_image.id,
            "originalUrl": db_image.original_url,
            "colorizedUrl": db_image.colorized_url,
            "status": db_image.status.value,
            "errorMessage": db_image.error_message,
            "createdAt": db_image.created_at.isoformat(),
            "publicToken": db_image.public_token,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
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
        
        # Use the image_data bytes directly (already read from file)
        colorized_data_url = await loop.run_in_executor(
            executor,
            lambda: colorizer.colorize_from_base64(
                base64.b64encode(image_data).decode("utf-8"),
                mime_type
            )
        )
        
        # Update database with result
        image.colorized_url = colorized_data_url
        image.status = ImageStatus.COMPLETED
        db.commit()
        
        logger.info(f"Image {image_id} colorized successfully")
        
    except Exception as e:
        logger.error(f"Colorization failed for image {image_id}: {e}", exc_info=True)
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

