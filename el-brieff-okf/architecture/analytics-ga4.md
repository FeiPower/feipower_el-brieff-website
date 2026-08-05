---
type: Playbook
title: Analytics GA4 — estrategia de medición
description: Plan de tracking con Google Analytics 4 (gtag) para El Brieff — objetivos, taxonomía de eventos, funnels, privacidad e implementación.
tags: [analytics, ga4, gtag, measurement, conversion]
status: draft
generated: { by: agent/composer, at: 2026-08-05T01:12:00Z }
sources:
  - id: ga4-events
    resource: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
    title: GA4 recommended events
  - id: gtag
    resource: https://developers.google.com/tag-platform/gtagjs
    title: gtag.js
  - id: product
    resource: ../product/overview.md
    title: Product overview El Brieff
  - id: media-kit
    resource: media-kit.md
    title: Media kit playbook
---

# Goal

Medir con **precisión y bajo ruido** lo que importa para El Brieff: descubrir → escuchar/suscribir → (prensa) solicitar media kit. GA4 es la fuente de verdad web; no sustituye métricas de audiencia del podcast en Spotify/Apple (esas viven en cada plataforma).

# Property

| Campo | Valor |
|-------|--------|
| Measurement ID | `G-P2FHN490KW` |
| Stream | Web (sitio El Brieff) |
| Host canónico | `https://el-brieff.strtgy.ai` |
| Host fallback | `https://el-brieff.fei-d02.workers.dev` |
| Loader | gtag.js (sin GTM en v1) |
| Env var | `PUBLIC_GA_MEASUREMENT_ID` |
| Código actual | `src/layouts/BaseLayout.astro` + `src/lib/analytics/*` + `src/scripts/analytics-client.ts` (gtag + binder; solo páginas públicas cuando la env está definida) |
| Idioma / mercado | `es-MX` |

**Ops:** fijar `PUBLIC_GA_MEASUREMENT_ID=G-P2FHN490KW` en Workers (prod + previews según política) y en `.env` local. No hardcodear el ID en el repo si el patrón env ya existe; el valor canónico vive aquí y en el dashboard GA4.

# North-star y KPIs

Alineado a [product/overview.md](../product/overview.md).

| Prioridad | Objetivo de negocio | KPI primario (GA4) | KPI de apoyo |
|-----------|---------------------|--------------------|--------------|
| P0 | Convertir visitante en oyente | `generate_lead` **no** — usar `select_content` / outbound a plataformas + `click` listen | % sesiones con ≥1 `platform_outbound` o `listen_cta` |
| P0 | Suscripción / apertura en plataforma | Eventos `platform_outbound` (por `platform_id`) | Mix Spotify vs Apple vs resto |
| P1 | Leads de prensa / partnerships | Funnel media kit: `media_kit_form_start` → `media_kit_submit` → `media_kit_download` | Tasa de completado del form |
| P1 | Descubrimiento orgánico / social | Sesiones, usuarios, engagement rate por canal | Landing page + query (Search Console cruzado) |
| P2 | Lectura editorial (`/opinion/*`) | `page_view` + `scroll` + tiempo de engagement en artículos | Artículos top; CTR interno hacia home/escuchar |
| P3 | Calidad de tráfico | Bounce/engagement, new vs returning | Dispositivo / país (MX vs LATAM) |

**No medir en GA4 (v1):** plays reales dentro del iframe Spotify (cross-origin; sin API de eventos del embed). Proxies: llegar a `#escuchar`, clicks “Escuchar ahora” / “Abrir en Spotify”, y outbound a show URL.

# Principios de diseño

1. **Pocas conversiones, bien nombradas** — máximo 4–6 key events en Admin; el resto es diagnóstico.
2. **Taxonomía estable** — `snake_case`, nombres en inglés (convención GA4), parámetros consistentes.
3. **Cero PII en GA** — nunca enviar email, nombre, organización ni motivo libre del media kit como parámetro de evento.
4. **Una capa de instrumentación** — helper `gtag` tipado en el cliente; componentes disparan eventos, no strings sueltos.
5. **Performance first** — gtag async (ya); no bloquear LCP; no cargar GA en `/admin/*` si es posible.
6. **Static-first** — islands mínimas; listeners en CTAs existentes ([ADR-0001](../decisions/adr-0001-static-first-marketing-site.md)).
7. **Separar prod vs preview** — filtro hostname o property/stream distinto para `workers.dev` previews vs prod (recomendado: un stream + filtro de datos / Internal traffic).

# Arquitectura de medición

```text
Browser (páginas públicas)
  └─ BaseLayout → gtag.js + config(G-P2FHN490KW)
       ├─ Automatic: page_view (SPA-less: cada navegación full)
       ├─ Enhanced measurement (Admin GA4): scrolls, outbound_click, etc.
       └─ Custom: data-analytics attributes / thin client helper
            → listen_cta, platform_outbound, media_kit_*, share_*, etc.

Admin (/admin/*)
  └─ Preferir: no cargar gtag (evitar contaminar funnels)
```

**GTM:** fuera de alcance v1. Reevaluar si el stakeholder necesita tags de ads/pixels múltiples; hasta entonces gtag directo reduce latencia y superficie.

# Capas de recolección

## 1) Automático (activar en Admin)

En el data stream Web → Enhanced measurement:

| Señal | Estado recomendado | Notas El Brieff |
|-------|--------------------|-----------------|
| Page views | On | Astro MPA: OK por defecto |
| Scrolls | On | Umbral 90% — útil en About / opinión |
| Outbound clicks | On | Cubre plataformas si no hay custom; **igual** emitir custom con `platform_id` para reporting limpio |
| Site search | Off | No hay búsqueda en v1 |
| Form interactions | On (opcional) | Complementa, no sustituye, eventos media kit |
| File downloads | On | Puede capturar PDF; preferir evento canónico `media_kit_download` tras submit |

## 2) Config gtag recomendada

```js
gtag('config', 'G-P2FHN490KW', {
  anonymize_ip: true,
  send_page_view: true,
  cookie_flags: 'SameSite=None;Secure',
});
```

Opciones a evaluar en cutover a dominio custom:

- `linker` / cross-domain si Brieffy vuelve online y hay journey compartido ([FR-006](../requirements/fr-006-brieffy-crossover.md) deferred).
- Consent Mode v2 solo si se añade banner/CMP (ver Privacidad).

## 3) Eventos custom (contrato v1)

### Listen / subscribe (P0)

| Evento | Cuándo | Parámetros | Key event? |
|--------|--------|------------|------------|
| `listen_cta` | Click en CTA de escucha del sitio | `cta_id`, `cta_location`, `link_url` | **Sí** |
| `platform_outbound` | Click en enlace de plataforma (`PlatformLinks` u otro) | `platform_id`, `cta_location`, `link_url` | **Sí** |
| `listen_zone_view` | `#escuchar` entra en viewport (≥50%, 1×/sesión) | `engagement_source` = `intersection` | No (diagnóstico) |

Valores canónicos:

| Parámetro | Valores |
|-----------|---------|
| `cta_id` | `escuchar_ahora` \| `abrir_spotify` \| `abrir_spotify_fallback` \| `nav_escuchar` |
| `cta_location` | `hero` \| `nav` \| `listen_zone` \| `platform_links` \| `footer` \| `about` \| `media_kit` \| `opinion` |
| `platform_id` | `spotify` \| `apple` \| `deezer` \| `iheart` \| `radionet` (ids de [site.ts](../../src/config/site.ts)) |

Mapeo UI actual:

| UI | Evento | Params |
|----|--------|--------|
| Hero “Escuchar ahora” (`#escuchar`) | `listen_cta` | `cta_id=escuchar_ahora`, `cta_location=hero` |
| Hero “Abrir en Spotify” | `listen_cta` + implícito Spotify | `cta_id=abrir_spotify`, `cta_location=hero` |
| Nav “Escuchar” | `listen_cta` | `cta_id=nav_escuchar`, `cta_location=nav` |
| Fallback / noscript Spotify | `listen_cta` | `cta_id=abrir_spotify_fallback`, `cta_location=listen_zone` |
| `PlatformLinks` | `platform_outbound` | `platform_id` + `cta_location` según página |

### Media kit (P1)

| Evento | Cuándo | Parámetros | Key event? |
|--------|--------|------------|------------|
| `media_kit_form_start` | Primer focus/input en el form | `form_id=media_kit` | No |
| `media_kit_submit` | Submit OK (respuesta `{ ok: true }`) | `form_id`, `reason_bucket` (`prensa`\|`partnership`\|`otro`\|`empty`) | **Sí** |
| `media_kit_submit_error` | Submit fallido (validación / API / rate limit) | `form_id`, `error_code` (sin mensaje libre con PII) | No |
| `media_kit_download` | Click/inicio de descarga del PDF post-gate | `file_name`, `form_id` | **Sí** |

`reason_bucket` es el `<select>` enum — no texto libre. Nunca `email` / `name`.

### Editorial / opinión (P2)

| Evento | Cuándo | Parámetros | Key event? |
|--------|--------|------------|------------|
| `article_read` | Scroll ≥75% **o** engagement ≥30s en `/opinion/[slug]` | `article_slug`, `content_type=opinion` | No |
| `select_content` (recomendado GA4) | Click CTA “Escuchar” / home desde artículo | `content_type`, `item_id` | Opcional |

### Social / brand (P2)

| Evento | Cuándo | Parámetros |
|--------|--------|------------|
| `social_outbound` | Click Instagram `@elbrieff` u otros | `network=instagram`, `cta_location` |

# Dimensiones y métricas custom (Admin)

Registrar en GA4 Admin → Custom definitions (event-scoped salvo nota):

| Dimension | Scope | Event param | Uso |
|-----------|-------|-------------|-----|
| Platform ID | Event | `platform_id` | Mix de plataformas |
| CTA location | Event | `cta_location` | Dónde convierte |
| CTA ID | Event | `cta_id` | Qué CTA |
| Content type | Event | `content_type` | `marketing` \| `opinion` \| `press` |
| Article slug | Event | `article_slug` | Top columnas |
| Reason bucket | Event | `reason_bucket` | Mix prensa vs partnership |

User properties v1: **ninguna** (sin login de oyentes).

# Conversiones (Key events)

Marcar en Admin (orden de negocio):

1. `platform_outbound`
2. `listen_cta` (alternativa: solo subset `abrir_spotify` vía audiencia — si hay ruido por scroll-to-listen, restringir key event a `cta_id` ∈ {`abrir_spotify`, `abrir_spotify_fallback`} + todos los `platform_outbound`)
3. `media_kit_submit`
4. `media_kit_download`

Recomendación de ruido: **key events de escucha** = `platform_outbound` + `listen_cta` donde `cta_id` sea outbound real a Spotify/plataformas; dejar `escuchar_ahora` (anchor interno) como evento normal, no key event.

# Funnels y exploraciones

Crear en Explorations (plantillas):

1. **Listen funnel (home)**  
   `session_start` → `page_view` (home) → `listen_cta` (`escuchar_ahora`) → `listen_zone_view` → `listen_cta` (`abrir_spotify*`) **o** `platform_outbound`.

2. **Platform mix**  
   Free-form: event `platform_outbound` breakdown por `platform_id`, `cta_location`, device, session default channel group.

3. **Press funnel**  
   `page_view` `/media-kit` → `media_kit_form_start` → `media_kit_submit` → `media_kit_download`.

4. **Opinion → listen**  
   `page_view` opinion → `article_read` → `listen_cta` / `platform_outbound`.

5. **Acquisition → convert**  
   Channel group / campaign → key events (validar UTMs).

# UTMs y campañas

Convención obligatoria para links salientes del equipo (IG, newsletter, LinkedIn, WhatsApp, ads):

```text
https://el-brieff.strtgy.ai/?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<optional>
```

| Campo | Valores ejemplo |
|-------|-----------------|
| `utm_source` | `instagram`, `linkedin`, `newsletter`, `whatsapp`, `spotify_show_notes`, `pr` |
| `utm_medium` | `social`, `email`, `referral`, `bio`, `cpc` |
| `utm_campaign` | `launch_v1`, `episode_YYYYMMDD`, `media_kit_outreach` |
| `utm_content` | `story_swipe`, `link_in_bio`, `cta_listen` |

Reglas:

- Un link de bio / highlight = UTM estable (no regenerar cada semana).
- Episodio del día: `utm_campaign=episode_YYYYMMDD`.
- Tras cutover de dominio: mismos params; actualizar base URL en [deployment.md](deployment.md).

# Privacidad y compliance

Contexto: audiencia principal México; sitio marketing sin cuenta de usuario.

| Práctica | v1 |
|----------|-----|
| No enviar PII a GA | **Obligatorio** |
| IP anonymization | On (`anonymize_ip`) |
| Excluir `/admin/*` del tag | **Requerido** en implementación |
| Cookie consent banner | **Diferido** hasta requerimiento legal/stakeholder; documentar decisión |
| Consent Mode v2 | Solo si hay CMP |
| Retención GA4 | 14 meses (recomendado) |
| Data sharing Google Signals | Off salvo necesidad ads |
| Aviso en política de privacidad | Incluir GA4 + Measurement ID / fines (cuando exista página legal) |

Media kit: el lead (email/nombre) vive en email/KV ops — **fuera** de GA4.

# Calidad de datos

| Control | Acción |
|---------|--------|
| Internal traffic | Definir regla Internal traffic (oficina / VPN) + filtro en vista reporting |
| Developers | `debug_mode: true` solo en local / query `?debug_ga=1` |
| Bots | Usar filtro de bots GA4 |
| Previews Workers | Hostname filter o audiencia “exclude `*-preview*` / non-canonical host” |
| Validación | GA4 DebugView + Tag Assistant al instrumentar cada evento |
| Sampling | Preferir eventos key + Explorations; evitar BigQuery hasta volumen |

# Implementación (plan técnico)

Orden sugerido (sin bloquear launch si solo hay pageviews):

### Phase A — Foundation (ya parcial)

- [x] Hook gtag en `BaseLayout` vía `PUBLIC_GA_MEASUREMENT_ID` (config: `anonymize_ip`, `send_page_view`, `cookie_flags`; `debug_mode` con `?debug_ga=1`)
- [ ] Setear `G-P2FHN490KW` en Cloudflare Workers Builds / Worker env (prod) — **human ops / soft gate** (Astro bake-time `PUBLIC_*`)
- [ ] Verificar hits en Realtime / DebugView en host interim — **human ops**
- [ ] Activar Enhanced measurement (scroll + outbound) — **human ops (GA Admin)**
- [ ] Registrar custom dimensions — **human ops (GA Admin)**
- [ ] Marcar key events — **human ops (GA Admin)**
- [ ] Checklist Search Console + GA4 en [deployment.md](deployment.md) — **human ops**

### Phase B — Conversion events (prioridad producto)

- [x] Helper cliente `src/lib/analytics/gtag.ts` (`trackEvent(name, params)`) + binder `bind.ts` + client `src/scripts/analytics-client.ts`
- [x] `data-analytics-*` o listeners en `Hero`, `SpotifyEmbed`, `PlatformLinks`, header nav, About
- [x] Media kit form: start / submit / error / download (cuando `mediaKitEmailEnabled`; helpers en `media-kit.ts`)
- [x] Excluir gtag / analytics client en rutas `/admin/*`
- [x] Tests ligeros: helper no lanza si `gtag` ausente; params sin PII (`tests/analytics/*`)

### Phase C — Editorial + reporting

- [x] `article_read` en `/opinion/[slug]` (código: `src/lib/analytics/article-read.ts`)
- [ ] Explorations (funnels arriba) — **human ops (GA Admin)**
- [ ] Dashboard Looker Studio (opcional): North-star + platform mix + press funnel
- [ ] Documentar baseline 2 semanas post-launch para media kit metrics (hoy bloqueadas sin datos aprobados)

### Phase D — Dominio custom / ads (futuro)

- [ ] Actualizar stream URL / dominio
- [ ] Revisitar Consent Mode
- [ ] Cross-domain Brieffy si aplica
- [ ] GTM solo si hay stack de tags > gtag

# Contrato de instrumentación (snippet)

Patrón preferido (implementación futura):

```ts
// src/lib/analytics/gtag.ts (orientativo)
type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', name, params);
}
```

Markup sugerido en CTAs:

```html
<a
  href="..."
  data-analytics-event="platform_outbound"
  data-analytics-platform-id="spotify"
  data-analytics-cta-location="platform_links"
>
  Spotify
</a>
```

Un único listener delegado en `document` reduce islas JS.

# Relación con requisitos

| Doc | Rol |
|-----|-----|
| [NFR-006 Analytics GA4](../requirements/nfr-006-analytics-ga4.md) | Requisitos medibles de instrumentación |
| [FR-004](../requirements/fr-004-platform-subscribe.md) / [US-003](../stories/us-003-subscribe-platforms.md) | Superficie de `platform_outbound` |
| [FR-009](../requirements/fr-009-media-kit-pdf.md) / [US-007](../stories/us-007-download-media-kit.md) | Funnel media kit |
| [FR-001](../requirements/fr-001-landing-hero.md) / [US-001](../stories/us-001-discover-latest-episode.md) | CTAs hero / listen zone |
| [NFR-001](../requirements/nfr-001-performance.md) | gtag no debe degradar LCP/INP |
| [seo-geo.md](seo-geo.md) | Adquisición orgánica; GA4 mide post-click |

# Anti-patrones (prohibido)

- Enviar email/nombre del form a GA “para segmentar”.
- Duplicar el mismo click como 4 eventos redundantes sin params distintivos.
- Contar pageview manual + automático (doble conteo).
- Usar Universal Analytics / `analytics.js`.
- Depender de plays del iframe Spotify como verdad de escucha.
- Instrumentar cada hover/mousemove.
- IDs de medición distintos por developer sin documentar (caos de streams).

# Definition of done (analytics v1)

- [ ] Hits reales en property `G-P2FHN490KW` desde prod interim.
- [ ] Enhanced measurement on.
- [ ] Eventos P0 (`listen_cta`, `platform_outbound`) en DebugView con params canónicos.
- [ ] Key events configurados según sección Conversiones.
- [ ] Admin sin gtag.
- [ ] Sin PII en payloads (revisión manual Tag Assistant).
- [ ] Al menos un Exploration de listen funnel guardado en la property.

# Open questions

1. ¿Banner de cookies / CMP obligatorio para el stakeholder antes de ads? → default v1: sin banner; revisit.
2. ¿Un solo stream para preview + prod, o streams separados? → default: un stream + filtros hostname.
3. ¿Looker Studio owned by STRTGY o Arturo? → fuera de código; definir owner en roles si se crea dashboard.
4. ¿Activar Google Signals? → default Off.
