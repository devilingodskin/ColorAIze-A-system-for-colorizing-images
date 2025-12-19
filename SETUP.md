# Инструкция по установке и запуску

## Требования

- Python 3.10+
- Node.js 18+
- npm или yarn
- CUDA (опционально, для GPU ускорения)

## Шаг 1: Установка зависимостей

### Backend (Python)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Или используйте Poetry:
```bash
cd backend
poetry install
```

### Frontend (Node.js)

```bash
npm install
```

## Шаг 2: Загрузка модели DeOldify

```bash
python ml/scripts/download_model.py
```

Модель будет загружена в `ml/models/ColorizeArtistic_gen.pth` (около 1.5 GB).

## Шаг 3: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Backend
DATABASE_URL=sqlite:///./backend/colorizer.db
DEOLDIFY_MODEL_PATH=./ml/models/ColorizeArtistic_gen.pth
PORT=8000

# Frontend (опционально)
VITE_API_URL=http://localhost:8000
```

## Шаг 4: Запуск приложения

### Вариант 1: Использование скрипта запуска

```bash
./start.sh
```

### Вариант 2: Ручной запуск

**Терминал 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # или poetry shell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Терминал 2 - Frontend:**
```bash
npm run dev
```

## Проверка работы

1. Backend должен быть доступен по адресу: http://localhost:8000
2. Frontend должен быть доступен по адресу: http://localhost:5173 (или другой порт, указанный Vite)
3. API документация: http://localhost:8000/docs

## Troubleshooting

### Ошибка "DeOldify not available"

Убедитесь, что:
1. Модель загружена: `python ml/scripts/download_model.py`
2. Установлены все зависимости: `pip install -r requirements.txt`
3. Путь к модели указан правильно в `.env`

### Ошибка подключения к базе данных

Для SQLite убедитесь, что директория `backend/` существует и доступна для записи.

### Проблемы с CUDA

Если у вас нет GPU, DeOldify будет работать на CPU (медленнее, но работает).

## Production развертывание

### Backend

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend

```bash
npm run build
# Затем разверните содержимое dist/ на статическом сервере
```

