# Миграция с Node.js на FastAPI

Этот документ описывает изменения, сделанные при миграции с Node.js/Express на FastAPI.

## Основные изменения

### Backend
- ✅ Заменен Express.js на FastAPI
- ✅ Заменен Drizzle ORM на SQLAlchemy
- ✅ Интегрирован DeOldify для локального раскрашивания
- ✅ Убрана зависимость от Replit AI Integrations

### Frontend
- ✅ Перемещен из `client/` в `frontend/`
- ✅ Обновлен vite.config.ts для новой структуры
- ✅ API эндпоинты остались теми же (совместимость сохранена)

### Структура проекта
- ✅ Создана структура `backend/`, `frontend/`, `ml/`
- ✅ Добавлены скрипты для загрузки моделей
- ✅ Обновлен .gitignore

## Что нужно сделать

1. **Установить Python зависимости:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Загрузить модель DeOldify:**
   ```bash
   python ml/scripts/download_model.py
   ```

3. **Запустить приложение:**
   ```bash
   # Backend
   cd backend
   uvicorn app.main:app --reload

   # Frontend (в другом терминале)
   npm run dev
   ```

## Старые файлы для удаления

Следующие файлы и папки больше не используются и могут быть удалены:
- `server/` - старый Node.js бэкенд
- `script/` - старые скрипты сборки
- `drizzle.config.ts` - конфигурация Drizzle
- Зависимости от Node.js бэкенда в package.json (оставить только фронтенд)

## Совместимость API

API эндпоинты остались теми же:
- `GET /api/images` - список изображений
- `GET /api/images/{id}` - получить изображение
- `POST /api/images` - загрузить изображение

Формат ответов совместим с предыдущей версией.

