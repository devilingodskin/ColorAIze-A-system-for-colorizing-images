#!/bin/bash

# Start script for Image Colorizer AI

set -e

echo "🚀 Starting Image Colorizer AI..."

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
    echo "📦 Setting up backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    echo "🔧 Installing DeOldify..."
    if [ -f "install_deoldify_fixed.sh" ]; then
        chmod +x install_deoldify_fixed.sh
        ./install_deoldify_fixed.sh
    else
        echo "⚠️  install_deoldify_fixed.sh not found, installing manually..."
        pip install "fastai==1.0.61" --no-deps
        pip install bottleneck beautifulsoup4 numexpr opencv-python-headless scikit-image ffmpeg-python yt-dlp ipython
        DEOLDIFY_DIR="$(pwd)/../deoldify_repo"
        if [ ! -d "$DEOLDIFY_DIR" ]; then
            git clone --depth 1 https://github.com/jantic/DeOldify.git "$DEOLDIFY_DIR"
        fi
        cd "$DEOLDIFY_DIR"
        pip install --no-deps -e .
        cd ../backend
    fi
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if model exists
if [ ! -f "ml/models/ColorizeStable_gen.pth" ] && [ ! -f "ml/models/ColorizeArtistic_gen.pth" ]; then
    echo "⚠️  Model not found. Please download it:"
    echo "   python ml/scripts/download_model.py ColorizeStable_gen"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start backend in background
echo "🔧 Starting backend..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ Stopped"
    exit 0
}

# Wait for user interrupt
trap cleanup INT TERM
wait

