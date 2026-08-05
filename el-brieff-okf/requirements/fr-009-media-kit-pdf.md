---
type: Functional Requirement
title: FR-009 Media kit PDF
description: Media kit profesional de El Brieff en PDF, accesible tras completar un formulario en el sitio.
tags: [fr, media-kit, press, pdf, form]
status: partial
generated: { by: agent/composer, at: 2026-08-03T20:35:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
---

# Statement

El sitio debe ofrecer un **media kit profesional** de El Brieff en **PDF**. La descarga / entrega se obtiene **tras completar un formulario** en una ubicación discoverable (About y/o `/media-kit`), con contenido alineado a marca ([DESIGN.md](../../DESIGN.md), [cover-art](../architecture/cover-art.md)).

# Content (mínimo v1)

| Bloque | Contenido |
|--------|-----------|
| Portada / marca | Wordmark o portada canónica; nombre El Brieff |
| Elevator pitch | Propuesta: 15 min / día; México y el mundo; lun–vie |
| Conductor | Bio aprobada Arturo Salazar Bazúa + `@elchearturo` + cover (headshot aparte en backlog) |
| Formato | Duración, cadencia, idioma `es-MX` |
| Productor | Brieffy + URL |
| Plataformas | Spotify, Apple Podcasts, Deezer, iHeart, radio.net |
| Assets | Cover art y uso de marca (do/don't resumidos) |
| Contacto | `arturo@strtgy.ai` |

Omitir métricas de audiencia hasta datos aprobados (backlog).

# Formulario

- Campos mínimos: nombre, email; opcionales: organización, motivo (prensa / partnership / otro).
- Tras envío válido: permitir descarga del PDF y/o enviar enlace al email.
- Notificar lead por email: To `arturo@strtgy.ai`, Cc `mar@strtgy.ai`.
- Anti-spam en Worker (honeypot + rate limit).

# Delivery

- Archivo PDF versionado (p. ej. `assets/media-kit/el-brieff-media-kit.pdf`).
- Página `/media-kit` con resumen + formulario (no descarga anónima en un clic).
- Detalle: [architecture/media-kit.md](../architecture/media-kit.md).

# Acceptance outline

- [ ] PDF profesional (tipografía, contraste, márgenes, sin placeholders visibles).
- [ ] Identidad cover-first / DESIGN.
- [ ] Formulario visible en `/media-kit` (o equivalente) enlazado desde nav o About.
- [ ] Tras submit válido, el visitante obtiene el PDF (download inmediato y/o email).
- [ ] Lead notificado por email: To `arturo@strtgy.ai`, Cc `mar@strtgy.ai`.
- [ ] Archivo con URL estable; peso razonable (~5 MB).
- [ ] Metadatos del PDF: título “El Brieff — Media Kit”, idioma es.
- [ ] Versión / fecha de vigencia en el documento.

# Links

- Story: [us-007](../stories/us-007-download-media-kit.md)
- Playbook: [media-kit](../architecture/media-kit.md)
- About: [fr-005](fr-005-about-host.md)
