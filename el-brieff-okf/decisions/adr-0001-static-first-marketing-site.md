---
type: ADR
title: ADR-0001 Static-first marketing site
description: Decisión de adoptar un sitio estático o SSG con CDN como arquitectura base del v1.
tags: [adr, architecture, hosting]
status: proposed
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Context

El producto es un sitio de marca + episodios con cadencia diaria. El tráfico es lectura/escucha; no hay transacciones ni sesiones de usuario complejas en v1. Se necesitan SEO fuerte, TTFB bajo y despliegues simples.

# Options

1. **Static / SSG + CDN** (Astro, Next static export, o similar) con contenido en MD/CMS headless.
2. **SSR full** en un runtime Node siempre encendido.
3. **WordPress / CMS monolítico** hospedado clásico.

# Trade-offs

| Opción | Pros | Contras |
|--------|------|---------|
| 1 Static/SSG | Rendimiento, costo, seguridad de superficie | CMS/editorial puede requerir build o headless |
| 2 SSR | Dinamismo fácil | Costo/ops; overkill para v1 |
| 3 WP monolítico | Editorial familiar | Deuda de performance/seguridad; menos control de diseño |

# Decision

**Pending confirmación de stakeholders:** preferencia **opción 1 (static-first / SSG + CDN)** para v1, con fuente de episodios a elegir (MD en repo o headless). Framework concreto se fija en un ADR siguiente cuando se congele el stack.

# Consequences

- Favorece [NFR-001](../requirements/nfr-001-performance.md).
- Requiere pipeline de publish para nuevos episodios (build o webhook ISR/on-demand si el framework lo permite).
- Specs API ([specs/](../specs/)) solo si aparece un BFF o CMS API consumida por el front.
