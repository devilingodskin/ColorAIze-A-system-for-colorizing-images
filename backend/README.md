# Image Colorizer Backend

FastAPI backend для раскрашивания черно-белых изображений с использованием DeOldify.

## Установка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

Или используйте Poetry:
```bash
poetry install
```

2. Загрузите модель DeOldify:
```bash
python ../ml/scripts/download_model.py
```

Или установите переменную окружения:
```bash
export DEOLDIFY_MODEL_PATH=/path/to/ColorizeArtistic_gen.pth
```

## Запуск

### Development режим:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Или используя Poetry:
```bash
poetry run start
```

### Production режим:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Переменные окружения

- `DATABASE_URL` - URL базы данных (по умолчанию: SQLite `sqlite:///./colorizer.db`)
- `DEOLDIFY_MODEL_PATH` - Путь к весам модели DeOldify
- `PORT` - Порт для запуска сервера (по умолчанию: 8000)

## API Endpoints

- `GET /` - Health check
- `GET /api/images` - Список всех изображений
- `GET /api/images/{id}` - Получить изображение по ID
- `POST /api/images` - Загрузить и раскрасить изображение

## Структура

- `app/main.py` - FastAPI приложение и эндпоинты
- `app/models.py` - Модели базы данных
- `app/database.py` - Конфигурация базы данных
- `app/colorizer.py` - Логика раскрашивания с DeOldify
- `storage/` - Хранилище файлов (uploads/, processed/)

