---
type: Non-Functional Requirement
title: NFR-002 Accessibility
description: Cumplir WCAG 2.2 AA en flujos principales del sitio.
tags: [nfr, a11y, wcag]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Targets

- Contraste de texto según WCAG 2.2 AA.
- Navegación por teclado en home, catálogo y detalle.
- Textos alternativos en imágenes informativas; decorativas marcadas como tales.
- Landmarks y headings semánticos.

# Verification

- Auditoría automatizada (axe/lighthouse) + pase manual de teclado en rutas críticas.
