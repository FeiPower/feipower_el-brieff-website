---
type: Reference
title: Spotify official embed
description: Cómo incrustar el show/episodios de El Brieff con el embed oficial de Spotify (v1).
tags: [spotify, embed, episodes]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:25:00Z }
sources:
  - id: adr
    resource: ../decisions/adr-0002-spotify-official-embed.md
    title: ADR-0002 Spotify official embed
  - id: embeds
    resource: https://developer.spotify.com/documentation/embeds
    title: Spotify Embeds
  - id: oembed
    resource: https://developer.spotify.com/documentation/embeds/reference/oembed
    title: Spotify oEmbed
---

# Decision

Ver [ADR-0002](../decisions/adr-0002-spotify-official-embed.md): v1 usa **embed oficial de Spotify**, no Web API ni RSS.

# Config

| Campo | Valor |
|-------|--------|
| Show URL | [https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) |
| Show ID | `20HgvkIWtkxDP44PguN1Wi` |
| Tema embed | Preferir dark / alineado a `#121C16` (`theme=0` en el generador) |

# Snippet — show (home / sección Escuchar)

```html
<iframe
  style="border-radius:12px"
  src="https://open.spotify.com/embed/show/20HgvkIWtkxDP44PguN1Wi?utm_source=generator&theme=0"
  width="100%"
  height="352"
  frameborder="0"
  allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
  title="El Brieff en Spotify"
></iframe>
```

- `height="152"` ≈ compact; `352` ≈ lista de episodios recientes en el embed.
- Generar/verificar el código desde Spotify: Share → Embed show ([guía creators](https://support.spotify.com/us/creators/article/sharing-embedding-your-show/)).
- Deep link del show: `https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi`

# Snippet — episodio (detalle)

```html
<iframe
  style="border-radius:12px"
  src="https://open.spotify.com/embed/episode/EPISODE_ID?utm_source=generator&theme=0"
  width="100%"
  height="152"
  frameborder="0"
  allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
  title="Episodio de El Brieff en Spotify"
></iframe>
```

# Placement vs FR-001

- **Primer viewport:** marca El Brieff + propuesta + CTA “Escuchar” (scroll o ancla al embed).
- **Embed del show:** sección inmediata bajo el hero (o panel de escucha), no como clutter de stats/promos sobre la portada.
- Mantener deep link “Abrir en Spotify” junto al iframe.

# oEmbed (opcional)

`GET https://open.spotify.com/oembed?url={show_or_episode_url}` — útil si el build necesita HTML de embed a partir de la URL canónica.

# No hacer (v1)

- Llamar Spotify Web API desde el front con secretos.
- Sustituir el wordmark/cover por el chrome visual de Spotify en el hero.
- Duplicar URLs del show en múltiples archivos sin config central.
