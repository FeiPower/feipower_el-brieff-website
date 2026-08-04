---
type: Functional Requirement
title: FR-007 SEO metadata
description: Cada página pública debe exponer título, descripción, canonical y Open Graph / Twitter Card adecuados.
tags: [fr, seo, metadata, geo]
status: partial
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
verified: { by: agent/composer, at: 2026-08-03T23:30:00Z }
notes: "Phase 1 — home vía BaseLayout (title, description, canonical, OG/Twitter, og:locale es_MX, og:image cover). Pendiente: about / episodios / catálogo cuando existan rutas."
---

# Statement

Home, catálogo, detalle de episodio y about deben emitir metadatos SEO y de redes (title, description, canonical, og:*, twitter:card) que coincidan con el contenido visible y refuercen entidades de marca (El Brieff, conductor, Brieffy).

# Acceptance outline

- Title único por ruta; marca “El Brieff” presente de forma natural.
- Description ≤ ~160 caracteres; incluye propuesta (15 min / México y el mundo) en home.
- Canonical absoluto por página.
- OG/Twitter: `og:type`, `og:title`, `og:description`, `og:image` (default [`elbrieff-cover.png`](../../elbrieff-cover.png)), `og:locale` ≈ `es_MX`.
- Episodios pueden override de image/title/description.
- `robots` index,follow en páginas públicas v1 (salvo staging).

# Links

- NFR: [nfr-004](nfr-004-seo-core.md), [nfr-005](nfr-005-geo-citation.md)
- Structured data: [fr-008](fr-008-structured-data.md)
