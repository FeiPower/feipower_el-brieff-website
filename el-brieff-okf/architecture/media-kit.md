---
type: Playbook
title: Media kit — contenido y entrega PDF
description: Cómo producir y publicar el media kit profesional de El Brieff como PDF descargable vía formulario.
tags: [media-kit, press, pdf, brand, form]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:35:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
sources:
  - id: brief
    resource: ../../brieff.md
    title: Brief de producto El Brieff
  - id: design
    resource: ../../DESIGN.md
    title: DESIGN.md
  - id: cover
    resource: ../../elbrieff-cover.png
    title: Portada canónica
---

# Goal

Entregar un **media kit PDF** listo para prensa y partnerships, descargable desde el sitio **después de completar un formulario** ([FR-009](../requirements/fr-009-media-kit-pdf.md), [US-007](../stories/us-007-download-media-kit.md)).

# Recommended delivery (v1)

**PDF estático pregenerado** servido desde el sitio (`/media-kit/el-brieff-media-kit.pdf`), gated por formulario UX (URL del PDF es pública; el form es lead gate).

| Opción | Cuándo |
|--------|--------|
| A. Diseño en Figma/Canva → export PDF | Control tipográfico alto; flujo editorial familiar |
| B. HTML print-kit + build a PDF (Playwright) | Un solo source de verdad con el sitio — **elegido** |
| C. Generación server-side on demand | Fuera de alcance v1 (static-first) |

**Implementación Phase 3:** print source `src/print/media-kit.html` (no es ruta Astro) + `npm run media-kit:pdf` (`scripts/media-kit-pdf.mjs`, Playwright `devDependency`). El PDF se **commitea** en `public/media-kit/el-brieff-media-kit.pdf`. Workers Builds **no** ejecuta Playwright.

Preferencia v1: **B**. El HTML del sitio solo ofrece descarga tras envío válido del form (cuando email está habilitado); no sustituye el PDF con una página “imprimir” indexable.

# Form gate (confirmado)

| Campo | Valor |
|-------|--------|
| Contacto prensa | `arturo@strtgy.ai` |
| UX | Formulario obligatorio para obtener / descargar el PDF |
| Campos mínimos sugeridos | Nombre, email, organización (opcional), motivo (prensa / partnership / otro) |
| Destino lead | **Cloudflare Email Service** (`send_email` binding `EMAIL`): From `prensa@strtgy.ai`; **To** `arturo@strtgy.ai`, **Cc** `mar@strtgy.ai` |
| Anti-spam | Honeypot `website` + KV `RATE_LIMIT` (5 / 10 min) |
| Feature flag | `site.features.mediaKitEmailEnabled` — `false` hasta smoke ops; form UI disabled |

API: `POST /api/media-kit` (Astro endpoint) → `{ ok, downloadUrl | error }`.

# Suggested outline (páginas)

1. **Cover** — Portada canónica o wordmark EL/BRI/EFF + “Media Kit” + año.
2. **El programa** — Pitch de una frase + 1 párrafo (15 min, México y el mundo, lun–vie).
3. **El conductor** — Bio aprobada (ver abajo), `@elchearturo`; **headshot aparte: pendiente** (usar cover hasta disponer de foto; brief: [photo-brief.md](photo-brief.md)).
4. **Hechos rápidos** — Formato, idioma `es-MX`, productor (Brieffy), plataformas ([platforms.md](platforms.md)).
5. **Marca** — Cover art, colores clave de DESIGN, do/don’t breves.
6. **Contacto / partnerships** — `arturo@strtgy.ai` (Cc operativo del form: `mar@strtgy.ai`) + URL del sitio.

**No incluir métricas de audiencia** hasta que existan números aprobados (backlog v1.1 / asset plan).

## Bio aprobada (media kit + About)

Arturo Salazar Bazúa (conocido en redes sociales como @elchearturo) es un emprendedor, estratega de negocios y comunicador mexicano. Es reconocido principalmente por su rol como creador y conductor de El Brieff, uno de los podcasts diarios de noticias y actualidad empresarial más escuchados en México y Latinoamérica. Adicionalmente es cofundador STRTGY, una empresa de ingeniería de soluciones centrada en la inteligencia de decisiones. Es titular del podcast InteligencIA, donde analiza el impacto de la inteligencia artificial generativa, la automatización y la productividad en el entorno corporativo. Participa de forma habitual como conferencista, analista y panelista en foros de tecnología, innovación y emprendimiento.

Versión corta (UI): primeras 1–2 oraciones de la bio anterior.

# Site integration

- Ruta sugerida: `/media-kit` (formulario + copy).
- CTA copy: “Solicitar / descargar media kit (PDF)”.
- Nav: “Prensa” / “Media kit” o enlace desde About.
- SEO: página HTML indexable con descripción del kit; PDF no indexar como landing primaria.
- UI: prototipar en [Google Stitch](https://stitch.withgoogle.com/projects/16391393389959999592) — [stitch-ui.md](stitch-ui.md) (**aún no aprobado**).

# Brand constraints

- Colores y mood: [DESIGN.md](../../DESIGN.md).
- Asset de portada: [cover-art.md](cover-art.md) / `elbrieff-cover.png`.
- Distinguir **El Brieff** (podcast) vs **Brieffy** (productora).

# Versioning

- Nombre de archivo: `el-brieff-media-kit.pdf` (o `el-brieff-media-kit-2026.pdf` si hay cortes anuales).
- Pie de página del PDF: versión / fecha.
- Al actualizar copy o assets: reemplazar PDF + entrada en [log.md](../log.md).

# Backlog (incluido en plan; no bloquea freeze de copy)

1. Headshot editorial autorizado (aparte de cover) — brief de sesión: [photo-brief.md](photo-brief.md).
2. Métricas de audiencia publicables (sección omitida hasta entonces).

# Closed inputs

1. Email prensa / To form: `arturo@strtgy.ai`; Cc form: `mar@strtgy.ai`.
2. Bio larga aprobada (arriba).
3. Plataformas: [platforms.md](platforms.md) — URLs confirmadas.
4. Gate: formulario (no descarga anónima en un clic).
5. Backend form: Worker envía email To/Cc vía **Cloudflare Email Service** (`send_email`); flag off hasta dominio/destinos verificados.
