# syntax=docker/dockerfile:1

FROM oven/bun:1.3.11 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

ARG PUBLIC_API_URL=http://localhost:8080
ENV ASTRO_ADAPTER=node \
	PUBLIC_API_URL=${PUBLIC_API_URL}

RUN bun run build \
	&& rm -rf node_modules \
	&& bun install --frozen-lockfile --production

FROM node:22-bookworm-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER node

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
