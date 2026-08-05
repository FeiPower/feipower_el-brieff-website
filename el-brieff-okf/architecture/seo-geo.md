---
type: Playbook
title: SEO + GEO playbook (Google-aligned)
description: Cómo aplicar SEO de Google y Generative Engine Optimization en el sitio El Brieff sin hacks.
tags: [seo, geo, playbook, google]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
sources:
  - id: google-sd
    resource: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
    title: Intro to structured data
  - id: google-sd-policies
    resource: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
    title: Structured data policies
  - id: google-crawling
    resource: https://developers.google.com/search/docs/crawling-indexing
    title: Crawling and indexing
---

# Goal

Hacer que El Brieff sea **descubrible, indexable y citable** en Search y en respuestas generativas, siguiendo documentación de Google y evitando tácticas no soportadas.

# Stack de requisitos

1. [NFR-004 SEO core](../requirements/nfr-004-seo-core.md)
2. [NFR-005 GEO citation](../requirements/nfr-005-geo-citation.md)
3. [FR-007 Metadata](../requirements/fr-007-seo-metadata.md)
4. [FR-008 JSON-LD](../requirements/fr-008-structured-data.md)

# Google-documented vs experimental

| Práctica | Origen | v1 |
|----------|--------|-----|
| Crawlability, canonical, sitemap, robots | Google Search docs | **Obligatorio** |
| Helpful / people-first content | Google Search quality | **Obligatorio** |
| JSON-LD + políticas (markup = contenido visible) | Google structured data | **Obligatorio** |
| E-E-A-T (experiencia, expertise, autoridad, confianza) | Google quality guidance | **Obligatorio** (About, bylines, fechas, sameAs reales) |
| PodcastSeries / PodcastEpisode | schema.org + ecosistema Search | **Obligatorio** en rutas aplicables |
| Respuestas directas bajo H2, FAQ visible | Buena práctica GEO + extractability | **Requerido** en home/about |
| `llms.txt` | Industria GEO; no requisito Google documentado | **Opcional** |
| Páginas solo para AI / markup oculto | Contra sd-policies / helpful content | **Prohibido** |

# Implementation checklist (por página)

## Home

- [ ] H1/propuesta: qué es El Brieff en una frase citables.
- [ ] Metadata FR-007 + JSON-LD `PodcastSeries` (+ Person).
- [ ] Episodio vigente enlazado (freshness).
- [ ] FAQ corto opcional (cadencia, duración, plataformas) si el diseño lo admite.

## Episode (v1.1)

- [ ] Título + fecha + resumen autónomo en primer párrafo.
- [ ] `PodcastEpisode` JSON-LD con `partOfSeries`, `datePublished`, `url`.
- [ ] Canonical y OG del episodio.

> v1: no hay rutas de episodio propias; freshness vía embed Spotify en home.

## About

- [ ] Bio del conductor + handle + productor Brieffy.
- [ ] `Person` + vínculos `sameAs` reales: Instagram [elbrieff](https://www.instagram.com/elbrieff/), Spotify show; Brieffy `sameAs` omitido v1 (sitio offline).
- [ ] Respuestas a “quién conduce” / “quién produce”.

# Site globals (congelados)

| Campo | Valor |
|-------|--------|
| `inLanguage` | `es-MX` |
| Canonical base | `https://el-brieff.strtgy.ai` |
| Analytics | GA4 `G-P2FHN490KW` — [analytics-ga4.md](analytics-ga4.md) |
| OG image default | `elbrieff-cover.png` |

# Columnas / opinión (CMS)

- Rutas: `/opinion/`, `/opinion/[slug]/` desde D1 publicado.
- Metadata: `og:type=article`, `article:published_time` / `modified_time`, canonical self.
- JSON-LD: `NewsArticle` vía `src/lib/editorial/seo.ts` (headline/description/fechas = texto visible).
- Discovery: `/robots.txt`, `/sitemap-index.xml`, `/news-sitemap.xml` (solo ítems ≤48h), `/rss.xml`, `/syndication.xml` (socios; copias full → `noindex` en destino).
- Rich Results: validar manualmente en Google Rich Results Test tras cada columna nueva.

# Publish ritual

1. Actualizar contenido visible.
2. Publicar desde admin (`approved → published`) con citas.
3. Verificar sitemap / news-sitemap / RSS.
4. Validar JSON-LD (Rich Results).
5. Verificar que title/description/OG coinciden con el HTML.
5. (Post-launch) Enviar URL en Search Console si es crítico.

# References in-bundle

- Portada / OG default: [cover-art.md](cover-art.md)
- Glosario entidades: [El Brieff](../glossary/el-brieff.md), [Brieffy](../glossary/brieffy.md), [GEO](../glossary/geo.md), [E-E-A-T](../glossary/eeat.md)
