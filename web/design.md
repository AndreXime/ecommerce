# Design — Emporium da Tecnologia

Sistema visual unificado para a loja. Todas as páginas leem este arquivo antes de emitir código.

## Genre

modern-minimal

## Macrostructure family

- Marketing (home): Marquee Hero — tipografia dominante, produto em destaque à direita
- Catálogo: Workbench — filtros laterais + grade de produtos
- Detalhe de produto: Long Document — galeria + coluna de compra
- App (carrinho, checkout, perfil, admin): Workbench — sidebar ou painel + conteúdo principal

## Theme

- `--color-paper`   oklch(99% 0.002 90)
- `--color-paper-2` oklch(97% 0.004 90)
- `--color-ink`     oklch(16% 0.012 260)
- `--color-ink-2`   oklch(32% 0.014 260)
- `--color-rule`    oklch(90% 0.006 90)
- `--color-accent`  oklch(58% 0.19 28)
- `--color-focus`   oklch(52% 0.2 28)

## Typography

- Display: Instrument Sans, weight 600, normal
- Body: Instrument Sans, weight 400
- Mono: IBM Plex Mono, weight 400
- Display tracking: -0.03em
- Type scale anchor: `--text-display` = clamp(2.25rem, 4.5vw + 0.5rem, 4.25rem)

## Spacing

Escala de 4 pt com tokens nomeados em `src/styles/tokens.css`.

## Motion

- Easings: `--ease-out`, `--ease-in`, `--ease-in-out`
- Reveal: fade + slide curto (220ms)
- Reduced-motion: opacity-only, ≤ 150ms

## Microinteractions stance

- Silent success (toast discreto)
- Hover delay 800ms em tooltips · focus delay 0ms
- Optimistic update onde aplicável

## CTA voice

- Primary: fill accent, pill radius, sem sombra exagerada
- Secondary: outline rule, pill radius

## Per-page allowances

- Marketing pages: enrichment Tier-A (produto real da API)
- App pages: sem enrichment
- Content pages: tipografia only

## What pages MUST share

- Wordmark Emporium
- Accent coral/ember e placement ≤ 5% por viewport
- Instrument Sans + IBM Plex Mono
- CTA voice (pill, padding rhythm)
- Cards com borda rule + shadow-card

## What pages MAY differ on

- Macrostructure dentro da família
- Hero archetype em marketing
- Enrichment apenas na home

## Exports

### tokens.css

Ver `src/styles/tokens.css`.

### Tailwind v4 `@theme`

Ver `src/layout/global.css` — bloco `@theme inline`.

### DTCG `tokens.json`

```json
{
  "color": {
    "paper": { "$value": "oklch(99% 0.002 90)", "$type": "color" },
    "ink": { "$value": "oklch(16% 0.012 260)", "$type": "color" },
    "accent": { "$value": "oklch(58% 0.19 28)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Instrument Sans", "$type": "fontFamily" },
    "body": { "$value": "Instrument Sans", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 99% 0.002 90;
  --foreground: 16% 0.012 260;
  --primary: 58% 0.19 28;
  --primary-foreground: 99% 0.002 90;
  --muted: 90% 0.006 90;
  --muted-foreground: 52% 0.012 260;
  --border: 90% 0.006 90;
  --input: 90% 0.006 90;
  --ring: 52% 0.2 28;
  --radius: 0.75rem;
}
```
