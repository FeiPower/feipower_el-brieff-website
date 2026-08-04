---
type: Playbook
title: Delivery plan — El Brieff website
description: Plan de entrega por fases para el sitio profesional del podcast.
tags: [roadmap, delivery]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
---

# Objective

Llevar a producción un sitio v1 que cumpla [product/overview](../product/overview.md) y las historias US-001, US-003–US-007 (US-002 diferida a v1.1 vía embed).

# Phases

## Phase 0 — Knowledge & freeze (**cerrada** 2026-08-03)

- [x] Congelar copy de marca (brief) + bio conductor.
- [x] Tokens de diseño (`DESIGN.md`) + cover.
- [x] Show Spotify + ADR-0002.
- [x] Hosting Cloudflare Workers + URL interim ([deployment.md](../architecture/deployment.md)).
- [x] Plataformas v1 listadas y URLs confirmadas ([platforms.md](../architecture/platforms.md)).
- [x] ADR-0001 static-first **accepted**; framework **Astro confirmado**.
- [x] Alcance: catálogo HTML → v1.1; media kit vía formulario; GA4; `es-MX`; Instagram.
- [x] Form email: To `arturo@strtgy.ai`, Cc `mar@strtgy.ai`.
- [x] Pantallas [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) **aprobadas** ([stitch-ui.md](../architecture/stitch-ui.md)).
- [x] Playbook [SEO+GEO](../architecture/seo-geo.md) en bundle (aplicar en implementación).

**Gate Phase 0:** cerrado. Siguiente: Phase 1 — Foundation.

## Phase 1 — Foundation (**cerrada** 2026-08-03)

- [x] Scaffold Astro + deploy a Worker `el-brieff`.
- [x] Layout base, tipografía (`@fontsource`), tokens bitono, nav (solo Inicio).
- [x] Home con hero ([FR-001](../requirements/fr-001-landing-hero.md)) alineado a Stitch + cover, y embed Spotify ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)).
- [x] Metadata base ([FR-007](../requirements/fr-007-seo-metadata.md) home) + JSON-LD `PodcastSeries` / `Person` / `Organization` ([FR-008](../requirements/fr-008-structured-data.md) home); GA4 vía `PUBLIC_GA_MEASUREMENT_ID` (hook).
- [x] [US-001](../stories/us-001-discover-latest-episode.md) AC verificados en live.
- [x] `agentic-plan-verify` PASS WITH GAPS → remediado (`typescript` + `tsc --noEmit` green).

**Gate Phase 1:** cerrado en [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/). Branch de trabajo: `phase-1-foundation`. Siguiente: Phase 2.

## Phase 2 — Episodes / listen zone (**cerrada** 2026-08-03)

- [x] Listen chrome: `#escuchar` heading `Escuchar en Spotify`, sin subheading, `scroll-margin-top: 5.5rem`, h2 border `var(--border)`.
- [x] Spotify show embed (`theme=0`, height 352, lazy) + helper/fallback `Abrir El Brieff en Spotify` + `<noscript>`.
- [x] Hero primary CTA `Escuchar ahora` → `#escuchar` con `--tertiary` / `--ink-on-light`; secondary deep link Spotify.
- [x] Header nav text link `Escuchar` → `#escuchar` (sin botón sage en header).
- [x] Deploy Worker `el-brieff` → [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/).
- [x] [US-001](../stories/us-001-discover-latest-episode.md) AC1–AC4 re-verificados live (~360px + ≥1280px); axe 0 critical/serious; Lighthouse a11y 100.
- [x] `agentic-plan-verify` → **PASS** (no BLOCKERs / GAPs; NOTEs only: Expected Outcomes absent in plan; redeploy skipped on re-verify — live markers OK).
- v1.1 (diferido): catálogo + detalle ([FR-002](../requirements/fr-002-episode-catalog.md), [FR-003](../requirements/fr-003-episode-detail.md), [US-002](../stories/us-002-browse-archive.md)).

**Gate Phase 2:** cerrado en [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/) tras verify PASS. Siguiente: Phase 3 — Convert & trust.

## Phase 3 — Convert & trust

- Plataformas ([FR-004](../requirements/fr-004-platform-subscribe.md)).
- About + E-E-A-T ([FR-005](../requirements/fr-005-about-host.md), Person/sameAs Instagram).
- Crossover Brieffy ([FR-006](../requirements/fr-006-brieffy-crossover.md)).
- Media kit PDF + **formulario** ([FR-009](../requirements/fr-009-media-kit-pdf.md), [media-kit.md](../architecture/media-kit.md)).
- Assets backlog: headshot editorial; métricas audiencia (si llegan).

## Phase 4 — Harden & launch

- NFRs (performance, a11y, responsive, SEO, GEO).
- `robots.txt`, sitemap, Search Console, GA4, HTTPS workers.dev.
- (Opcional) `llms.txt`.
- Definition of Done ([policies](../policies/definition-of-done.md)).

# Exit criteria (v1)

- US-001, US-003–US-007 con AC marcados (US-002 → v1.1).
- CWV en verde en móvil.
- JSON-LD validado en home y about.
- Media kit PDF + formulario operativo; leads To `arturo@strtgy.ai` / Cc `mar@strtgy.ai`.
- Stakeholder sign-off de copy, identidad, Stitch y media kit.
- Live en [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/).
