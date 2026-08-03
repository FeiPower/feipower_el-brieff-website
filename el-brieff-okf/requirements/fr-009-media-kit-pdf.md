---
type: Functional Requirement
title: FR-009 Media kit PDF
description: Media kit profesional de El Brieff disponible para descarga en PDF desde el sitio.
tags: [fr, media-kit, press, pdf]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:35:00Z }
---

# Statement

El sitio debe ofrecer un **media kit profesional** de El Brieff en **PDF**, descargable en un clic desde una ubicación discoverable (About y/o sección Prensa / Media), con contenido alineado a marca ([DESIGN.md](../../DESIGN.md), [cover-art](../architecture/cover-art.md)).

# Content (mínimo v1)

| Bloque | Contenido |
|--------|-----------|
| Portada / marca | Wordmark o portada canónica; nombre El Brieff |
| Elevator pitch | Propuesta: 15 min / día; México y el mundo; lun–vie |
| Conductor | Bio corta Arturo Salazar + `@elchearturo` + foto autorizada |
| Formato | Duración, cadencia, idioma |
| Productor | Brieffy + URL |
| Plataformas | Enlaces oficiales de escucha (cuando estén confirmados) |
| Assets | Referencia a cover art y uso de marca (do/don't resumidos) |
| Contacto | Email / canal de prensa o partnerships (a confirmar) |

Opcional v1 / v1.1: audiencia/demográficos, métricas de alcance, temas recurrentes, logos en vector — solo si hay datos reales (no inventar).

# Delivery

- Archivo PDF versionado en el repo o artefactos de build (p. ej. `assets/media-kit/el-brieff-media-kit.pdf`).
- Enlace de descarga con `download` (o equivalent) y nombre de archivo claro.
- Página o ancla HTML “Media kit” con resumen + CTA de descarga (no solo un link huérfano en footer).
- Detalle de contenido y proceso: [architecture/media-kit.md](../architecture/media-kit.md).

# Acceptance outline

- [ ] PDF profesional (tipografía, contraste, márgenes, sin placeholders visibles).
- [ ] Identidad cover-first / DESIGN (sin paleta genérica ajena).
- [ ] CTA de descarga visible en About o ruta `/media-kit` (o equivalente).
- [ ] Archivo accesible por URL estable; peso razonable (objetivo &lt; ~5 MB sin fotos innecesarias).
- [ ] Metadatos del PDF: título “El Brieff — Media Kit”, idioma es.
- [ ] Versión / fecha de vigencia indicada en el documento (p. ej. “2026”).

# Links

- Story: [us-007](../stories/us-007-download-media-kit.md)
- Playbook: [media-kit](../architecture/media-kit.md)
- About: [fr-005](fr-005-about-host.md)
