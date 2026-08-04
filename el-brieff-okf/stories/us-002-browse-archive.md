---
type: User Story
title: US-002 Browse archive
description: Como oyente recurrente, quiero recorrer el archivo de episodios para recuperar temas previos.
tags: [story, catalog, episodes, v1.1]
status: deferred
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
---

# Story

**Como** oyente recurrente  
**Quiero** navegar el archivo de episodios  
**Para** recuperar conversaciones o temas que me perdí.

# Release

**Diferida a v1.1.** En v1 el archivo se cubre con el **embed oficial del show Spotify** (lista de episodios en el player) — [ADR-0002](../decisions/adr-0002-spotify-official-embed.md). Stakeholder: opción A (sin catálogo HTML en v1).

# Acceptance Criteria (v1.1)

- [ ] AC1: Existe una ruta de catálogo con episodios ordenados del más reciente al más antiguo.
- [ ] AC2: Cada ítem muestra título, fecha y enlace al detalle.
- [ ] AC3: El detalle carga show notes / resumen cuando estén disponibles.
- [ ] AC4: La navegación anterior/siguiente funciona cuando hay vecinos.

# Links

- FR: [fr-002](../requirements/fr-002-episode-catalog.md), [fr-003](../requirements/fr-003-episode-detail.md)
