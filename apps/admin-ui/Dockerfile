# Build context is the repo root (Nx monorepo) — see compose.yml.

FROM node:22.21.1-slim AS base

LABEL maintainer="Ngamaleu Poukam <ngamaleu2011@gmail.com>"
LABEL org.opencontainers.decription="NextJs of admin portal for the Easy-messe project"

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
RUN npx nx build admin-ui --configuration=production

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4300
COPY --from=build /app/dist/apps/admin-ui/.next/standalone ./
COPY --from=build /app/dist/apps/admin-ui/.next/static ./dist/apps/admin-ui/.next/static
COPY --from=build /app/apps/admin-ui/public ./apps/admin-ui/public

EXPOSE 4300
CMD ["node", "apps/admin-ui/server.js"]
