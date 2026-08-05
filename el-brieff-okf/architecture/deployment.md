---
type: Reference
title: Deployment — Cloudflare Workers
description: Hosting y URL de producción del sitio El Brieff en Cloudflare Workers + dominio custom.
tags: [architecture, cloudflare, workers, hosting]
status: stable
generated: { by: agent/composer, at: 2026-08-03T21:00:00Z }
verified: { by: human:stakeholder, at: 2026-08-04T20:26:00Z }
notes: "Prod canonical https://el-brieff.strtgy.ai/; workers.dev remains fallback. Git-connected Workers Builds on main + non-prod branch previews."
sources:
  - id: cloudflare-api
    title: Cloudflare Workers API (account fei-d02)
    last_modified: 2026-08-03
  - id: workers-builds
    resource: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
    title: Workers Builds configuration
---

# Canonical deploy target (producción)

| Campo | Valor |
|-------|--------|
| Platform | Cloudflare Workers |
| Account workers.dev subdomain | `fei-d02` |
| Script name | `el-brieff` |
| **Canonical production URL** | [https://el-brieff.strtgy.ai/](https://el-brieff.strtgy.ai/) |
| Canonical base (SEO / Astro `site`) | `https://el-brieff.strtgy.ai` |
| Fallback workers.dev | [https://el-brieff.fei-d02.workers.dev/](https://el-brieff.fei-d02.workers.dev/) |
| Compatibility date (actual) | `2026-08-03` |
| Observability | Logs enabled |
| Assets (actual) | **live** — Static Assets from Astro `dist/client` (home HTML, `_astro/*`, cover) |
| Stack | Astro + `@astrojs/cloudflare` (build) + Wrangler (`wrangler.jsonc` name `el-brieff`) |
| Git production branch | `main` |
| Bindings (actual) | `EMAIL` (`send_email`: from `prensa@strtgy.ai`; To/Cc arturo+mar); KV `RATE_LIMIT` (`el-brieff-RATE_LIMIT`). Adapter puede inyectar `SESSION` / `IMAGES`. Form media kit gated por `mediaKitEmailEnabled` (default false hasta Email ops). |

# Workers Builds (Git → prod + PR previews)

Connect the Worker **el-brieff** to GitHub repo **`FeiPower/feipower_el-brieff-website`** (not other repos). Package manager is **npm** (`package-lock.json`); do not use `pnpm`.

| Setting | Value |
|---------|--------|
| Repository | `FeiPower/feipower_el-brieff-website` |
| Production branch | `main` |
| Builds for non-production branches | **Enabled** (PR / feature-branch preview URLs) |
| Root directory | *(empty — repo root)* |
| Build command | `npm run build` |
| Deploy command (production) | `npm run cf:deploy` → `wrangler deploy --config dist/server/wrangler.json` (adapter-generated; do not set `main` in root `wrangler.jsonc` — that breaks clean `astro build`) |
| Non-production deploy command | `npm run cf:preview` → `wrangler versions upload --config dist/server/wrangler.json` |
| Node | `.nvmrc` → `22` (`engines.node >=22`) |

Flow ([Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)):

1. Push to `main` → build → `cf:deploy` → traffic on [el-brieff.strtgy.ai](https://el-brieff.strtgy.ai/) (custom domain) and [workers.dev](https://el-brieff.fei-d02.workers.dev/).
2. Push to other branches / PRs → build → `cf:preview` (`wrangler versions upload`) → preview URL, not production traffic.

`cf:deploy` / `cf:preview` delete `.wrangler/deploy/config.json` before Wrangler so the adapter-generated redirect config does not replace `wrangler.jsonc` assets (`./dist/client`). Without that wipe, `/` can serve the Hello World Worker while assets look fine.

# Custom domain

- Hostname: `el-brieff.strtgy.ai` under zone `strtgy.ai`.
- Attach Custom Domain / route to Worker `el-brieff` in Cloudflare dashboard (or Wrangler `routes` when frozen).
- DNS: CNAME/AAAA per Cloudflare Workers custom domains docs.
- SEO: `astro.config.mjs` `site` + `site.siteUrl` = `https://el-brieff.strtgy.ai` (canonical, `og:url`, sitemap, robots, JSON-LD).

# Local / fallback deploy

```bash
npm run deploy   # build + cf:deploy
```

Equivalent CI split: `npm run build` then `npm run cf:deploy`.

# Implications

- SEO: `canonical`, `og:url` y sitemap usan `https://el-brieff.strtgy.ai`.
- Formulario media kit: procesar en el mismo Worker (o binding) — ver [media-kit.md](media-kit.md).
- Stack preferido: static/SSG + Workers Static Assets (o adapter Cloudflare) — [ADR-0001](../decisions/adr-0001-static-first-marketing-site.md).
- workers.dev sigue vivo como fallback/ops; no es el host canónico.

# Ops checklist (launch)

- [x] Primer deploy con assets reales (Phase 1 foundation).
- [x] HTTPS workers.dev (nativo).
- [x] Git production branch `main` + Workers Builds scripts (`cf:deploy` / `cf:preview`).
- [x] Cloudflare dashboard: connected `FeiPower/feipower_el-brieff-website`; build `npm run build`; deploy `npm run cf:deploy`; version `npm run cf:preview`; non-prod builds enabled.
- [x] GitHub default branch = `main`.
- [x] Canonical base URL = `https://el-brieff.strtgy.ai` en código (`site.ts`, `astro.config.mjs`).
- [ ] Custom domain `el-brieff.strtgy.ai` attached to Worker `el-brieff` + DNS verde.
- [ ] `robots.txt` + sitemap verificados en host canónico.
- [ ] Search Console / GA4 stream apuntando a `https://el-brieff.strtgy.ai`.
- [ ] **Build-time env (soft gate):** set Workers Builds / Worker env `PUBLIC_GA_MEASUREMENT_ID=G-P2FHN490KW` for production (and previews per policy). Astro bakes `PUBLIC_*` at `npm run build` — without this, prod HTML has no gtag. **2026-08-04:** in-session approval granted; remote upsert via Builds API failed (`Authentication error` — Wrangler OAuth lacks Workers CI Write). Residual: Dashboard → Worker `el-brieff` → Settings → Build variables and secrets → add `PUBLIC_GA_MEASUREMENT_ID=G-P2FHN490KW` (non-secret), then rebuild. Validate Realtime after deploy — playbook [analytics-ga4.md](analytics-ga4.md) / [NFR-006](../requirements/nfr-006-analytics-ga4.md). Local: copy from `.env.example`.
- [ ] Confirm PR preview URL comments from Workers Builds GitHub integration.
