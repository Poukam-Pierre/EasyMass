# Build context is the repo root (Nx monorepo) — see compose.yml.

FROM node:22.21.1-slim AS base

LABEL maintainer="Ngamaleu Poukam <ngamaleu2011@gmail.com>"
LABEL org.opencontainers.decription="NestJs backend for the Easy-messe project"

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS build
WORKDIR /app
# prisma.config.ts requires DATABASE_URL to be set just to load, even for
# `generate` — this placeholder is never used to connect, only to satisfy
# that check. The real value is injected at runtime via compose's env_file.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}
COPY . .
RUN npx prisma generate --config prisma.config.ts
RUN npx nx build backend --configuration=production

FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/backend ./dist/apps/backend

EXPOSE 5000
CMD ["node", "dist/apps/backend/main.js"]
