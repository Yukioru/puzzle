# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat curl npm

WORKDIR /app

COPY package.json bun.lock* .npmrc* ./

RUN \
  if [ -f bun.lock ] || [ -f bun.lockb ]; then \
    bun install --frozen-lockfile && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -f .env.development ]; then cp .env.development .env.production; fi
RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
