---
type: Reference
title: Google Stitch — prototipado de UI
description: Proyecto Stitch donde se prototipan y exploran interfaces del sitio El Brieff antes de implementarlas.
tags: [design, prototype, stitch, ui]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
sources:
  - id: design
    resource: ../../DESIGN.md
    title: DESIGN.md (sistema visual cover-first)
    last_modified: 2026-08-03
  - id: cover
    resource: ./cover-art.md
    title: Cover art — elbrieff-cover.png
  - id: product
    resource: ../product/overview.md
    title: Product overview
---

# Prototipo de UI

Las interfaces del sitio **El Brieff** se exploran y prototipan en Google Stitch:

| Campo | Valor |
|-------|--------|
| Herramienta | [Google Stitch](https://stitch.withgoogle.com/) |
| Proyecto | [El Brieff — UI prototypes](https://stitch.withgoogle.com/projects/16391393389959999592) |
| ID | `16391393389959999592` |
| Rol | Exploración visual / wireframes de alta fidelidad; no es fuente de verdad de código |

# Scope de prototipado

Pantallas alineadas a requisitos v1:

- Home / landing hero ([FR-001](../requirements/fr-001-landing-hero.md)) — incluir zona de escucha / embed Spotify bajo hero
- Catálogo de episodios ([FR-002](../requirements/fr-002-episode-catalog.md)) — opcional si el embed del show basta
- Detalle de episodio ([FR-003](../requirements/fr-003-episode-detail.md))
- Suscripción a plataformas ([FR-004](../requirements/fr-004-platform-subscribe.md))
- Sobre el programa / conductor ([FR-005](../requirements/fr-005-about-host.md))
- Cruce Brieffy fuera del hero ([FR-006](../requirements/fr-006-brieffy-crossover.md))

Playback: [ADR-0002](../decisions/adr-0002-spotify-official-embed.md) / [spotify-embed.md](spotify-embed.md).

# Constraints de diseño

- Identidad **cover-first** según [`DESIGN.md`](../../DESIGN.md) y [cover-art.md](cover-art.md).
- Portada canónica: [`elbrieff-cover.png`](../../elbrieff-cover.png).
- Hero sin clutter secundario (presupuesto FR-001).
- Tema oscuro de marca (`#121C16`); no reintroducir paletas ajenas a la portada.

# Usage rules

1. Tratar Stitch como **sandbox de UI**: validar composición, jerarquía y variantes con stakeholders.
2. Congelar decisiones visuales en `DESIGN.md` / este OKF; el HTML/CSS del repo implementa lo aprobado, no al revés.
3. Si el proyecto Stitch se archiva o migra, actualizar esta página y el [log](../log.md).
