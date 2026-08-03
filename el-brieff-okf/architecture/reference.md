---
type: Architecture
title: Architecture reference — El Brieff website
description: Arquitectura de referencia para el sitio marketing/editorial del podcast El Brieff.
tags: [architecture, web, static-first]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
sources:
  - id: brief
    resource: ../../brieff.md
    title: Brief de producto El Brieff
  - id: design
    resource: ../../DESIGN.md
    title: DESIGN.md (identidad visual cover-first)
    last_modified: 2026-08-03
  - id: cover
    resource: ../../elbrieff-cover.png
    title: Portada canónica El Brieff
---

# Context

Sitio público de bajo acoplamiento: contenido editorial (episodios) + marketing de marca. Prioridad en rendimiento, SEO y claridad visual. Decisión de stack: ver [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md).

# Bounded contexts (lógicos)

| Contexto | Responsabilidad |
|----------|-----------------|
| Brand & Marketing | Home, about, crossover Brieffy, plataformas |
| Episodes | Catálogo, detalle, metadatos de episodio |
| Content source | Origen de episodios (CMS headless, MD, o feed RSS) — a concretar |
| Delivery | Build estático / edge hosting, CDN, analytics |

# Componentes propuestos (v1)

```text
Browser
  └─ Site (SSR/SSG)
       ├─ Pages: Home, Episodes, Episode, About
       ├─ Content layer: episodes + site config (platforms, copy)
       └─ Integrations: Spotify official embed (playback), platform deep links, Brieffy (external)
```

# Design system (entrada)

Identidad **cover-first** congelada en [`DESIGN.md`](../../DESIGN.md) a partir de la portada canónica [`elbrieff-cover.png`](../../elbrieff-cover.png). Detalle de asset: [cover-art.md](cover-art.md).

Prototipado de UI: [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) — ver [stitch-ui.md](stitch-ui.md).

Playback v1: embed oficial Spotify — [ADR-0002](../decisions/adr-0002-spotify-official-embed.md), [spotify-embed.md](spotify-embed.md).

| Token | Hex | Uso |
|-------|-----|-----|
| primary / surface | `#121C16` | Fondo de marca (carbón verdoso de portada) |
| ink | `#FFFFFF` | Tipografía principal |
| secondary | `#566899` | Navy (blazer) — UI secundaria |
| tertiary | `#78A08A` | Verde pañuelo — acento puntual |
| accent | `#A0BFE5` | Azul camisa — links / highlights |
| surface-light | `#F5F6F7` | Solo fichas/lectura auxiliar |

# Non-goals de arquitectura v1

- Backend de autenticación de oyentes.
- Pipeline de producción de audio en este repo.
- Microservicios; preferir monolito de frontend + fuente de contenido simple.

# Quality attributes

Mapeo a NFRs: [nfr-001](../requirements/nfr-001-performance.md), [nfr-002](../requirements/nfr-002-accessibility.md), [nfr-003](../requirements/nfr-003-responsive.md), [nfr-004](../requirements/nfr-004-seo-core.md), [nfr-005](../requirements/nfr-005-geo-citation.md).

Descubrimiento Search / AI: playbook [seo-geo.md](seo-geo.md).

# Open questions

1. ~~¿Fuente canónica de episodios?~~ → v1: **embed Spotify del show** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)); catálogo propio/RSS diferible a v1.1.
2. ~~¿URL / Show ID definitivo de El Brieff en Spotify?~~ → [20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) — [spotify-embed.md](spotify-embed.md).
3. ¿Dominio definitivo y hosting (Cloudflare / Render static / otro)?
4. ¿Lista final de plataformas de escucha (deep links además de Spotify)?

