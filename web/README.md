# E-commerce Astro

Um projeto de comércio eletrônico moderno, rápido e leve, construído com **Astro**, **Preact** e **Tailwind CSS v4**. Frontend de vitrine, carrinho, checkout e área logada contra uma **API REST** configurada por `PUBLIC_API_URL`.

## Tecnologias Utilizadas

Este projeto utiliza uma stack moderna focada em performance e simplicidade:

* **[Astro 5](https://astro.build/)**: Garante carregamento instantâneo e excelente SEO ao entregar HTML estático.
* **[Preact](https://preactjs.com/)**: Biblioteca leve alternativa ao React para gerenciar o estado e a interatividade.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework de utilitários CSS.
* **[Lucide Preact](https://lucide.dev/)**: Biblioteca de ícones consistente e leve.

## Funcionalidades

Com base na estrutura do projeto, a aplicação inclui:

* **Catálogo de Produtos**: Listagem e página de detalhes de produtos (eletrónica, periféricos, etc.).
* **Carrinho de Compras**: Gestão de estado do carrinho (adicionar/remover itens).
* **Checkout**: Fluxo de finalização de compra.
* **Autenticação**: Login, refresh de sessão e perfil do usuário integrados à API (cookies).
* **Tipos compartilhados**: Contratos em TypeScript em `src/database/` (ex.: usuário e produto) alinhados às respostas da API.
* **Astro Actions**: Utilização de Server Actions para lógica de backend segura.

## Estrutura do Projeto

```text
/
├── public/             # Ativos estáticos (favicons, imagens)
├── src/
│   ├── actions/        # Astro Actions (lógica de backend)
│   ├── components/     # Componentes UI (Astro e Preact)
│   ├── database/       # Tipos TypeScript (produtos, usuário)
│   ├── layout/         # Layouts globais e CSS
│   ├── lib/            # Utilitários (toast, utils)
│   └── pages/          # Rotas baseadas em arquivos
│       ├── carrinho/   # Página do carrinho
│       ├── checkout/   # Página de pagamento
│       ├── login/      # Autenticação
│       ├── perfil/     # Área do usuário
│       └── produtos/   # Listagem e detalhes ([slug].astro)
├── astro.config.mjs    # Configuração do Astro e integrações
└── package.json        # Dependências e scripts

```
