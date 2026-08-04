---
type: Reference
title: Deployment — Cloudflare Workers
description: Hosting y URL de preview/producción temporal del sitio El Brieff en Cloudflare Workers.
tags: [architecture, cloudflare, workers, hosting]
status: stable
generated: { by: agent/composer, at: 2026-08-03T21:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-03T21:00:00Z }
notes: "Git-connected Workers Builds on main (prod) + non-prod branch previews; local fallback npm run deploy."
sources:
  - id: cloudflare-api
    title: Cloudflare Workers API (account fei-d02)
    last_modified: 2026-08-03
  - id: workers-builds
    resource: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
    title: Workers Builds configuration
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
| Git production branch | `main` |
| Bindings (actual) | Ninguno requerido en el path de producción (assets-only). KV `SESSION` / Images `IMAGES` pueden aparecer en builds del adapter; no son el serving path actual |

# Workers Builds (Git → prod + PR previews)

Connect the Worker **el-brieff** to GitHub repo **`FeiPower/feipower_el-brieff-website`** (not other repos). Package manager is **npm** (`package-lock.json`); do not use `pnpm`.

| Setting | Value |
|---------|--------|
| Repository | `FeiPower/feipower_el-brieff-website` |
| Production branch | `main` |
| Builds for non-production branches | **Enabled** (PR / feature-branch preview URLs) |
| Root directory | *(empty — repo root)* |
| Build command | `npm run build` |
| Deploy command (production) | `npm run cf:deploy` |
| Non-production deploy command | `npm run cf:preview` |
| Node | `.nvmrc` → `22` (`engines.node >=22`) |

Flow ([Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)):

1. Push to `main` → build → `cf:deploy` → traffic on [workers.dev](https://el-brieff.fei-d02.workers.dev/).
2. Push to other branches / PRs → build → `cf:preview` (`wrangler versions upload`) → preview URL, not production traffic.

`cf:deploy` / `cf:preview` delete `.wrangler/deploy/config.json` before Wrangler so the adapter-generated redirect config does not replace `wrangler.jsonc` assets (`./dist/client`). Without that wipe, `/` can serve the Hello World Worker while assets look fine.

# Local / fallback deploy

```bash
npm run deploy   # build + cf:deploy
```

Equivalent CI split: `npm run build` then `npm run cf:deploy`.

# Implications

- SEO: `canonical`, `og:url` y sitemap deben usar el base URL interim hasta cutover a dominio custom.
- Formulario media kit: procesar en el mismo Worker (o binding) — ver [media-kit.md](media-kit.md).
- Stack preferido: static/SSG + Workers Static Assets (o adapter Cloudflare) — [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md).
- Dominio custom: diferido; documentar cutover en ADR/log cuando exista.

# Ops checklist (launch)

- [x] Primer deploy con assets reales (Phase 1 foundation).
- [x] HTTPS workers.dev (nativo).
- [x] Git production branch `main` + Workers Builds scripts (`cf:deploy` / `cf:preview`).
- [ ] Cloudflare dashboard: connect `FeiPower/feipower_el-brieff-website`, npm commands above, enable non-prod builds.
- [ ] GitHub default branch = `main` (deprecate `master` for new work).
- [ ] `robots.txt` + sitemap con base interim.
- [ ] Search Console / GA4 apuntando al host interim (actualizar en cutover).
- [ ] Confirm PR preview URL comments from Workers Builds GitHub integration.
