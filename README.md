# Honkai: Star Rail - Jigsaw Puzzle

Интерактивная игра-пазл с drag-and-drop механикой, собранная на Next.js и Bun runtime.

## Быстрый Старт

Установка зависимостей:

```bash
bun install
```

Запуск dev-сервера:

```bash
bun dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

Сборка:

```bash
bun run build
```

Запуск production-сервера без Docker:

```bash
bun run start
```

## Docker

В проекте используется один общий Dockerfile:

```text
docker/Dockerfile
```

Окружения разделены compose-файлами:

```text
docker/compose.local.yml
docker/compose.development.yml
docker/compose.production.yml
```

Локальная проверка Docker-образа:

```bash
docker compose -f docker/compose.local.yml up --build
```

Development deploy:

```bash
docker compose -f docker/compose.development.yml up -d
```

Production deploy:

```bash
docker compose -f docker/compose.production.yml up -d
```

`development` и `production` compose-файлы рассчитаны на внешний Traefik network `traefik` и Watchtower.

## SQLite

Приложение использует SQLite через `bun:sqlite`.

Путь к базе задаётся переменной:

```bash
DATABASE_PATH=/app/data/puzzle.sqlite
```

В Docker база хранится в bind mount директориях:

```text
docker/data/local/puzzle.sqlite
docker/data/development/puzzle.sqlite
docker/data/production/puzzle.sqlite
```

Папки `docker/data/*` создаются Docker Compose автоматически и не коммитятся в git.

SQLite работает в WAL-режиме, поэтому рядом с базой могут появляться служебные файлы:

```text
puzzle.sqlite-wal
puzzle.sqlite-shm
```

## CI/CD

GitHub Actions собирает и публикует Docker images в GHCR при push в ветки:

```text
dev
prod
```

Для сборки используется общий `docker/Dockerfile` и build arg:

```bash
APP_ENV=development
APP_ENV=production
```

Итоговые теги:

```text
dev-latest
prod-latest
dev-YYYYMMDD-HHMMSS
prod-YYYYMMDD-HHMMSS
```

## Скрипты

```bash
bun dev          # Next dev server через Bun
bun run build    # production build
bun run start    # Next production server через Bun
bun run lint     # ESLint
```

Перед `dev` и `build` автоматически запускается подготовка изображений:

```bash
bun run scripts/prepareBoardImages.ts
```

## Технологии

- Next.js 16
- React 19
- Bun
- SQLite через `bun:sqlite`
- Docker / Docker Compose
- @dnd-kit
- Motion
- CSS Modules

## Структура

```text
src/
├── actions/       # Server actions
├── app/           # Next.js App Router
├── components/    # UI и игровые компоненты
├── dal/           # Слой доступа к данным
├── db/            # SQLite подключение
├── hooks/         # React hooks
├── screens/       # Экранные композиции
└── utils/         # Игровые и общие утилиты

docker/
├── Dockerfile
├── compose.local.yml
├── compose.development.yml
└── compose.production.yml
```
