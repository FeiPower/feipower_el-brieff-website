---
type: Functional Requirement
title: FR-003 Episode detail
description: Cada episodio tiene una página con metadatos, resumen y vías de reproducción/escucha.
tags: [fr, episodes, detail]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Statement

La página de episodio debe mostrar título, fecha, duración estimada (~15 min), resumen/show notes y CTAs hacia plataformas o embed de reproducción.

# v1 playback

Reproducción embebida: **iframe oficial de Spotify** del episodio ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md), [spotify-embed.md](../architecture/spotify-embed.md)). Sin player propietario.

# Acceptance outline

- URL estable y amigable (slug) cuando exista página propia; si v1 es embed-only en home, el detalle puede aplazarse.
- Metadatos mínimos: título, fecha, descripción (para SEO cuando haya página).
- Embed de episodio Spotify + CTA de escucha coherente con [FR-004](fr-004-platform-subscribe.md).
- Navegación a episodio anterior/siguiente cuando existan (catálogo propio); en modo show-embed, la navegación la aporta Spotify.

# Links

- Story: [us-001](../stories/us-001-discover-latest-episode.md), [us-002](../stories/us-002-browse-archive.md)
- ADR: [adr-0002](../decisions/adr-0002-spotify-official-embed.md)
