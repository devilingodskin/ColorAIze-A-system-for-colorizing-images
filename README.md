# Image Colorizer AI

Приложение для раскрашивания черно-белых фотографий с использованием модели DeOldify.

## Архитектура

```
Image-Colorizer-AI/
├── backend/                    # FastAPI бэкенд
│   ├── app/                   # Основной Python пакет с логикой приложения
│   │   ├── __init__.py        # Инициализация Python пакета
│   │   ├── main.py            # FastAPI приложение и эндпоинты
│   │   ├── models.py          # Модели базы данных
│   │   ├── database.py        # Конфигурация БД
│   │   └── colorizer.py       # Логика колоризации изображений
│   ├── storage/               # Хранилище файлов
│   │   ├── uploads/           # Временные загруженные файлы
│   │   └── processed/         # Обработанные цветные изображения
│   ├── pyproject.toml         # Зависимости Poetry для бэкенда
│   └── requirements.txt       # Зависимости pip для бэкенда
├── frontend/                   # React фронтенд
│   ├── public/                # Статические файлы
│   │   └── favicon.png
│   ├── src/                   # Исходный код React приложения
│   │   ├── App.tsx            # Главный React компонент
│   │   ├── main.tsx           # Точка входа React приложения
│   │   ├── pages/             # Страницы приложения
│   │   ├── components/        # React компоненты
│   │   └── hooks/             # React хуки
│   └── index.html             # Основной HTML шаблон
├── ml/                         # ML модели и обучение
│   ├── models/                # Веса предобученных моделей
│   ├── scripts/               # Python скрипты для работы с ML
│   │   └── download_model.py  # Загрузка моделей DeOldify
│   ├── notebooks/             # Jupyter ноутбуки для экспериментов
│   └── data/                  # Датасеты для обучения
│       ├── raw/               # Исходные данные
│       └── processed/         # Обработанные данные
└── shared/                     # Общие типы и схемы
    ├── routes.ts              # Определения API маршрутов
    └── schema.ts              # Zod схемы для валидации
```

## Быстрый старт

### 1. Установка зависимостей

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# или
poetry install
```

**Frontend:**
```bash
npm install
```

### 2. Загрузка модели DeOldify

```bash
python ml/scripts/download_model.py
```

Модель будет загружена в `ml/models/ColorizeArtistic_gen.pth`

### 3. Запуск приложения

**Backend (в одном терминале):**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (в другом терминале):**
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173` (или другому порту, указанному Vite).

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Backend
DATABASE_URL=sqlite:///./colorizer.db
DEOLDIFY_MODEL_PATH=./ml/models/ColorizeArtistic_gen.pth
PORT=8000

# Frontend (опционально)
VITE_API_URL=http://localhost:8000
```

## Разработка

### Backend

- Использует FastAPI для REST API
- SQLAlchemy для работы с БД
- DeOldify для раскрашивания изображений
- Асинхронная обработка изображений

### Frontend

- React + TypeScript
- Vite для сборки
- TanStack Query для работы с API
- Tailwind CSS для стилей
- shadcn/ui компоненты

## Тестирование

```bash
# Backend тесты
cd backend
pytest

# Frontend тесты (если настроены)
npm test
```

## Production сборка

```bash
# Frontend
npm run build

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Лицензия

MIT

