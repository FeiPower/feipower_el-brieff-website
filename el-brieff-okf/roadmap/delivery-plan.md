---
type: Playbook
title: Delivery plan — El Brieff website
description: Plan de entrega por fases para el sitio profesional del podcast.
tags: [roadmap, delivery]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Objective

Llevar a producción un sitio v1 que cumpla [product/overview](../product/overview.md) y las historias US-001–US-006.

# Phases

## Phase 0 — Knowledge & freeze

- Congelar copy de marca (brief) y tokens de diseño (`DESIGN.md`).
- Explorar y validar UI en [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) ([stitch-ui.md](../architecture/stitch-ui.md)).
- Confirmar plataformas de escucha y dominio.
- Aprobar [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md) + stack.
- Revisar playbook [SEO+GEO](../architecture/seo-geo.md).

## Phase 1 — Foundation

- Scaffold del proyecto web + CI de preview.
- Layout base, tipografía, color, nav.
- Home con hero ([FR-001](../requirements/fr-001-landing-hero.md)) y **embed oficial Spotify del show** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md), [spotify-embed.md](../architecture/spotify-embed.md)).
- Metadata base + JSON-LD `PodcastSeries` en home ([FR-007](../requirements/fr-007-seo-metadata.md), [FR-008](../requirements/fr-008-structured-data.md)).

## Phase 2 — Episodes

- Catálogo propio y detalle ([FR-002](../requirements/fr-002-episode-catalog.md), [FR-003](../requirements/fr-003-episode-detail.md)) — **opcional/diferible** si el embed del show cubre US-001/US-002; priorizar embed de episodio en detalle cuando haya páginas.
- Fuente de contenido rica (MD/CMS/RSS) → candidata a v1.1 si no bloquea launch.
- Metadata + `PodcastEpisode` por episodio cuando existan páginas; show notes con resumen citable ([NFR-005](../requirements/nfr-005-geo-citation.md)).

## Phase 3 — Convert & trust

- Plataformas ([FR-004](../requirements/fr-004-platform-subscribe.md)).
- About + E-E-A-T ([FR-005](../requirements/fr-005-about-host.md), Person/sameAs).
- Crossover Brieffy ([FR-006](../requirements/fr-006-brieffy-crossover.md)).

## Phase 4 — Harden & launch

- Pasar NFRs (performance, a11y, responsive, SEO, GEO).
- `robots.txt`, sitemap, Search Console, analytics, dominio, HTTPS.
- (Opcional) `llms.txt` experimental — no bloquea launch.
- Definition of Done ([policies](../policies/definition-of-done.md)).

# Exit criteria (v1)

- US-001–US-006 con AC marcados.
- CWV en verde en móvil (lab o field).
- JSON-LD validado en home, about y un episodio muestra.
- Stakeholder sign-off de copy e identidad.
