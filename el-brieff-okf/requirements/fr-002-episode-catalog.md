---
type: Functional Requirement
title: FR-002 Episode catalog
description: El sitio debe ofrecer un listado/archivo de episodios navegable por fecha (más reciente primero).
tags: [fr, episodes, catalog]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Statement

El sistema debe exponer un catálogo de episodios con título, fecha de publicación, extracto corto y enlace al detalle.

# v1 note

Con [ADR-0002](../decisions/adr-0002-spotify-official-embed.md), el listado “episodios recientes” en home se cubre con el **embed del show** en Spotify. Un archivo HTML propio (cards editoriales) es **deseable pero diferible a v1.1** si el embed basta para US-001/US-002 en el corto plazo.

# Acceptance outline

- Orden por fecha descendente (lunes–viernes implícito en el contenido) — aplica al catálogo propio cuando exista.
- Cada ítem enlaza a [FR-003](fr-003-episode-detail.md) — o, en modo embed-only, al episodio en Spotify.
- Estado vacío documentado si aún no hay episodios publicados en el CMS/fuente.
- Paginación o “cargar más” cuando el volumen lo requiera (umbral a definir en implementación).

# Links

- Story: [us-002](../stories/us-002-browse-archive.md)
- ADR: [adr-0002](../decisions/adr-0002-spotify-official-embed.md)
