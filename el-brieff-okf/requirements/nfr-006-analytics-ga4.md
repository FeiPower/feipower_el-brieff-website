---
type: Requirement
id: NFR-006
title: Analytics GA4
description: Instrumentación Google Analytics 4 (gtag) para medir descubrimiento, conversión a plataformas y leads de media kit sin PII ni degradación de performance.
tags: [nfr, analytics, ga4]
status: draft
generated: { by: agent/composer, at: 2026-08-05T01:12:00Z }
---

# Statement

El sitio público **debe** emitir medición GA4 vía gtag (`G-P2FHN490KW`) suficiente para evaluar los KPIs de producto (escucha/suscripción y media kit), sin enviar PII y sin degradar Core Web Vitals.

# Acceptance criteria

- [x] AC1: gtag carga en páginas públicas solo cuando `PUBLIC_GA_MEASUREMENT_ID` está definido; Measurement ID canónico documentado en [analytics-ga4.md](../architecture/analytics-ga4.md). **Code-addressed** (`BaseLayout` + `.env.example`); prod env still ops.
- [x] AC2: Eventos P0 `listen_cta` y `platform_outbound` con parámetros canónicos (`cta_id` / `platform_id` / `cta_location`) verificables en DebugView. **Code-addressed** (attrs + binder); DebugView confirmation remains **human**.
- [x] AC3: Funnel media kit emite `media_kit_form_start`, `media_kit_submit` (y error) y `media_kit_download` cuando el form está habilitado; **sin** email/nombre/organización en params. **Code-addressed**.
- [x] AC4: Rutas `/admin/*` no cargan gtag. **Code-addressed** (`analyticsEnabled` gate).
- [ ] AC5: Key events configurados en Admin según playbook (platform + listen outbound + media kit). **Human ops (GA Admin)** — out of repo.
- [x] AC6: Cumple [NFR-001](nfr-001-performance.md) — script async; no bloquea LCP de forma medible vs baseline sin GA en Lighthouse mobile. **Code-addressed** (gtag remains `async`); Lighthouse optional smoke.

# Out of scope (v1)

- Google Tag Manager
- Consent Mode / CMP (salvo decisión stakeholder)
- Plays dentro del iframe Spotify
- BigQuery export
- User-ID / login de oyentes

# Links

- Playbook: [architecture/analytics-ga4.md](../architecture/analytics-ga4.md)
- Product KPIs: [product/overview.md](../product/overview.md)
- Related: [FR-004](fr-004-platform-subscribe.md), [FR-009](fr-009-media-kit-pdf.md), [NFR-001](nfr-001-performance.md)
