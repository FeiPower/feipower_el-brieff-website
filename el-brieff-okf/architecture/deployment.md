---
type: Reference
title: Deployment — Cloudflare Workers
description: Hosting y URL de preview/producción temporal del sitio El Brieff en Cloudflare Workers.
tags: [architecture, cloudflare, workers, hosting]
status: stable
generated: { by: agent/composer, at: 2026-08-03T21:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
notes: "Phase 1 foundation live 2026-08-03; deploy path = Astro build + wrangler assets (dist/client)."
sources:
  - id: cloudflare-api
    title: Cloudflare Workers API (account fei-d02)
    last_modified: 2026-08-03
---

# Canonical deploy target (v1 interim)

Hasta que exista dominio propio, el sitio se publica en el Worker de Cloudflare:

| Campo | Valor |
|-------|--------|
| Platform | Cloudflare Workers |
| Account workers.dev subdomain | `fei-d02` |
| Script name | `el-brieff` |
| Public URL | [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/) |
| Canonical base (interim) | `https://el-brieff.fei-d02.workers.dev` |
| Compatibility date (actual) | `2026-08-03` |
| Observability | Logs enabled |
| Assets (actual) | **live** — Static Assets from Astro `dist/client` (home HTML, `_astro/*`, cover) |
| Stack | Astro + `@astrojs/cloudflare` (build) + Wrangler (`wrangler.jsonc` name `el-brieff`) |
| Bindings (actual) | Ninguno requerido en el path de producción Phase 1 (assets-only). KV `SESSION` / Images `IMAGES` pueden aparecer en builds del adapter; no son el serving path actual |

Phase 1 foundation deploy (2026-08-03): home con hero cover-first, embed Spotify show, JSON-LD. Ya no es el placeholder “Hello World!”.

**Deploy note:** `npm run deploy` → `astro build` luego `wrangler deploy --config wrangler.jsonc` con `assets.directory: ./dist/client` y `not_found_handling: 404-page`. Se elimina `.wrangler/deploy/config.json` antes del deploy para no usar la config redirigida del adapter sola — esa ruta dejaba el Worker Hello World respondiendo `/` mientras solo assets no-HTML servían bien.

# Implications

- SEO: `canonical`, `og:url` y sitemap deben usar el base URL interim hasta cutover a dominio custom.
- Formulario media kit: procesar en el mismo Worker (o binding) — ver [media-kit.md](media-kit.md).
- Stack preferido: static/SSG + Workers Static Assets (o adapter Cloudflare) — [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md).
- Dominio custom: diferido; documentar cutover en ADR/log cuando exista.

# Ops checklist (launch)

- [x] Primer deploy con assets reales (Phase 1 foundation).
- [x] HTTPS workers.dev (nativo).
- [ ] `robots.txt` + sitemap con base interim.
- [ ] Search Console / GA4 apuntando al host interim (actualizar en cutover).
- [ ] Preview subdomain Workers: decidir si habilitar (`previews_enabled` hoy default Wrangler).
