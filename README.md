# Honkai: Star Rail - Jigsaw Puzzle

Интерактивная игра-пазл с drag-and-drop функциональностью, основанная на вселенной Honkai: Star Rail.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
bun install
```

### Запуск в режиме разработки

```bash
bun dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере, чтобы увидеть игру.

### Сборка для продакшена

```bash
bun run build
```

### Запуск продакшен сервера

```bash
bun run start
```

## 🛠 Технологии

- **Next.js 15.5** - React фреймворк с App Router
- **@dnd-kit** - Drag-and-drop библиотека
- **CSS Modules** - Модульные стили
- **Bun** - Быстрый пакетный менеджер

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router страницы
│   ├── demo-boards/       # Демо доски
│   ├── demo-pieces/       # Демо элементы
│   └── game/             # Игровые страницы
├── components/            # React компоненты
│   ├── JigsawBoard/      # Игровая доска
│   ├── JigsawPiece/      # Элемент пазла
│   ├── SmartJigsawPiece/ # Умный элемент пазла
│   └── ...
├── assets/               # Статические ресурсы
└── dal/                 # Слой доступа к данным
```
