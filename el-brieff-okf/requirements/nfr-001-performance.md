---
type: Non-Functional Requirement
title: NFR-001 Performance
description: El sitio debe cumplir umbrales de rendimiento orientados a Core Web Vitals en móvil.
tags: [nfr, performance, cwv]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Targets (móvil, campo o lab representativo)

| Métrica | Umbral v1 |
|---------|-----------|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| TTFB | ≤ 800 ms (origen) |

# Constraints

- Imágenes con tamaño intrínseco y formatos modernos (AVIF/WebP) cuando sea viable.
- JS mínimo en el camino crítico del home.
- Hosting con CDN / edge preferido (ver arquitectura).
