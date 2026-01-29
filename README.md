# E-commerce Astro

Um projeto de comércio eletrónico moderno, rápido e leve, construído com **Astro**, **Preact** e **Tailwind CSS v4**. Este projeto demonstra uma aplicação de e-commerce performante com funcionalidades como gestão de carrinho, autenticação e listagem de produtos.

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
* **Autenticação**: Sistema de Login e Perfil de utilizador.
* **Base de Dados Mock**: Dados estáticos tipados via TypeScript para produtos e utilizadores.
* **Astro Actions**: Utilização de Server Actions para lógica de backend segura.

## Estrutura do Projeto

```text
/
├── public/             # Ativos estáticos (favicons, imagens)
├── src/
│   ├── actions/        # Astro Actions (lógica de backend)
│   ├── components/     # Componentes UI (Astro e Preact)
│   ├── database/       # Mock data (produtos.ts, users.ts)
│   ├── layout/         # Layouts globais e CSS
│   ├── lib/            # Utilitários (toast, utils)
│   └── pages/          # Rotas baseadas em ficheiros
│       ├── carrinho/   # Página do carrinho
│       ├── checkout/   # Página de pagamento
│       ├── login/      # Autenticação
│       ├── perfil/     # Área do utilizador
│       └── produtos/   # Listagem e detalhes ([slug].astro)
├── astro.config.mjs    # Configuração do Astro e integrações
└── package.json        # Dependências e scripts

```
