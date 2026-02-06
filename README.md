# Парсер новостей и Instagram

Структура проекта:

```
server/   # API сервер на Express
parser/   # Библиотека парсинга RSS и Instagram
ui/       # React + Vite + TypeScript фронтенд
```

## Запуск

### 1. Установка зависимостей

В каждом пакете устанавливаем зависимости отдельно:

```bash
cd parser
npm install

cd ../server
npm install

cd ../ui
npm install
```

### 2. Запуск парсера API

```bash
cd server
npm run dev
```

По умолчанию сервер стартует на `http://localhost:4000`.

### 3. Запуск фронтенда

```bash
cd ui
npm run dev
```

Фронтенд доступен на `http://localhost:5173`.

## Настройки

- **Порты**: переменная `PORT` для сервера.
- **API URL**: переменная `VITE_API_URL` для фронта, по умолчанию `http://localhost:4000`.
- **RSS/Instagram**: список фидов и хэштегов по умолчанию находится в `parser/src/index.js`.
