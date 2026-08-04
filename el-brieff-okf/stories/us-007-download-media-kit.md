---
type: User Story
title: US-007 Download media kit
description: Como periodista o partner, quiero solicitar el media kit en PDF mediante un formulario para cubrir o proponer colaboraciones con El Brieff.
tags: [story, media-kit, press, pdf, form]
status: partial
generated: { by: agent/composer, at: 2026-08-03T20:35:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
---

# Story

**Como** periodista, marca o partner  
**Quiero** completar un formulario y obtener el media kit profesional en PDF  
**Para** obtener bio, propuesta, assets y contacto de forma trazable.

# Acceptance Criteria

- [x] AC1: Existe una sección o página “Media kit” / “Prensa” enlazada desde nav o About.
- [x] AC2: Un formulario recoge al menos nombre y email; el CTA no entrega el PDF sin envío válido (form disabled hasta Email ops).
- [ ] AC3: Tras envío válido, el PDF es descargable (y/o llega por email). — pendiente smoke Email Service.
- [x] AC4: El PDF incluye pitch, conductor (bio aprobada), formato, productor, plataformas y contacto `arturo@strtgy.ai`.
- [x] AC5: Visual coherente con [DESIGN.md](../../DESIGN.md) y portada canónica.
- [x] AC6: En móvil, formulario (disabled) y PDF estático en ruta pública existen.
- [ ] AC7: El equipo recibe el lead por email: To `arturo@strtgy.ai`, Cc `mar@strtgy.ai`. — pendiente `mediaKitEmailEnabled` + ops.

# Links

- FR: [fr-009](../requirements/fr-009-media-kit-pdf.md)
- Playbook: [media-kit](../architecture/media-kit.md)
