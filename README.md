# Honkai: Star Rail - Jigsaw Puzzle

Интерактивная игра-пазл по Honkai: Star Rail на Next.js и Bun. Игрок выбирает профиль, сложность или режим испытания, собирает мозаику drag-and-drop механикой, а результаты endurance-режима попадают в таблицу лидеров.

## Возможности

- Drag-and-drop сборка пазла на `@dnd-kit`.
- Три обычные сложности: `easy`, `medium`, `hard`.
- Endurance/Challenge режим: бесконечные раунды, таймер, очки, бонусы времени и leaderboard.
- Модалка правил с каруселью и изображениями из `src/assets/help`.
- Автоподготовка игровых изображений: контуры, нарезанные фрагменты и цветовые палитры досок.
- SQLite-хранилище через `bun:sqlite`.
- Docker-сборки для local/development/production окружений.

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

Production build:

```bash
bun run build
```

Standalone build в папку `build` без Docker:

```bash
bun run build:export
```

Запуск production-сервера:

```bash
bun run start
```

## Скрипты

```bash
bun dev              # predev + Next dev server через Bun/Turbopack
bun run build        # prebuild + production build через Bun/Turbopack
bun run build:export # build + экспорт standalone runtime в ./build
bun run start        # Next production server
bun run lint         # ESLint
```

Перед `dev` и `build` автоматически запускается:

```bash
bun run scripts/prepareBoardImages.ts
```

Этот скрипт:

- генерирует `public/boards/palettes.json` для фона игрового экрана;
- создаёт контурные версии досок в `public/boards/outline`;
- нарезает доски на фрагменты в `public/pieces`;
- нарезает контуры в `public/pieces/outline`.

`sharp` используется только в scripts pipeline, а не в runtime-коде Next.

## Standalone Без Docker

Если Docker не нужен, можно собрать такой же runtime-артефакт, какой используется в runner stage Dockerfile:

```bash
bun run build:export
```

Команда создаёт директорию:

```text
build
```

В неё попадают:

- standalone-сервер из `.next/standalone`;
- статические Next-ассеты из `.next/static`;
- публичные файлы из `public`;
- директория `build/data` для SQLite-файла.

Запуск из корня проекта:

```bash
bun build/server.js
```

По умолчанию приложение использует `data/puzzle.sqlite` относительно текущей рабочей директории. Чтобы хранить базу внутри exported build:

```bash
DATABASE_PATH=build/data/puzzle.sqlite bun build/server.js
```

Порт и hostname можно переопределить стандартными переменными standalone Next-сервера:

```bash
PORT=3000 HOSTNAME=0.0.0.0 bun build/server.js
```

Если запускать из самой папки `build`, путь к базе можно упростить:

```bash
cd build
DATABASE_PATH=data/puzzle.sqlite bun server.js
```

## Ассеты

Игровые доски лежат в:

```text
public/boards
```

Поддерживаемые форматы досок:

```text
jpg, jpeg, png, webp
```

Подсказки для модалки правил лежат в:

```text
src/assets/help/help-1.png
src/assets/help/help-2.png
src/assets/help/help-3.png
```

Сгенерированные директории не коммитятся:

```text
public/boards/outline
public/pieces
```

`public/boards/palettes.json` хранит готовые палитры для досок и используется приложением при рендере игрового фона.

## SQLite

Приложение использует SQLite через `bun:sqlite`.

По умолчанию база создаётся здесь:

```text
data/puzzle.sqlite
```

Путь можно переопределить переменной окружения:

```bash
DATABASE_PATH=/app/data/puzzle.sqlite
```

База инициализируется автоматически при старте приложения. Используется WAL-режим, поэтому рядом могут появляться служебные файлы:

```text
puzzle.sqlite-wal
puzzle.sqlite-shm
```

Основные таблицы:

- `games` - игровые сессии, статус, таймеры, сохранённое состояние пазла.
- `game_rounds` - раунды endurance-режима и начисленные очки.

## Docker

В проекте используется общий Dockerfile:

```text
docker/Dockerfile
```

Compose-файлы:

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

## CI/CD

GitHub Actions собирает и публикует Docker images в GHCR при push в ветки:

```text
dev
prod
```

Для сборки используется `docker/Dockerfile` и build arg:

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

## Структура

```text
src/
├── actions/       # Server actions
├── app/           # Next.js App Router
├── assets/        # Шрифты, профили, loading/help изображения
├── components/    # UI и игровые компоненты
├── contexts/      # Глобальный UI context
├── dal/           # Слой доступа к данным
├── db/            # SQLite подключение и schema migrations
├── hooks/         # React hooks
├── screens/       # Экранные композиции
└── utils/         # Игровые и общие утилиты

scripts/
├── prepareBoardImages.ts
├── exportStandaloneBuild.ts
├── extractBoardPalette.ts
├── convertToOutline.ts
└── sliceImageBySize.ts

docker/
├── Dockerfile
├── compose.local.yml
├── compose.development.yml
└── compose.production.yml
```

## Технологии

- Next.js 16
- React 19
- Bun
- SQLite через `bun:sqlite`
- `@dnd-kit`
- `react-modal`
- `react-icons`
- `sharp` для подготовки изображений
- CSS Modules
- Docker / Docker Compose
