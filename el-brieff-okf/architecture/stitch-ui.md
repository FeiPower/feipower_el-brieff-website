---
type: Reference
title: Google Stitch — prototipado de UI
description: Fuente canónica de prototipos de UI del sitio El Brieff en Google Stitch.
tags: [design, prototype, stitch, ui]
status: stable
resource: https://stitch.withgoogle.com/projects/16391393389959999592
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T22:05:00Z }
notes: "Pantallas aprobadas por stakeholder para implementar (2026-08-03)."
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

# Approval status

| Campo | Valor |
|-------|--------|
| Workspace Stitch | Confirmado (URL/ID correctos) |
| UI lista para código | **Sí** — pantallas aprobadas (2026-08-03) |
| Gate | Phase 0 cerrada; implementación alineada a Stitch + [DESIGN.md](../../DESIGN.md) |

# Canonical UI prototype workspace

Los **prototipos de UI** del sitio **El Brieff** se elaboran y iteran en este proyecto de Google Stitch:

| Campo | Valor |
|-------|--------|
| Herramienta | [Google Stitch](https://stitch.withgoogle.com/) |
| Proyecto | [https://stitch.withgoogle.com/projects/16391393389959999592](https://stitch.withgoogle.com/projects/16391393389959999592) |
| ID | `16391393389959999592` |
| Rol | Sandbox de exploración visual / alta fidelidad **antes** de implementar en código |
| No es | Fuente de verdad de código, tokens CSS ni contenido de producción |

# Scope de prototipado (v1)

Pantallas alineadas a requisitos:

- Home / landing hero ([FR-001](../requirements/fr-001-landing-hero.md)) — zona de escucha / embed Spotify bajo hero
- Catálogo de episodios ([FR-002](../requirements/fr-002-episode-catalog.md)) — opcional si el embed del show basta
- Detalle de episodio ([FR-003](../requirements/fr-003-episode-detail.md))
- Suscripción a plataformas ([FR-004](../requirements/fr-004-platform-subscribe.md))
- Sobre el programa / conductor ([FR-005](../requirements/fr-005-about-host.md))
- Cruce Brieffy fuera del hero ([FR-006](../requirements/fr-006-brieffy-crossover.md))
- Media kit / prensa — CTA de descarga PDF ([FR-009](../requirements/fr-009-media-kit-pdf.md))

Playback: [ADR-0002](../decisions/adr-0002-spotify-official-embed.md) / [spotify-embed.md](spotify-embed.md).  
Media kit: [media-kit.md](media-kit.md).

# Constraints de diseño

- Identidad **cover-first** según [`DESIGN.md`](../../DESIGN.md) y [cover-art.md](cover-art.md).
- Portada canónica: [`elbrieff-cover.png`](../../elbrieff-cover.png).
- Hero sin clutter secundario (presupuesto FR-001).
- Tema oscuro de marca (`#121C16`); no reintroducir paletas ajenas a la portada.
- SEO/GEO no se prototipan como “UI trick”; el markup vive en implementación ([seo-geo.md](seo-geo.md)).

# Workflow

```text
Stitch (prototipo)
  → aprobación stakeholder / PO
  → congelar tokens o patrones en DESIGN.md + OKF
  → implementar en repo (HTML/CSS o framework)
```

1. Iterar layouts y variantes **solo** en Stitch hasta aprobación.
2. Tras aprobación, actualizar `DESIGN.md` / OKF si cambian tokens o composición.
3. El código del repo implementa lo aprobado; no inventar pantallas que no pasaron por Stitch sin acuerdo explícito.
4. Si el proyecto Stitch se archiva o migra de URL, actualizar esta página, índices y el [log](../log.md).

# Related

- Phase 0 del [delivery plan](../roadmap/delivery-plan.md)
- Roles: aprobación visual → [Product Owner](../roles/product-owner.md); implementación → [Frontend Engineer](../roles/frontend-engineer.md)
