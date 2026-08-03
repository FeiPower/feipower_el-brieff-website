---
type: Non-Functional Requirement
title: NFR-004 SEO core
description: Fundamentos de SEO según Google Search — crawlability, indexabilidad, helpful content y señales técnicas.
tags: [nfr, seo, google]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
sources:
  - id: google-crawling
    resource: https://developers.google.com/search/docs/crawling-indexing
    title: Google Search — Crawling and indexing
  - id: google-sd
    resource: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
    title: Google Search — Intro to structured data
  - id: google-sd-policies
    resource: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
    title: Google Search — Structured data policies
---

# Principle

GEO no sustituye SEO. Google AI Overviews y superficies generativas se apoyan en el **mismo índice y las mismas señales de calidad** que Search clásico. Primero cumplir este NFR; luego [NFR-005](nfr-005-geo-citation.md).

# Targets

## Crawl & index

- HTML semántico (`main`, `article`, `nav`, headings H1→H2→H3 sin saltos).
- `robots.txt` que no bloquee rutas públicas; sin `noindex` accidental en prod.
- `sitemap.xml` actualizado en cada publish (episodios incluidos).
- Canonical absoluto por URL pública.
- URLs estables, legibles, en minúsculas; un recurso = una URL canónica.

## Metadata & sharing

- Cumplir [FR-007](fr-007-seo-metadata.md) (title, description, OG, Twitter Card).
- OG image por defecto = portada canónica [`elbrieff-cover.png`](../../elbrieff-cover.png).

## Structured data (base)

- JSON-LD (formato preferido por Google), válido y alineado al contenido visible.
- Tipos mínimos: ver [FR-008](fr-008-structured-data.md).
- Validar con Rich Results Test / Schema Markup Validator antes de release.

## Helpful content & E-E-A-T

- Contenido people-first (propuesta del podcast clara; sin keyword stuffing).
- Atribución visible del conductor y productor (About + bylines en episodios).
- Fechas de publicación (`datePublished`) y actualización cuando aplique (`dateModified`).
- Claims verificables; no inventar estadísticas.

## Performance (SEO signal)

- Core Web Vitals alineados a [NFR-001](nfr-001-performance.md); mobile-first.

# Out of scope (este NFR)

- Tácticas solo-GEO no documentadas por Google (p. ej. `llms.txt` como requisito) — opcionales en [NFR-005](nfr-005-geo-citation.md).
