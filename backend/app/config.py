"""
Configuration settings for the application.
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'colorizer.db'}"
)

# DeOldify model
# Default: ColorAize_weights.pth (stable model - more realistic colors)
# Alternative: ColorizeArtistic_gen.pth (artistic model - more vibrant colors)
DEOLDIFY_MODEL_PATH = os.getenv(
    "DEOLDIFY_MODEL_PATH",
    str(Path(__file__).parent.parent.parent / "ml" / "models" / "ColorAize_weights.pth")
)

# Server
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Storage
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
PROCESSED_DIR = STORAGE_DIR / "processed"

# Create storage directories if they don't exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

