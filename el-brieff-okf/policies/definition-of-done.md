---
type: Policy
title: Definition of Done
description: Condiciones que debe cumplir un incremento (historia o FR) antes de considerarse terminado.
tags: [policy, quality]
status: draft
generated: { by: agent/composer, at: 2026-08-03T20:00:00Z }
---

# Policy

Un ítem (User Story o FR implementado) está **Done** solo si:

1. **Acceptance Criteria** de la story están verificados y marcados.
2. Cumple NFRs aplicables tocados por el cambio (al menos chequeo Lighthouse/axe en rutas afectadas).
3. Responsive verificado en viewport móvil (~360px) y desktop.
4. Metadatos SEO (FR-007) presentes si la ruta es pública nueva; JSON-LD (FR-008) si la ruta está en el alcance de schema.
5. Copy e identidad alineados al brief / DESIGN (sin inventar claims de marca).
6. Sin secretos en el repo; enlaces de plataformas desde config.
7. Documentación OKF actualizada si el cambio altera alcance, ADR, SEO/GEO o glosario.
8. Revisado por el rol responsable ([roles](../roles/)).
9. Si toca home/about/episodio: checklist SEO+GEO del [playbook](../architecture/seo-geo.md) (markup = contenido visible; sin hacks llms-only).

# Out of Done

- “Funciona en mi máquina” sin preview desplegable.
- Placeholders visibles en producción (`lorem`, TODOs de UI).
