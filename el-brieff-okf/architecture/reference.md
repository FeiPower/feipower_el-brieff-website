---
type: Architecture
title: Architecture reference — El Brieff website
description: Arquitectura de referencia para el sitio marketing/editorial del podcast El Brieff.
tags: [architecture, web, static-first]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
notes: "Phase 1 foundation live 2026-08-03 — Home Astro + Worker assets; About/Media kit siguen Phase 3."
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
| Brand & Marketing | Home, about, crossover Brieffy, plataformas, media kit |
| Episodes | Catálogo, detalle, metadatos de episodio |
| Content source | v1: embed Spotify + copy estático; catálogo MD/CMS → v1.1 |
| Press assets | Media kit PDF + formulario de lead (`arturo@strtgy.ai`) |
| Delivery | Cloudflare Workers (`el-brieff` / fei-d02), GA4 |

# Componentes propuestos (v1)

```text
Browser
  └─ Site (Astro SSG → Cloudflare Workers Static Assets)
       ├─ Pages: Home (Phase 1 live); About / Media kit (form) → Phase 3
       ├─ Static assets: cover art (public/); media-kit PDF → Phase 3
       ├─ Site config: src/config/site.ts (platforms, copy, GA4 hook, sameAs)
       ├─ Worker handlers: media-kit form POST (+ mail/CRM) → Phase 3
       └─ Integrations: Spotify embed (live), platform deep links (config only Phase 1), Brieffy, Instagram
```

**Phase 1 (live):** [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/) — Hero + Spotify show embed + JSON-LD. Media kit: [media-kit.md](media-kit.md). Deploy: [deployment.md](deployment.md).

# Design system (entrada)

Identidad **cover-first** congelada en [`DESIGN.md`](../../DESIGN.md) a partir de la portada canónica [`elbrieff-cover.png`](../../elbrieff-cover.png). Detalle de asset: [cover-art.md](cover-art.md).

Prototipado de UI: [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) — ver [stitch-ui.md](stitch-ui.md).

Playback v1: embed oficial Spotify — [ADR-0002](../decisions/adr-0002-spotify-official-embed.md), [spotify-embed.md](spotify-embed.md).

Deploy: [deployment.md](deployment.md). Plataformas: [platforms.md](platforms.md).

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

1. ~~¿Fuente canónica de episodios?~~ → v1: **embed Spotify del show** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)); catálogo HTML propio → **v1.1** (stakeholder: opción A).
2. ~~¿URL / Show ID definitivo de El Brieff en Spotify?~~ → [20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) — [spotify-embed.md](spotify-embed.md).
3. ~~¿Dominio definitivo y hosting?~~ → Cloudflare Workers interim [el-brieff.fei-d02.workers.dev](https://el-brieff.fei-d02.workers.dev/) — [deployment.md](deployment.md). Dominio custom diferido.
4. ~~¿Lista final de plataformas?~~ → Spotify, Apple Podcasts, Deezer, iHeart, radio.net — [platforms.md](platforms.md) (**URLs confirmadas**).
5. ~~¿Framework?~~ → **Astro** + Cloudflare Workers — [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md).
6. ~~¿Aprobar prototipos Stitch?~~ → **Aprobado** — [stitch-ui.md](stitch-ui.md).
7. ~~¿Backend del formulario media kit?~~ → Worker envía email **To** `arturo@strtgy.ai`, **Cc** `mar@strtgy.ai`.

