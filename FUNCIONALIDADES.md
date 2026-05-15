# Funcionalidades

> **Navegação:**
> - [Visão geral](./README.md)
> - **Funcionalidades e Regras de Negócio**
> - [Modelo de Dados](./BANCO_DE_DADOS.md)
> - [Fluxos](./FLUXO.md)

Visão do que a **API** expõe e do que a **web** utiliza ou simula.

---

## API (backend)

### Autenticação e segurança

- **JWT dual**: access token de curta duração + refresh token persistido no PostgreSQL; cookies HttpOnly e Secure.
- **Blocklist Redis**: logout invalida o JTI do access até expirar.
- **Versão de sessão**: após troca de senha, `sessionVersion` invalida tokens antigos.
- **RBAC**: papéis `ADMIN`, `CUSTOMER`, `SUPPORT`.
- **CSRF** integrado ao fluxo web.
- **Recuperação de senha**: `POST /auth/forgot-password` (e-mail genérico para não enumerar usuários) e `POST /auth/reset-password` (token, revoga refresh tokens).

### Catálogo e conteúdo

- **Produtos**: listagem paginada com filtros (categoria, preço, estoque, busca, ordenação), detalhe com opções selecionáveis (cor, tamanho etc.) e reviews; rating e contagem recalculados ao adicionar review.
- **CRUD admin de produto**: criar, atualizar, remover; upload de imagem via URL pré-assinada S3.
- **Categorias**: listagem pública; criação restrita a `ADMIN`.

### Carrinho e wishlist

- **Carrinho** por usuário no banco: obter, adicionar (acumula mesma variante), atualizar quantidade/variante, remover por `cartItemId`; variante com assinatura única por combinação produto + variante.
- **Wishlist**: `POST /wishlist/:productId` em modo toggle.

### Pedidos

- **Criação** a partir do carrinho ativo ou itens explícitos: transação com validação de estoque, snapshot de itens (preço, desconto, variante, imagem), decremento de estoque e incremento de `quantitySold`, limpeza do carrinho quando a origem é o carrinho.
- **Listagem**: cliente vê os próprios pedidos; `ADMIN` vê todos.
- **Detalhe** por id (autenticado).
- **Status** (`PATCH /orders/:id/status`, `ADMIN`): `pending`, `delivered`, `intransit`, `cancelled`.

### Perfil e cadastro

- **`GET /users/me`**: dados pessoais, histórico de pedidos, wishlist, cartões e endereços (formato alinhado ao tipo `User` da web).
- **`PATCH /users/me`**: dados e senha.
- **Endereços**: criar, atualizar, remover; um endereço padrão.
- **Cartões**: adicionar e remover (metadados, não processamento de pagamento real).
- **`GET /users`**: listagem paginada, `ADMIN`.

### Infraestrutura e observabilidade

- Rate limiting global e mais restrito em `/auth/*`.
- Filas BullMQ e e-mail (Nodemailer): boas-vindas, promoções, carrinho abandonado, reset de senha, etc.
- OpenAPI 3 + Scalar em `/docs`.
- Métricas Prometheus em `/metrics` (e stack local opcional Grafana/Prometheus descrita no README da API).

---

## Web (frontend)

### Vitrine e catálogo

- **Home**: blocos de ofertas e mais vendidos via `GET /products` (SSR).
- **Listagem** `/produtos`: paginação, busca, categoria, faixa de preço, ordenação; categorias via `GET /categories`.
- **Detalhe** `/produtos/[slug]`: produto completo, variante, adicionar ao carrinho, reviews quando aplicável.

### Conta e sessão

- **Login** `/login`: sessão com cookies da API; redirecionamento e `GET /users/me` para detectar sessão ativa.
- **`/auth/refresh`**: página auxiliar para renovar access token e voltar à rota desejada.
- **Perfil** `/perfil`: abas pedidos, dados pessoais, endereços, pagamentos, wishlist (dados de `/users/me`).

### Carrinho e checkout

- **Carrinho** `/carrinho`: `GET/PATCH/DELETE` na API; exige login.
- **Checkout** `/checkout`: exige cookie; carrega usuário e carrinho pela API; fluxo visual em etapas (envio, pagamento, confirmação). A confirmação na UI **não** chama `POST /orders` no código atual; o pedido real é criado pela API (ex.: integração futura, Postman ou outro cliente).

### Administração

- **`/admin`**: acesso só se `GET /users` retornar sucesso (papel `ADMIN`); abas de usuários, pedidos (atualização de status), categorias e produtos (inclui upload de imagem).

### Frontend e API

- A web depende de `PUBLIC_API_URL` apontando para o backend; não há simulação de API no bundle. SSR e cliente usam a mesma base (ver [web/.env.example](./web/.env.example)).

---

## Matriz rápida API x Web

| Recurso API | Uso na web |
|-------------|------------|
| Auth (login, register, refresh, logout) | Sim |
| Forgot / reset password | API pronta; tela dedicada depende de evolução do front |
| Produtos / categorias | Sim (vitrine, listagem, detalhe, admin) |
| Carrinho | Sim |
| Pedidos (criar) | Não acoplado ao botão de checkout atual |
| Pedidos (listar / status) | Perfil (histórico) e admin |
| Wishlist | Perfil (dados de `/users/me`) |
| Endereços / cartões | Perfil |
| `/users` (admin) | Gate do `/admin` |
