#!/bin/bash

# Скрипт для запуска приложения в Docker

set -e

echo "🚀 Запуск Image Colorizer AI в Docker..."
echo ""

# Проверка, запущен ли Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon не запущен!"
    echo "   Пожалуйста, запустите Docker Desktop или Docker daemon"
    exit 1
fi

# Проверка наличия модели (опционально)
if [ ! -f "ml/models/ColorAize_weights.pth" ] && [ ! -f "ml/models/ColorizeArtistic_gen.pth" ]; then
    echo "⚠️  Модель DeOldify не найдена в ml/models/"
    echo "   Приложение будет работать, но раскрашивание будет недоступно"
    echo "   Модель будет скопирована в контейнер из локальной папки ml/models/"
    echo ""
fi

# Сборка и запуск
echo "📦 Сборка Docker образов..."
docker-compose build

echo ""
echo "🚀 Запуск контейнеров..."
docker-compose up -d

echo ""
echo "✅ Приложение запущено!"
echo ""
echo "📝 Полезные команды:"
echo "   - Просмотр логов: docker-compose logs -f"
echo "   - Остановка: docker-compose down"
echo "   - Перезапуск: docker-compose restart"
echo ""
echo "🌐 Приложение доступно по адресу: http://localhost:8000"
echo ""

# Показать логи
docker-compose logs -f
