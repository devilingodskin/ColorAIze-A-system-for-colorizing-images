# Запуск приложения в Docker

## Быстрый старт

```bash
# Запуск приложения
./docker-start.sh

# Или вручную:
docker-compose up -d
```

## Требования

- Docker Desktop (macOS/Windows) или Docker Engine (Linux)
- Минимум 4GB RAM для Docker
- ~10GB свободного места на диске

## Подготовка

### 1. Модель DeOldify

Модель уже находится в папке `ml/models/` и будет автоматически скопирована в Docker контейнер при сборке.

Если модели нет, приложение будет работать, но функция раскрашивания будет недоступна. В этом случае можно скачать модель:

```bash
# Скачать модель (займет 5-15 минут, ~1.5 GB)
python ml/scripts/download_model.py ColorizeStable_gen

# Или художественную модель (более яркие цвета)
python ml/scripts/download_model.py ColorizeArtistic_gen
```

### 2. Настройка переменных окружения (опционально)

Создайте файл `.env` в корне проекта:

```env
# База данных
POSTGRES_DB=colorizer
POSTGRES_USER=colorizer
POSTGRES_PASSWORD=your_secure_password_here

# Порт приложения
PORT=8000

# CORS (для production)
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## Запуск

### Вариант 1: Автоматический скрипт

```bash
./docker-start.sh
```

### Вариант 2: Docker Compose

```bash
# Сборка образов
docker-compose build

# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## Доступ к приложению

После запуска приложение будет доступно по адресу:
- **Frontend**: http://localhost:8000
- **API**: http://localhost:8000/api
- **API Docs**: http://localhost:8000/docs

## Полезные команды

```bash
# Просмотр логов
docker-compose logs -f app

# Перезапуск приложения
docker-compose restart app

# Остановка всех контейнеров
docker-compose down

# Остановка с удалением volumes (удалит данные БД!)
docker-compose down -v

# Пересборка после изменений кода
docker-compose build --no-cache
docker-compose up -d
```

## Устранение проблем

### Проблема: Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs app

# Проверьте статус контейнеров
docker-compose ps
```

### Проблема: Ошибка подключения к БД

Убедитесь, что PostgreSQL контейнер запущен:
```bash
docker-compose ps db
```

### Проблема: Модель не найдена

Убедитесь, что модель скачана в `ml/models/`:
```bash
ls -lh ml/models/*.pth
```

Если модели нет, приложение будет работать, но раскрашивание будет недоступно.

### Проблема: Порт уже занят

Измените порт в `docker-compose.yml` или `.env`:
```yaml
ports:
  - "8001:8000"  # Используйте другой порт
```

## Production

Для production используйте `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Этот файл включает:
- Nginx как reverse proxy
- SSL/TLS настройки
- Оптимизированные настройки производительности
