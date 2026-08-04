---
type: Product
title: El Brieff — Sitio web del podcast
description: Visión y contexto del sitio oficial del podcast El Brieff, conducido por Arturo Salazar y producido por Brieffy.
tags: [product, podcast, el-brieff, brieffy]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
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
| Conductor | Arturo Salazar Bazúa (`@elchearturo`) |
| Cadencia | Lunes a viernes |
| Formato | ~15 minutos / episodio |
| Idioma principal | Español México (`es-MX`) — único en v1 |
| Hosting interim | Cloudflare Worker [el-brieff.fei-d02.workers.dev](https://el-brieff.fei-d02.workers.dev/) |
| Analytics | GA4 |
| Redes | [Instagram @elbrieff](https://www.instagram.com/elbrieff/) |
| Prensa / form | To `arturo@strtgy.ai`, Cc `mar@strtgy.ai` |
| Stack | Astro + Cloudflare Workers |

# Problema / oportunidad

Hoy el podcast existe como contenido editorial; falta una **casa digital propia** que concentre identidad, últimos episodios, archivo, vías de escucha y credibilidad de marca — sin diluir el mensaje en ruido de marketing.

# Resultado esperado

1. Landing que comunique marca, propuesta y episodio vigente en el primer viewport.
2. Escucha / episodios recientes vía embed Spotify (catálogo HTML propio diferido a v1.1).
3. CTAs claros hacia plataformas de audio y hacia Brieffy.
4. Identidad editorial coherente (claridad, velocidad, confianza).
5. Media kit profesional en PDF vía **formulario** (prensa / partnerships).

# Audiencias

| Persona | Necesidad |
|---------|-----------|
| Oyente ocasional | Entender qué es El Brieff y escuchar el episodio de hoy |
| Oyente recurrente | Suscribirse en su plataforma y volver al show |
| Profesional / líder | Descubrir Brieffy como extensión de conocimiento corto y preciso |
| Prensa / partner | Completar formulario y obtener media kit PDF |

# Alcance (v1)

## Incluido

- Home / landing del podcast
- Escucha / episodios recientes vía embed Spotify del show ([ADR-0002](../decisions/adr-0002-spotify-official-embed.md))
- Sobre el programa y el conductor (bio aprobada)
- Enlaces a plataformas: Spotify, Apple Podcasts, Deezer, iHeart, radio.net ([platforms.md](../architecture/platforms.md))
- Cruce editorial hacia Brieffy
- SEO on-page, Open Graph / Twitter Card, JSON-LD, GEO
- Media kit PDF + formulario de solicitud/descarga ([FR-009](../requirements/fr-009-media-kit-pdf.md))
- GA4
- Diseño responsive
- Deploy Cloudflare Workers ([deployment.md](../architecture/deployment.md))

## Fuera de alcance (v1) / diferido

- Catálogo y detalle HTML propios de episodios → **v1.1** (embed Spotify cubre US-001/US-002 en v1)
- CMS editorial completo con roles multi-autor
- App nativa o PWA offline-first
- Player propietario con analítica avanzada
- Paywall o membresía de episodios
- Tienda / merchandising
- Dominio custom (cutover posterior al workers.dev)
- Headshot editorial aparte de cover (backlog de assets)
- Métricas de audiencia en media kit (hasta datos aprobados)
- Idioma EN / i18n

# Criterios de éxito

- Visitante entiende la propuesta en menos de 5 segundos en home.
- Episodio más reciente accesible en ≤ 2 interacciones desde home (embed Spotify).
- Suscripción / escucha en plataforma alcanzable desde home.
- Core Web Vitals en verde en móvil (ver [nfr-001](../requirements/nfr-001-performance.md)).
- Identidad alineada al sistema visual editorial documentado.
- Sitio **indexable y citable** (SEO Google + GEO).
- Prensa/partners obtienen el media kit tras completar el formulario ([US-007](../stories/us-007-download-media-kit.md)).

# Phase 0

**Cerrada** (2026-08-03). Prototipos UI aprobados en [Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) — [stitch-ui.md](../architecture/stitch-ui.md). Listo para Phase 1 (desarrollo).

# Relacionados

- Requisitos: [requirements/](../requirements/)
- Historias: [stories/](../stories/)
- Arquitectura: [architecture/reference.md](../architecture/reference.md)
- Prototipos UI: [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) — [stitch-ui.md](../architecture/stitch-ui.md)
- Plan: [roadmap/delivery-plan.md](../roadmap/delivery-plan.md)
