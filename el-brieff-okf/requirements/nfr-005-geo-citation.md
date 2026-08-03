---
type: Non-Functional Requirement
title: NFR-005 GEO citation readiness
description: Capa de Generative Engine Optimization alineada a prácticas Google — citabilidad, entidades y extractabilidad sin hacks.
tags: [nfr, geo, seo, google, eeat]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:20:00Z }
sources:
  - id: google-sd
    resource: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
    title: Google Search — Intro to structured data
  - id: google-sd-policies
    resource: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
    title: Google Search — Structured data policies
  - id: google-crawling
    resource: https://developers.google.com/search/docs/crawling-indexing
    title: Google Search — Crawling and indexing
---

# Principle

**GEO** = aumentar la probabilidad de que motores generativos (p. ej. AI Overviews y asistentes) **recuperen, atribuyan y citen** a El Brieff con precisión. En Google, eso se construye sobre [NFR-004](nfr-004-seo-core.md): ranking/confianza orgánica + markup + contenido extractable. No hay ranking “GEO” separado documentado por Google.

Playbook operativo: [architecture/seo-geo.md](../architecture/seo-geo.md).

# Targets (Google-aligned)

## Entity clarity

- Nombre de marca consistente: **El Brieff** (podcast) ≠ **Brieffy** (productora) — ver glosario.
- `Organization` / `PodcastSeries` + `Person` (Arturo Salazar) con `sameAs` a perfiles oficiales (X/Twitter, LinkedIn, plataformas de podcast, Brieffy) cuando existan URLs canónicas.
- Página About con bio, rol y vínculo productor.

## Extractable answers

- En home y about: respuesta directa (≤ ~40 palabras) a “¿Qué es El Brieff?” cerca del H1/H2 principal.
- Show notes de episodio: primer párrafo = resumen factual autónomo (quién / qué / cuándo).
- Headings que reflejen preguntas reales (“¿Quién conduce El Brieff?”, “¿Con qué frecuencia se publica?”).
- FAQ visible en about/home cuando aporte valor; emparejado con `FAQPage` solo si el FAQ está en la página ([FR-008](fr-008-structured-data.md)).

## Citation-ready facts

- Datos estructurales estables: duración ~15 min, lun–vie, México y el mundo, conductor, productor.
- Evitar prosa ambigua en bloques citables; preferir enunciados verificables.
- Enlaces internos a About, episodio vigente y Brieffy (grafo de entidades en-site).

## Freshness

- Episodio más reciente destacado y con `datePublished` correcto.
- Sitemap regenerado al publicar.
- `dateModified` si se corrigen show notes.

# Optional / experimental (no requisito Google)

| Práctica | Estado en v1 |
|----------|----------------|
| `llms.txt` en raíz con URLs pilares (home, about, últimos episodios) | Opcional; no documentado como requisito de Google Search |
| Chunking artificial / “AI-only” pages | **No** — viola helpful content / sd-policies si el markup no refleja lo visible |
| Keyword stuffing para LLMs | **Prohibido** |

# Verification

- Rich Results / schema validation en home, about, episodio.
- Inspección manual: ¿un modelo podría citar “qué es / quién / cadencia” sin inventar?
- Lighthouse SEO + crawl sample (Search Console post-launch).
