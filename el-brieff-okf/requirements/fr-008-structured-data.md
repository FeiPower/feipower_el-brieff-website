---
type: Functional Requirement
title: FR-008 Structured data JSON-LD
description: Emitir JSON-LD válido (PodcastSeries, PodcastEpisode, Person, Organization, FAQ cuando aplique) alineado al contenido visible.
tags: [fr, seo, geo, schema, json-ld]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
sources:
  - id: google-sd
    resource: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
    title: Google Search — Intro to structured data
  - id: schema-podcast
    resource: https://schema.org/PodcastSeries
    title: schema.org PodcastSeries
---

# Statement

Cada ruta pública relevante debe incluir **JSON-LD** que describa entidades reales mostradas en la página, sin markup huérfano ni datos invisibles (políticas de structured data de Google).

# Required types (v1)

| Página | Tipos |
|--------|--------|
| Home | `PodcastSeries` (+ `Organization` productora / `WebSite` si aporta), `Person` (conductor vía `author`/`actor`), opcional `FAQPage` si hay FAQ visible |
| About | `Person` (Arturo Salazar), `PodcastSeries`, enlace a Brieffy (`Organization`) |
| Episode detail | `PodcastEpisode` con `partOfSeries`, `datePublished`, `description`, `url`, `image` |
| Catalog | Opcional `ItemList` de episodios recientes |

# Acceptance outline

- [ ] JSON-LD en `<script type="application/ld+json">` (uno o grafo `@graph`).
- [ ] Propiedades requeridas por tipo presentes y **iguales** al HTML visible.
- [ ] `sameAs` solo con perfiles verificados (no inventar URLs).
- [ ] Imagen de serie/episodio: preferir portada canónica o artwork del episodio.
- [ ] Pasa validación sin errores críticos antes de merge a main.
- [ ] Idioma / `inLanguage`: `es-MX` cuando el schema lo permita.

# Links

- NFR: [nfr-004](nfr-004-seo-core.md), [nfr-005](nfr-005-geo-citation.md)
- Playbook: [seo-geo](../architecture/seo-geo.md)
- Metadata: [fr-007](fr-007-seo-metadata.md)
