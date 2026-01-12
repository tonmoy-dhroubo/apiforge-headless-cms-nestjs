# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/uploads /app/.run/pids /app/.run/logs \
  && useradd -m -u 10001 appuser \
  && chown -R appuser:appuser /app \
  && chmod +x /app/docker-entrypoint.sh

USER appuser

EXPOSE 7080 7081 7082 7083 7084 7085
ENTRYPOINT ["/app/docker-entrypoint.sh"]
