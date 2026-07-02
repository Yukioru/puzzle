# Honkai: Star Rail - Jigsaw Puzzle

Интерактивная игра-пазл по Honkai: Star Rail на Next.js и Bun. Игрок выбирает профиль, сложность или режим испытания, собирает мозаику drag-and-drop механикой, а результаты endurance-режима попадают в таблицу лидеров.

## Возможности

- Drag-and-drop сборка пазла на `@dnd-kit`.
- Три обычные сложности: `easy`, `medium`, `hard`.
- Challenge/Endurance режим: бесконечные раунды, таймер, очки, бонусы времени и leaderboard.
- Infinity режим: свободная бесконечная игра без таймера, очков и статистики.
- Leaderboards: классические таблицы по сложностям и рейтинговая таблица Challenge-режима.
- Live-обновление лидербордов через Server-Sent Events.
- Админ-панель со статистикой, настройками режимов и быстрым запуском Challenge/Infinity игр.
- Адаптивный portrait layout для мобильных экранов.
- Модалка правил с каруселью и изображениями из `src/assets/help`.
- Автоподготовка игровых изображений: контуры, нарезанные фрагменты и цветовые палитры досок.
- SQLite-хранилище через `bun:sqlite`.
- Docker-сборки для local/development/production окружений.
- CI/CD публикует Docker image, standalone zip build и GitHub Release/Pre-release.

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

- генерирует `public/palettes.json` для фона игрового экрана;
- генерирует `public/profiles.json` со связями профилей и досок;
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

## Игровые Режимы

На экране старта доступны обычные сложности:

```text
easy
medium
hard
```

Дополнительные режимы:

- `challenge` - endurance-режим с таймером, очками, бонусами времени, milestone-бонусами и возрастающей сложностью.
- `infinity` - свободная бесконечная игра без таймера, очков и записи в статистику.

Доступность `challenge` и `infinity` управляется из админских настроек. Если режим выключен, он не показывается игрокам на экране выбора сложности.

## Leaderboards

На главном экране отображаются:

- `Классика` - табы по сложностям `easy`, `medium`, `hard`; сортировка по лучшему времени.
- `Испытание` - рейтинг endurance-игр по очкам, количеству раундов и времени.

Данные лидербордов отдаются через:

```text
GET /api/leaderboards
```

Endpoint работает как SSE stream (`text/event-stream`), отправляет актуальный snapshot, keepalive-сообщения и обновления при изменении результатов или настроек endurance-режима.

## Админка

Админские страницы:

```text
/admin/stats
/admin/settings
```

`/admin/stats` показывает:

- ключевые метрики по играм;
- распределение по статусам, сложностям и режимам;
- дневную динамику;
- статистику по профилям, доскам и endurance-раундам;
- последние игры.

`/admin/settings` позволяет:

- включать и выключать Challenge/Endurance режим;
- включать и выключать Infinity режим;
- настраивать стартовое время, бонусы времени, milestone-бонусы;
- настраивать базовые очки и target time по сложностям.

В админском layout есть быстрый запуск Challenge и Infinity игр с выбором профиля.

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

`public/palettes.json` хранит готовые палитры для досок и используется приложением при рендере игрового фона.
`public/profiles.json` хранит сгенерированные связи профилей и досок.

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
- `app_settings` - настройки Challenge/Endurance и Infinity режимов.

Поле `gameMode` различает:

```text
classic
endurance
infinity
```

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

GitHub Actions workflow `Build and Release` запускается при push в ветки:

```text
dev
prod
```

и при push любого git tag.

Workflow состоит из четырёх jobs:

- `prepare` - вычисляет Docker-теги, имя zip-файла и параметры релиза.
- `docker-image` - собирает и публикует Docker image в GHCR.
- `zip-build` - выполняет `bun run build:export`, пакует директорию `build` в zip и сохраняет artifact.
- `release` - создаёт GitHub Release или Pre-release и прикрепляет zip build.

`docker-image` и `zip-build` выполняются параллельно после `prepare`.

Для Docker-сборки используется `docker/Dockerfile` и build arg:

```bash
APP_ENV=development
APP_ENV=production
```

Docker image публикуется в GHCR:

```text
ghcr.io/<owner>/<repo>/hsr-puzzle
```

Для веток используются теги:

```text
dev-latest
dev-YYYYMMDD-HHMMSS
prod-latest
prod-YYYYMMDD-HHMMSS
```

Для tag build используется сам tag как Docker tag. Если tag указывает на commit из `prod`, дополнительно обновляется `prod-latest`; иначе используется `pre-latest`.

Zip build называется так:

```text
hsr-puzzle-<ref>-<short-sha>.zip
```

Внутри zip находится exported standalone build из директории:

```text
build
```

Release-логика:

- push в `dev` или `prod` создаёт GitHub Pre-release с Docker tags и zip build;
- push git tag создаёт Pre-release, если tag не относится к `prod`;
- push git tag на commit из `prod` создаёт полноценный GitHub Release.

Автоматические pre-release tags имеют префикс:

```text
prerelease-
```

Workflow игнорирует такие tag events, чтобы не запускать повторный release pipeline от собственного служебного тега.

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
- `@tanstack/react-form`
- `react-modal`
- `react-icons`
- `recharts`
- `sharp` для подготовки изображений
- CSS Modules
- Docker / Docker Compose
