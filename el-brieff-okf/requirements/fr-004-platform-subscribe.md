---
type: Functional Requirement
title: FR-004 Platform subscribe
description: El sitio debe ofrecer enlaces claros a las plataformas de escucha del podcast.
tags: [fr, subscribe, platforms]
status: implemented
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
---

# Statement

El visitante debe poder llegar a las plataformas oficiales desde home (y from about / media kit según diseño): **Spotify, Apple Podcasts, Deezer, iHeart, radio.net**.

# v1 Spotify

Además de deep links, Spotify es la plataforma de **reproducción embebida** ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)). Otras plataformas: solo enlaces etiquetados (sin embeds adicionales).

# URLs

Fuente canónica: [architecture/platforms.md](../architecture/platforms.md).

# Acceptance outline

- Grupo de CTAs de las cinco plataformas en home.
- Enlaces configurables (no hardcode disperso), incluida la URL del show Spotify del embed.
- Etiquetas accesibles (nombre de plataforma, no solo ícono).
- Embed Spotify con `title` accesible y `loading="lazy"` — ver [spotify-embed.md](../architecture/spotify-embed.md).

# Links

- Story: [us-003](../stories/us-003-subscribe-platforms.md)
- ADR: [adr-0002](../decisions/adr-0002-spotify-official-embed.md)
