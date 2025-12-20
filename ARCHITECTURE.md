# Архитектура проекта

## Обзор

Image Colorizer AI - это полнофункциональное веб-приложение для раскрашивания черно-белых фотографий с использованием модели DeOldify.

## Структура проекта

```
Image-Colorizer-AI/
├── backend/              # FastAPI бэкенд
│   ├── app/             # Основной код приложения
│   │   ├── main.py      # FastAPI app и endpoints
│   │   ├── models.py    # SQLAlchemy модели БД
│   │   ├── database.py  # Конфигурация БД
│   │   ├── colorizer.py # Интеграция DeOldify
│   │   ├── config.py    # Конфигурация
│   │   └── schemas.py   # Pydantic схемы
│   ├── storage/         # Хранилище файлов
│   ├── tests/           # Тесты
│   └── requirements.txt # Python зависимости
│
├── frontend/            # React + TypeScript фронтенд
│   ├── src/
│   │   ├── pages/      # Страницы приложения
│   │   ├── components/ # React компоненты
│   │   └── hooks/      # React хуки
│   └── public/         # Статические файлы
│
├── ml/                 # ML модели и скрипты
│   ├── models/        # Веса моделей
│   └── scripts/       # Утилиты
│
└── deoldify_repo/     # Клонированный DeOldify
```

## Поток данных

### Загрузка изображения

1. **Frontend** → Пользователь загружает файл
2. **Frontend** → Отправляет POST `/api/images` с FormData
3. **Backend** → Валидирует файл, создает запись в БД со статусом `PENDING`
4. **Backend** → Возвращает ответ с ID изображения
5. **Backend** → Запускает асинхронную задачу обработки
6. **Backend** → Обновляет статус на `PROCESSING`
7. **Backend** → Обрабатывает изображение через DeOldify
8. **Backend** → Обновляет статус на `COMPLETED` с результатом

### Отслеживание статуса

1. **Frontend** → Опрашивает GET `/api/images/{id}` каждую секунду
2. **Backend** → Возвращает текущий статус
3. **Frontend** → Обновляет UI в зависимости от статуса

## Компоненты

### Backend

**main.py**
- FastAPI приложение
- API endpoints
- CORS middleware
- Асинхронная обработка задач

**colorizer.py**
- Инициализация DeOldify модели
- Обработка изображений
- Конвертация форматов

**models.py**
- SQLAlchemy модели
- Image модель с полями: id, original_url, colorized_url, status, public_token

**database.py**
- Конфигурация подключения к БД
- Сессии SQLAlchemy
- Инициализация БД

### Frontend

**pages/**
- `home.tsx` - Главная страница загрузки
- `gallery.tsx` - Галерея всех изображений
- `result.tsx` - Страница результата (для владельца)
- `public-result.tsx` - Публичный просмотр (по токену)

**components/**
- `layout.tsx` - Основной layout с навигацией
- `image-compare.tsx` - Компонент сравнения до/после
- `image-viewer.tsx` - Модальное окно просмотра
- `status-badge.tsx` - Бейдж статуса

**hooks/**
- `use-images.ts` - Работа с API изображений
- `use-share.ts` - Функционал шаринга

## Безопасность

### Публичные токены

- Каждое изображение получает уникальный 32-символьный токен
- Токен генерируется криптографически безопасным способом
- Доступ по токену через `/api/public/{token}`
- Невозможно угадать токен другого изображения

### Валидация

- Размер файла: максимум 10MB
- Тип файла: только изображения (JPG, JPEG, PNG)
- Валидация на frontend и backend

## Производительность

### Асинхронная обработка

- Обработка изображений выполняется в отдельном потоке
- Не блокирует основной event loop
- Использует ThreadPoolExecutor для CPU-интенсивных задач

### Оптимизация

- Lazy loading модели DeOldify
- Кэширование результатов в БД
- Base64 кодирование для передачи изображений

## Масштабирование

### Горизонтальное масштабирование

- Stateless backend (данные в БД)
- Можно запускать несколько инстансов
- Использовать Redis для очередей задач (будущее улучшение)

### Вертикальное масштабирование

- GPU ускорение для DeOldify
- Увеличение workers для uvicorn
- Оптимизация размера изображений

## Развертывание

### Development

```bash
./start.sh
```

### Production

- Frontend: `npm run build` → статический сервер
- Backend: `uvicorn app.main:app --workers 4`
- Database: PostgreSQL (вместо SQLite)
- Reverse proxy: Nginx

## Будущие улучшения

- [ ] Очередь задач (Celery + Redis)
- [ ] Кэширование результатов
- [ ] Поддержка видео
- [ ] Batch обработка
- [ ] Пользовательские настройки (render_factor)
- [ ] История обработок пользователя

