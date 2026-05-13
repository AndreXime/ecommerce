# Ecommerce

> **Navegação:**
> - **Visão geral**
> - [Funcionalidades e Regras de Negócio](./FUNCIONALIDADES.md)
> - [Modelo de Dados](./BANCO_DE_DADOS.md)
> - [Fluxos](./FLUXO.md)

Monorepo com **API REST** (`api/`) e **loja web** (`web/`) integradas. O backend cobre catálogo, carrinho, wishlist, pedidos e perfil com autenticação JWT em cookies. O frontend é o **Emporium da Tecnologia**: vitrine Astro, carrinho e checkout contra a API, painel admin e modo demonstração sem backend.

---

## Stack resumida

### API

| Camada | Tecnologia |
|--------|------------|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Hono](https://hono.dev) |
| Banco | PostgreSQL + Prisma |
| Cache / filas | Redis, BullMQ |
| Storage | AWS S3 (LocalStack em dev) |
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

### 1. API

```bash
cd api
cp .env.example .env
docker compose up -d
bun install
bunx prisma migrate dev
bunx prisma db seed
bun dev
```

- API: `http://localhost:<PORT>`
- OpenAPI / Scalar: `http://localhost:<PORT>/docs`
- Métricas: `http://localhost:<PORT>/metrics`

### 2. Web

```bash
cd web
cp .env.example .env
bun install
bun dev
```

### 3. Usuários de teste (seed da API)

| E-mail | Senha | Papel |
|--------|-------|-------|
| `admin@example.com` | `123456` | ADMIN |
| `user@example.com` | `123456` | CUSTOMER |
| `user2@example.com` | `123456` | CUSTOMER |

---