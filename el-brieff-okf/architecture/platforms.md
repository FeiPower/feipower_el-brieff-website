---
type: Reference
title: Listening platforms — deep links
description: Lista v1 de plataformas de escucha de El Brieff con URLs canónicas.
tags: [platforms, subscribe, deep-links]
status: stable
generated: { by: agent/composer, at: 2026-08-03T21:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:05:00Z }
---

# v1 platforms (confirmado)

Orden sugerido de UI (Spotify primero = plataforma de embed):

| Plataforma | URL canónica | Rol v1 | Estado |
|------------|--------------|--------|--------|
| Spotify | [https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) | Embed + deep link | Congelado |
| Apple Podcasts | [https://podcasts.apple.com/mx/podcast/el-brieff/id1444545033](https://podcasts.apple.com/mx/podcast/el-brieff/id1444545033) | Deep link | Confirmado |
| Deezer | [https://www.deezer.com/es/show/5905047](https://www.deezer.com/es/show/5905047) | Deep link | Confirmado |
| iHeart | [https://www.iheart.com/podcast/256-el-brieff-30974371/](https://www.iheart.com/podcast/256-el-brieff-30974371/) | Deep link | Confirmado |
| radio.net | [https://mx.radio.net/podcast/el-brieff](https://mx.radio.net/podcast/el-brieff) | Deep link | Confirmado |

# Rules

- Solo estas cinco en v1 (no inventar otras).
- URLs centralizadas en config del sitio ([FR-004](../requirements/fr-004-platform-subscribe.md)).
- Embed solo Spotify ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md)).
- Si una URL cambia, corregir aquí + [log.md](../log.md); no hardcode disperso.
