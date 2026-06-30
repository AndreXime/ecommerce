# Ecommerce

> **Navegação:**
> - **Visão geral**
> - [Funcionalidades e Regras de Negócio](./FUNCIONALIDADES.md)
> - [Modelo de Dados](./BANCO_DE_DADOS.md)
> - [Fluxos](./FLUXO.md)

Monorepo com **API REST** (`api/`) e **loja web** (`web/`) integradas. O backend cobre catálogo, carrinho, wishlist, pedidos e perfil com autenticação JWT em cookies. O frontend é o **Emporium da Tecnologia**: vitrine Astro, carrinho e checkout contra a API e painel admin, sempre usando o backend configurado em `PUBLIC_API_URL`.

---

## Stack resumida

### API

| Camada | Tecnologia |
|--------|------------|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Hono](https://hono.dev) |
| Banco | PostgreSQL + Prisma |
| Cache / filas | Redis, BullMQ |
| Storage | AWS S3 (MinIO em dev) |
| Validação / OpenAPI | Zod, Scalar em `/docs` |

### Web

| Camada | Tecnologia |
|--------|------------|
| Framework | [Astro](https://astro.build/) |
| UI interativa | [Preact](https://preactjs.com/) |
| Estilo | [Tailwind CSS v4](https://tailwindcss.com/) |
| Ícones | Lucide Preact |

---

## Como rodar

### 1. Tudo no Docker (API, web, Postgres, Redis, MinIO, etc.)

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up -d --build
```

Com a API no Compose, `DATABASE_URL`, `REDIS_URL` e `S3_ENDPOINT_URL` devem apontar para os **servicos** (`db`, `redis`, `minio`), nao para `host.docker.internal`. Esse host e para quando a API roda no host e so a infra esta no Compose.

- Loja: `http://localhost:<WEB_PORT>` (definido no `.env`)
- API: `http://localhost:<API_PORT>`
- OpenAPI / Scalar (só com `ENV=DEV` na API): `http://localhost:<API_PORT>/docs`
- MinIO console: `http://localhost:9001` (credenciais no `.env`)

Se alterar `API_PORT`, atualize também `PUBLIC_API_URL` no `.env` e rode `docker compose build web` de novo (o Astro embute `PUBLIC_API_URL` no build).

### 2. Desenvolvimento local (API e web com Bun)

Infra com Compose (sem os serviços app):

```bash
cp .env.example .env
docker compose up -d db redis minio minio-init mailpit
cd api
cp .env.example .env
bun install
bunx prisma migrate dev
bunx prisma db seed
bun dev
```

Em outro terminal:

```bash
cd web
cp .env.example .env
bun install
bun dev
```

- API: `http://localhost:<PORT>`
- OpenAPI / Scalar: `http://localhost:<PORT>/docs`
- Métricas: `http://localhost:<PORT>/metrics`

### 3. Usuários de teste (seed da API)

O seed só roda em banco vazio. Ele cria **50 produtos** (dados do DummyJSON em `api/src/database/seed/products.json`), **6 categorias**, **150 avaliações** e faz upload das imagens para o S3/MinIO.

| E-mail | Senha | Papel |
|--------|-------|-------|
| `admin@example.com` | `123456` | ADMIN |
| Qualquer e-mail de `api/src/database/seed/users.json` | `123456` | CUSTOMER |

Exemplos de customers do seed:

| E-mail | Nome |
|--------|------|
| `emily.johnson@x.dummyjson.com` | Emily Johnson |
| `michael.williams@x.dummyjson.com` | Michael Williams |
| `sophia.brown@x.dummyjson.com` | Sophia Brown |

O seed inclui **30 customers** no total (definidos em `users.json`). O primeiro customer recebe endereço e cartão de exemplo. As avaliações usam o texto do `products.json`, mas o autor é atribuído no seed a partir dos usuários criados.

Para repopular do zero, esvazie o banco e rode `bunx prisma db seed` na pasta `api/`.

---
