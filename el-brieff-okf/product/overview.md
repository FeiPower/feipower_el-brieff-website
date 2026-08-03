---
type: Product
title: El Brieff — Sitio web del podcast
description: Visión y contexto del sitio oficial del podcast El Brieff, conducido por Arturo Salazar y producido por Brieffy.
tags: [product, podcast, el-brieff, brieffy]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
sources:
  - id: brief
    resource: ../brieff.md
    title: Brief de producto El Brieff
    author: human:stakeholder
    last_modified: 2026-08-03
  - id: design
    resource: ../DESIGN.md
    title: DESIGN.md (identidad cover-first)
    last_modified: 2026-08-03
  - id: cover
    resource: ../elbrieff-cover.png
    title: Portada canónica El Brieff
---

# Visión

Sitio web profesional que proyecta a **El Brieff** como el podcast diario para informarse en **15 minutos** sobre los temas de conversación más importantes de **México y el mundo**. El sitio debe convertir visitantes en oyentes recurrentes (suscripción / plataformas) y reforzar el vínculo con **Brieffy**, la plataforma productora.

# Contexto

| Campo | Valor |
|-------|--------|
| Producto | El Brieff (podcast) |
| Productor | Brieffy (`www.brieffy.com`) |
| Conductor | Arturo Salazar (`@elchearturo`) |
| Cadencia | Lunes a viernes |
| Formato | ~15 minutos / episodio |
| Idioma principal | Español (México) |

# Problema / oportunidad

Hoy el podcast existe como contenido editorial; falta una **casa digital propia** que concentre identidad, últimos episodios, archivo, vías de escucha y credibilidad de marca — sin diluir el mensaje en ruido de marketing.

# Resultado esperado

1. Landing que comunique marca, propuesta y episodio vigente en el primer viewport.
2. Catálogo / detalle de episodios navegable y indexable.
3. CTAs claros hacia plataformas de audio/video y hacia Brieffy.
4. Identidad editorial coherente (claridad, velocidad, confianza).[^design-notion]

# Audiencias

| Persona | Necesidad |
|---------|-----------|
| Oyente ocasional | Entender qué es El Brieff y escuchar el episodio de hoy |
| Oyente recurrente | Encontrar episodios previos y suscribirse |
| Profesional / líder | Descubrir Brieffy como extensión de conocimiento corto y preciso |
| Prensa / partner | Obtener bio del conductor y kit de marca básico |

# Alcance (v1)

## Incluido

- Home / landing del podcast
- Escucha / episodios recientes vía embed Spotify del show ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md))
- Listado y detalle de episodios (catálogo propio diferible si el embed cubre el caso)
- Sobre el programa y el conductor
- Enlaces a plataformas de escucha
- Cruce editorial hacia Brieffy
- SEO on-page y metadatos Open Graph / Twitter Card
- Diseño responsive

## Fuera de alcance (v1)

- CMS editorial completo con roles multi-autor (puede entrar en v1.1)
- App nativa o PWA offline-first
- Player propietario con analítica avanzada (v1: **embed oficial Spotify** + deep links — [ADR-0002](../decisions/adr-0002-spotify-official-embed.md))
- Paywall o membresía de episodios
- Tienda / merchandising

# Criterios de éxito

- Visitante entiende la propuesta en menos de 5 segundos en home.
- Episodio más reciente accesible en ≤ 2 interacciones desde home.
- Suscripción / escucha en plataforma alcanzable desde home y detalle.
- Core Web Vitals en verde en móvil (ver [nfr-001](../requirements/nfr-001-performance.md)).
- Identidad alineada al sistema visual editorial documentado.
- Sitio **indexable y citable** (SEO Google + GEO): metadata, JSON-LD, E-E-A-T — ver [seo-geo](../architecture/seo-geo.md).

# Relacionados

- Requisitos: [requirements/](../requirements/)
- Historias: [stories/](../stories/)
- Arquitectura: [architecture/reference.md](../architecture/reference.md)
- Plan: [roadmap/delivery-plan.md](../roadmap/delivery-plan.md)

[^brief]: Brief de producto El Brieff
[^design-notion]: El Brieff con Arturo Salazar - DESIGN.md
