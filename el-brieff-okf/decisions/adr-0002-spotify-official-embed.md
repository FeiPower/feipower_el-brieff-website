---
type: Architecture Decision Record
title: ADR-0002 Spotify official embed for playback (v1)
description: Decisión de usar el embed oficial de Spotify (show/episodio) como vía nativa de escucha y de episodios recientes en el sitio v1.
tags: [adr, spotify, embed, episodes]
status: accepted
generated: { by: agent/composer, at: 2026-08-03T20:25:00Z }
sources:
  - id: spotify-embeds
    resource: https://developer.spotify.com/documentation/embeds
    title: Spotify Embeds documentation
  - id: product
    resource: ../product/overview.md
    title: Product overview (player propietario fuera de alcance v1)
---

# Context

El sitio necesita mostrar y permitir escuchar episodios recientes sin construir un player propietario ni sincronizar un catálogo vía Web API/RSS en v1. Opciones evaluadas:

1. **Embed oficial de Spotify** (iframe / oEmbed del show o episodio).
2. Spotify Web API (`Get Show Episodes`) + UI propia.
3. RSS del host del podcast.

El OKF ya marca player propietario fuera de alcance y prioriza embeds / deep links ([product/overview](../product/overview.md)).

# Decision

**Aceptada — opción 1:** en v1, la escucha “en sitio” y el bloque de episodios recientes se resuelven con el **embed oficial de Spotify** del show (y, cuando aplique, del episodio concreto).

| Uso | Implementación |
|-----|----------------|
| Home — episodios / escuchar | Embed del **show** Spotify (lista + reproducción) |
| Detalle de episodio (si existe URL) | Embed del **episodio** + deep link “Abrir en Spotify” |
| Suscribirse | Deep links a plataformas ([FR-004](../requirements/fr-004-platform-subscribe.md)); Spotify es la fuente de reproducción embebida |

# Consequences

**Pros**

- Mínima complejidad ops (sin `client_secret`, sin sync de API).
- Reproducción y lista recientes mantenidas por Spotify.
- Alineado a static-first ([ADR-0001](adr-0001-static-first-marketing-site.md)).

**Contras / límites**

- La UI del listado/player es de Spotify (no cover-first custom para la lista interna del embed).
- SEO de show notes no viene del embed: páginas propias siguen necesitando copy/metadatos si se publican detalles ([FR-003](../requirements/fr-003-episode-detail.md), [FR-007](../requirements/fr-007-seo-metadata.md)).
- Catálogo editorial rico ([FR-002](../requirements/fr-002-episode-catalog.md)) queda **secundario / diferible**: el embed del show cubre “recientes”; un archivo propio puede entrar en v1.1 vía RSS/API.

# Implementation notes

1. ~~Obtener y congelar la URL canónica del show Spotify.~~ → [20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi).
2. Usar iframe embed oficial o [oEmbed](https://developer.spotify.com/documentation/embeds/reference/oembed); snippet en [spotify-embed.md](../architecture/spotify-embed.md).
3. `loading="lazy"`, `title` accesible, `allow` según docs de Spotify; no cargar el embed por encima del presupuesto de hero brand (FR-001: marca + propuesta primero; embed como CTA de escucha / sección inmediata).
4. Configurar URL del show en un solo lugar (config / constante), no hardcode disperso.
5. Deep link “Escuchar en Spotify” como fallback si el iframe falla o el usuario prefiere la app.

# Open

- ~~URL / ID definitivo del show El Brieff en Spotify.~~ → [show/20HgvkIWtkxDP44PguN1Wi](https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi) (congelado en [spotify-embed.md](../architecture/spotify-embed.md)).
- ¿Apple Podcasts / YouTube solo como deep links (sí, v1) o también embeds (no, v1)?

# Links

- Architecture: [spotify-embed.md](../architecture/spotify-embed.md)
- Stories: [us-001](../stories/us-001-discover-latest-episode.md), [us-003](../stories/us-003-subscribe-platforms.md)
