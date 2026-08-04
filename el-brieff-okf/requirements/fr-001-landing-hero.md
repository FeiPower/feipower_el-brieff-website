---
type: Functional Requirement
title: FR-001 Landing hero
description: El home debe comunicar marca, propuesta de valor y acceso al episodio vigente en el primer viewport.
tags: [fr, home, hero]
status: implemented
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: agent/composer, at: 2026-08-03T23:30:00Z }
notes: "Phase 1 home — Hero.astro (EL/BRI/EFF + pitch + Escuchar/#escuchar + cover) live en workers.dev."
---

# Statement

Como visitante, debo ver en el primer viewport el nombre **El Brieff**, una línea de propuesta (15 minutos / México y el mundo), el episodio más reciente y un CTA primario de escucha.

# Rationale

El primer contacto define credibilidad editorial. El brand debe ser señal hero-level; el episodio vigente es el producto tangible.

# Acceptance outline

- Brand “El Brieff” visible sin depender solo del nav (wordmark o portada canónica).
- Headline + una oración de soporte (propuesta del podcast).
- Bloque de escucha del episodio / show reciente vía **embed oficial de Spotify** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)) o CTA que lleve al embed en ≤ 2 interacciones.
- Hero visual anclado a [`elbrieff-cover.png`](../../elbrieff-cover.png) o composición equivalente cover-first.
- Sin clutter secundario (stats, schedules, promos ajenas) en el primer viewport; el iframe de Spotify no sustituye la señal de marca del hero.

# Links

- Product: [overview](../product/overview.md)
- Story: [us-001](../stories/us-001-discover-latest-episode.md)
- Architecture: [spotify-embed.md](../architecture/spotify-embed.md)
