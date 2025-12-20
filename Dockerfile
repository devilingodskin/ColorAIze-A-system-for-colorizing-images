# Multi-stage build for Image Colorizer AI

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY package.json package-lock.json* ./
RUN npm ci

COPY frontend/ ./frontend/
COPY vite.config.ts tailwind.config.ts tsconfig.json ./

# Build frontend
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy ML models directory (if exists)
COPY ml/ ./ml/

# Copy DeOldify repo (if exists)
COPY deoldify_repo/ ./deoldify_repo/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create directories
RUN mkdir -p storage/uploads storage/processed ml/models ml/dummy

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8000

# Run backend (which will serve frontend static files)
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

