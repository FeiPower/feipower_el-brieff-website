---
type: User Story
title: US-001 Discover latest episode
description: Como visitante, quiero llegar al episodio más reciente desde el home para informarme en ~15 minutos.
tags: [story, home, episodes]
status: implemented
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: agent/composer, at: 2026-08-04T02:45:00Z }
notes: "Phase 2 closed — agentic-plan-verify PASS. Live https://el-brieff.fei-d02.workers.dev/ (360px + 1280px; axe 0 critical/serious; Lighthouse a11y 100)."
---

# Story

**Como** visitante del sitio  
**Quiero** ver y abrir el episodio más reciente desde el home  
**Para** informarme rápido sobre los temas del día sin buscar en otras apps.

# Acceptance Criteria

- [x] AC1: El home permite acceder al episodio / show reciente (embed Spotify o CTA al embed) con título visible en el player o copy adyacente.
- [x] AC2: Un CTA primario lleva al embed de escucha o inicia la vía Spotify en ≤ 2 clics ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)).
- [x] AC3: Si el iframe de Spotify no carga, se muestra deep link de respaldo al [show](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) (no error técnico opaco).
- [x] AC4: Cumple el presupuesto de hero definido en [FR-001](../requirements/fr-001-landing-hero.md) (embed no reemplaza la marca en el primer viewport).

# Links

- FR: [fr-001](../requirements/fr-001-landing-hero.md), [fr-003](../requirements/fr-003-episode-detail.md)
- ADR: [adr-0002](../decisions/adr-0002-spotify-official-embed.md)
- Live: [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/)
