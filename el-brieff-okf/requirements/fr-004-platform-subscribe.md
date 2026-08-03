---
type: Functional Requirement
title: FR-004 Platform subscribe
description: El sitio debe ofrecer enlaces claros a las plataformas de escucha del podcast.
tags: [fr, subscribe, platforms]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Statement

El visitante debe poder llegar a las plataformas oficiales (p. ej. Spotify, Apple Podcasts, YouTube u otras definidas) desde home y desde detalle de episodio.

# v1 Spotify

Además de deep links, Spotify es la plataforma de **reproducción embebida** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)). Otras plataformas: solo enlaces etiquetados en v1 (sin embeds adicionales).

# Acceptance outline

- Grupo de CTAs de plataformas en home y detalle.
- Enlaces configurables (no hardcode disperso), incluida la URL del show Spotify usada por el embed.
- Etiquetas accesibles (nombre de plataforma, no solo ícono).
- Embed Spotify con `title` accesible y `loading="lazy"` — ver [spotify-embed.md](../architecture/spotify-embed.md).

# Links

- Story: [us-003](../stories/us-003-subscribe-platforms.md)
- ADR: [adr-0002](../decisions/adr-0002-spotify-official-embed.md)
