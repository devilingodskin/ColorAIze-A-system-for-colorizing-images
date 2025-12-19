# DeOldify Service Integration

Этот модуль обеспечивает интеграцию с сервисом DeOldify для раскрашивания черно-белых изображений.

## Конфигурация

Настройте следующие переменные окружения:

- `DEOLDIFY_API_URL` - URL сервиса DeOldify (по умолчанию: `http://localhost:8000`)
- `DEOLDIFY_API_TIMEOUT` - Таймаут запроса в миллисекундах (по умолчанию: `60000`)

## Формат API

Клиент поддерживает два формата API:

### Формат 1: Multipart Form Data
```
POST /colorize
Content-Type: multipart/form-data
Body: image file
Response: image file или JSON { image: base64_string }
```

### Формат 2: JSON
```
POST /colorize
Content-Type: application/json
Body: { image: base64_string, mime_type: "image/jpeg" }
Response: JSON { image: base64_string } или image file
```

## Использование

```typescript
import { colorizeImage } from "./services/deoldify/client";

const colorizedImage = await colorizeImage(
  base64ImageString, // без префикса data:
  "image/jpeg"
);
// Возвращает data URL: "data:image/jpeg;base64,..."
```

## Требования к DeOldify API

Ваш DeOldify сервис должен:
1. Принимать POST запросы на `/colorize`
2. Поддерживать один из форматов выше
3. Возвращать раскрашенное изображение в формате:
   - Прямой файл изображения (Content-Type: image/*)
   - JSON с полем `image` содержащим base64 строку

