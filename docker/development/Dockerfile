# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:alpine AS base


# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install npm for platform-specific sharp installation
RUN apk add --no-cache libc6-compat curl npm

WORKDIR /app


# Копируем lock-файлы всех поддерживаемых менеджеров
COPY package.json bun.lock* yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Установка зависимостей с учётом bun и правильной платформы для sharp
RUN \
  if [ -f bun.lock ] || [ -f bun.lockb ]; then \
    bun install --frozen-lockfile && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
  elif [ -f yarn.lock ]; then \
    yarn --frozen-lockfile && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
  elif [ -f package-lock.json ]; then \
    npm ci && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm i && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This will do the trick, use the corresponding env file for each environment.
RUN if [ -f .env.development ]; then cp .env.development .env.production; fi
RUN bun run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
