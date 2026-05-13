# syntax=docker/dockerfile:1

FROM oven/bun:1.3.11 AS builder
WORKDIR /src

COPY package.json bun.lock prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
	HUSKY=0

RUN bun install --frozen-lockfile \
	&& bunx prisma generate \
	&& bun build src/index.ts --compile --outfile /serve

FROM debian:bookworm-slim AS runner

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /serve /app/serve

RUN useradd --system --create-home --shell /usr/sbin/nologin appuser \
	&& chown appuser:appuser /app/serve \
	&& chmod 0755 /app/serve

USER appuser

ENV NODE_ENV=production
EXPOSE 8080

ENTRYPOINT ["/app/serve"]
