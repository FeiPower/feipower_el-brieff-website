---
type: Reference
title: Cover art — elbrieff-cover.png
description: Portada canónica actual del podcast El Brieff usada en plataformas y como ancla visual del sitio. El hero web usa la variante cut-out aprobada con wordmark HTML.
tags: [brand, cover, asset]
status: stable
resource: ../../elbrieff-cover.png
generated: { by: agent/composer, at: 2026-08-03T20:10:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T20:10:00Z }
sources:
  - id: design
    resource: ../../DESIGN.md
    title: DESIGN.md (sistema visual alineado a portada)
    last_modified: 2026-08-05
---

# Asset

| Campo | Valor |
|-------|--------|
| Archivo | [`elbrieff-cover.png`](../../elbrieff-cover.png) |
| Formato | PNG, ~502×499 (1:1) |
| Uso actual | Portada del podcast en plataformas; OG / favicon; referencia de marca |
| Variante hero web | [`arturo-cover-cut-out.png`](../../public/arturo-cover-cut-out.png) — retrato cut-out + wordmark HTML |
| Sistema | [`DESIGN.md`](../../DESIGN.md) |

# Composition

- Fondo: carbón verdoso `#121C16` (no negro puro).
- Izquierda: wordmark **EL / BRI / EFF** en sans geométrica extrabold blanca, tracking amplio.
- Arriba derecha: firma **Brieffy** (`public/brieffy-logo.svg`).
- Derecha: retrato de Arturo Salazar (blazer navy, camisa azul clara, pañuelo verde).

# Usage rules

1. No recortar el wordmark ni el rostro de forma que rompa la lectura EL/BRI/EFF.
2. Preferir el asset completo en OG / share cards / plataformas de podcast.
3. En el **hero web**, usar la variante aprobada [`arturo-cover-cut-out.png`](../../public/arturo-cover-cut-out.png) con el lockup tipográfico en HTML (composición cover-first equivalente a FR-001). No duplicar el wordmark raster + HTML.
4. Colores de UI derivados de este asset (ver `DESIGN.md`); no reintroducir tertiary rojo ni accent azul genérico previos.
5. Si se regenera la portada, actualizar este concepto, `DESIGN.md` y el `log.md` del OKF.
