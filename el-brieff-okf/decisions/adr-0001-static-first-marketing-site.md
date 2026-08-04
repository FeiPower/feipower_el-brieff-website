---
type: ADR
title: ADR-0001 Static-first marketing site
description: Decisión de adoptar un sitio estático o SSG con CDN/Workers como arquitectura base del v1.
tags: [adr, architecture, hosting, astro, cloudflare]
status: accepted
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
notes: "Framework Astro confirmado por stakeholder 2026-08-03."
---

# Context

El producto es un sitio de marca + episodios con cadencia diaria. El tráfico es lectura/escucha; no hay transacciones ni sesiones de usuario complejas en v1. Se necesitan SEO fuerte, TTFB bajo y despliegues simples. Hosting confirmado: **Cloudflare Workers** ([deployment.md](../architecture/deployment.md)).

# Options

1. **Static / SSG + CDN/Workers** (Astro, Next static export, HTML puro) con contenido en MD/config.
2. **SSR full** en un runtime Node siempre encendido.
3. **WordPress / CMS monolítico** hospedado clásico.

# Trade-offs

| Opción | Pros | Contras |
|--------|------|---------|
| 1 Static/SSG | Rendimiento, costo, seguridad de superficie | CMS/editorial puede requerir build |
| 2 SSR | Dinamismo fácil | Costo/ops; overkill para v1 |
| 3 WP monolítico | Editorial familiar | Deuda de performance/seguridad; menos control de diseño |

# Decision

**Aceptado:** opción **1 — static-first / SSG** desplegado en **Cloudflare Workers** (Static Assets + Worker para formulario media kit).

## Framework (confirmado)

**Astro** + Cloudflare Workers (Static Assets + endpoints Worker para el formulario media kit).

Motivos (UI/UX móvil + desktop + SEO):

- HTML estático por defecto → First Contentful Paint / LCP fuertes en móvil (cumple [NFR-001](../requirements/nfr-001-performance.md)).
- Islands: JS solo donde hace falta (formulario media kit, analytics) → UI snappy sin SPA pesada.
- SEO/GEO natural (metadata, JSON-LD) alineado a [seo-geo.md](../architecture/seo-geo.md).
- Encaja con Cloudflare (guías oficiales Workers + Astro) y con catálogo diferido a v1.1 (menos rutas dinámicas ahora).
- Alternativas descartadas para v1: Next.js (más JS/surface de lo necesario para marketing+embed); HTML monolítico actual (peor mantenibilidad a medida que crezcan About/form/SEO).

# Consequences

- Favorece [NFR-001](../requirements/nfr-001-performance.md).
- Episodios v1 vía embed Spotify; sin CMS obligatorio ([ADR-0002](adr-0002-spotify-official-embed.md)).
- Formulario media kit: endpoint en el Worker (no SSR app completa).
- Specs API ([specs/](../specs/)) solo si aparece BFF o integración formal del form.
