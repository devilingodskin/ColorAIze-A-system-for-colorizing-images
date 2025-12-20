#!/bin/bash

# Deployment script for Image Colorizer AI

set -e

echo "🚀 Начало деплоя Image Colorizer AI..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Не запускайте скрипт от root. Используйте sudo для отдельных команд."
   exit 1
fi

# Install system dependencies
echo "📦 Установка системных зависимостей..."
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3-pip nginx git curl

# Create app directory
APP_DIR="/opt/image-colorizer-ai"
echo "📁 Создание директории приложения: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy files
echo "📋 Копирование файлов..."
cp -r . $APP_DIR/
cd $APP_DIR

# Setup Python virtual environment
echo "🐍 Настройка Python окружения..."
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# Install DeOldify
echo "🎨 Установка DeOldify..."
cd backend
bash install_deoldify_fixed.sh
cd ..

# Setup frontend
echo "⚛️  Настройка Frontend..."
npm install
npm run build

# Create systemd service
echo "⚙️  Создание systemd сервиса..."
sudo tee /etc/systemd/system/image-colorizer.service > /dev/null <<EOF
[Unit]
Description=Image Colorizer AI Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/venv/bin"
Environment="PORT=8000"
Environment="HOST=0.0.0.0"
ExecStart=$APP_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Setup nginx
echo "🌐 Настройка Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/image-colorizer
sudo ln -sf /etc/nginx/sites-available/image-colorizer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Start service
echo "▶️  Запуск сервиса..."
sudo systemctl daemon-reload
sudo systemctl enable image-colorizer
sudo systemctl start image-colorizer

# Check status
echo "✅ Проверка статуса..."
sleep 2
sudo systemctl status image-colorizer --no-pager

echo ""
echo "🎉 Деплой завершен!"
echo "📝 Проверьте логи: sudo journalctl -u image-colorizer -f"
echo "🌐 Откройте в браузере: http://$(hostname -I | awk '{print $1}')"

