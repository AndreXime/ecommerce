# Checkout cria pedido — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ligar o checkout da web a `POST /orders` e pré-preencher o envio com endereço/perfil salvos.

**Architecture:** SSR em `checkout/index.astro` passa `initialShipping` derivado de `/users/me`. O Preact `_checkout.tsx` chama `request.post("/orders", {})` no Finalizar pedido e exibe ID/erro/loading. Sem mudanças na API.

**Tech Stack:** Astro + Preact, `web/src/lib/request.ts`, Hono `POST /orders` existente.

---

### Task 1: Passar dados de envio no SSR

**Files:**
- Modify: `web/src/pages/checkout/index.astro`
- Modify: `web/src/pages/checkout/_checkout.tsx` (props)

- [ ] Extrair de `userRes.data`: `phone`, `registration`, endereço default/primeiro
- [ ] Passar `initialShipping` para o componente
- [ ] Adicionar campo Cidade e `defaultValue`s nos inputs

### Task 2: Criar pedido no Finalizar

**Files:**
- Modify: `web/src/pages/checkout/_checkout.tsx`

- [ ] Estado `submitting`, `submitError`, `createdOrderId`
- [ ] Handler async: `POST /orders` com `{}`
- [ ] Sucesso → step 3 + ID; erro → mensagem; loading no botão
- [ ] Confirmação mostra ID truncado ou completo do pedido

### Task 3: Verificar

- [ ] Lints nos arquivos tocados
- [ ] Conferir tipagem da resposta `Order` alinhada a `web/src/database/users.ts` / schema da API
