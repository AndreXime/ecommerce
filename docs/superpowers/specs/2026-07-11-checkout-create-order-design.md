# Checkout cria pedido (design)

## Objetivo

No botão **Finalizar pedido** (etapa 2), chamar `POST /orders` e mostrar confirmação com ID real. Se o cliente tiver endereço salvo, pré-preencher a etapa de envio.

## Escopo

**Entra**
- `POST /orders` com `{}` (pedido a partir do carrinho)
- Loading / desabilitar botão / mensagem de erro
- Confirmação com `order.id`
- Prefill de envio a partir de endereço padrão (ou o primeiro) e dados do perfil

**Não entra**
- Gateway de pagamento
- Persistência de endereço/frete no `Order`
- Email de confirmação
- Redirect de carrinho vazio

## Fluxo

1. SSR do checkout carrega `/users/me` + `/cart`.
2. Escolhe endereço: `isDefault === true`, senão o primeiro da lista.
3. Prefill: `street`, `city`; `phone` e `registration` (CPF) do perfil; nome/email já existentes.
4. CEP continua vazio (modelo atual não tem CEP).
5. Em **Finalizar pedido**: `request.post("/orders", {})`.
6. Sucesso → etapa 3 com ID; API já limpa o carrinho.
7. Erro → permanece na etapa 2 com `message` da API.

## Prefill de endereço

O modelo `Address` tem só `type`, `street`, `city`, `isDefault`. A UI de envio ganha campo **Cidade** para receber o valor. Campos cosmética (CEP, cartão) não bloqueiam a criação do pedido.
