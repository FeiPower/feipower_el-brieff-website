---
name: Phase 3 Convert Trust
overview: "Agent-ready Ideal Phase 3: platforms, About, media kit (Astro API + CF send_email + KV + Playwright PDF); Brieffy bridge omitted; form disabled until Email ops."
todos:
  - id: task-1
    content: "Extend site.ts with bios, press.from, features.mediaKitEmailEnabled, producer without live URL"
    status: completed
  - id: task-2
    content: "Update SiteHeader nav (Acerca, Prensa) and Escuchar to /#escuchar"
    status: completed
  - id: task-3
    content: "Unlink Brieffy in SiteFooter (text-only attribution)"
    status: completed
  - id: task-4
    content: "Create PlatformLinks.astro text-link list from site.platforms"
    status: completed
  - id: task-5
    content: "Mount PlatformLinks on home below SpotifyEmbed"
    status: completed
  - id: task-6
    content: "Create about.astro Ideal composition with FR-007 metadata"
    status: completed
  - id: task-7
    content: "Extend JsonLd for About without Brieffy url/sameAs"
    status: completed
  - id: task-8
    content: "Build media-kit print HTML + Playwright script + committed PDF"
    status: completed
  - id: task-9
    content: "Wire wrangler EMAIL+KV bindings and POST /api/media-kit"
    status: completed
  - id: task-10
    content: "Create media-kit.astro page with gated form UI"
    status: completed
  - id: task-11
    content: "Update OKF statuses, delivery-plan, log, media-kit playbook"
    status: completed
  - id: task-12
    content: "Build, deploy, and verify Phase 3 AC (US-007 partial until email smoke)"
    status: completed
isProject: false
---

## Plan: Phase 3 — Convert & trust

### Context
- Files to Read: `src/config/site.ts`, `src/pages/index.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/JsonLd.astro`, `src/components/SpotifyEmbed.astro`, `src/components/Hero.astro`, `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`, `src/styles/global.css`, `wrangler.jsonc`, `package.json`, `astro.config.mjs`, `DESIGN.md`, `el-brieff-okf/architecture/media-kit.md`, `el-brieff-okf/architecture/platforms.md`, `el-brieff-okf/architecture/deployment.md`, `el-brieff-okf/requirements/fr-004-platform-subscribe.md`, `el-brieff-okf/requirements/fr-005-about-host.md`, `el-brieff-okf/requirements/fr-009-media-kit-pdf.md`, `el-brieff-okf/stories/us-003-subscribe-platforms.md`, `el-brieff-okf/stories/us-004-learn-about-show.md`, `el-brieff-okf/stories/us-007-download-media-kit.md`, `prototypes/stitch/acerca_de_el_brieff_desktop/code.html`
- Files to Modify: listed per task below; global set in Expected Artifacts
- Active Rules: none under `.cursor/rules/` (N/A — folder absent); follow user frontend-design rules + Render/Workers port notes when deploying
- Reference Docs: `@Docs` Cloudflare Email Service Workers API https://developers.cloudflare.com/email-service/api/send-emails/workers-api/ ; `@Docs` Cloudflare send bindings https://developers.cloudflare.com/email-service/configuration/send-bindings/ ; `@Docs` Astro Cloudflare adapter https://docs.astro.build/en/guides/integrations-guide/cloudflare/ ; `@Docs` Playwright https://playwright.dev/docs/api/class-page#page-pdf ; OKF media-kit / platforms / delivery-plan
- Past Chats: Phase 2 closed; Brieffy bridge omitted; Ideal clarify answers locked 2026-08-04
- Skills / Agents to Leverage: `agentic-plan-execute` (after Build approval); `agentic-plan-verify` (post-deploy); Cloudflare docs MCP if binding schema drifts

### Ideal Path Assumptions
- Posture: Ideal
- Leverage assumed: existing `site.platforms` / `site.press`; Astro + `@astrojs/cloudflare`; Cloudflare Email Service + KV; Playwright PDF; DESIGN tokens; Stitch About as structure inspiration only
- Compromiso (if any): (1) Form ships **disabled** until Email Service ops smoke — debt: US-007 partial; exit: flip `mediaKitEmailEnabled` after To/Cc received. (2) PDF is public static URL — debt: not cryptographically gated; exit: only if leak becomes a problem. (3) Cover substitutes for headshot — debt: weaker About portrait; exit: photo-brief session delivers asset.
- STRTGY grounding: N/A — not a Geointelligence plan

### Decision Records (ADR)

#### ADR-1: Astro API endpoint for media-kit form
- Context: Need POST handler on Astro + Workers without a second deploy surface
- Decision: Ideal — `src/pages/api/media-kit.ts`
- Alternatives rejected: Separate Worker script + assets
- Consequences / debt: Must ensure adapter exposes server routes alongside Static Assets
- Source: clarify Q-1-1

#### ADR-2: Build-only print kit source
- Context: PDF HTML must not become an indexable page
- Decision: Ideal — `src/print/media-kit.html` (not routed)
- Alternatives rejected: Public `/media-kit/print` with noindex
- Consequences / debt: PDF script must resolve file from disk
- Source: clarify Q-1-2

#### ADR-3: Cloudflare Email Service from-address
- Context: Native email without Resend/Brevo
- Decision: Ideal — `send_email` binding; `from: prensa@strtgy.ai`; To `arturo@strtgy.ai`; Cc `mar@strtgy.ai`; destinations verified in Email Routing
- Alternatives rejected: Resend, Brevo, unrestricted Email Sending without verified destinations
- Consequences / debt: Ops must onboard `strtgy.ai` (or correct zone) on CF DNS in `fei-d02` before enabling form
- Source: clarify Q-2-1; user chose CF native

#### ADR-4: JSON form contract
- Context: Typed request/response across UI and API
- Decision: Ideal — JSON body + `{ ok, downloadUrl | error }` (see Data Contracts)
- Alternatives rejected: multipart + redirect-only
- Consequences / debt: Client must `fetch` JSON and trigger download
- Source: clarify Q-2-2

#### ADR-5: Anti-spam honeypot + KV
- Context: Durable rate limit across Worker isolates
- Decision: Ideal — honeypot field `website` + KV binding `RATE_LIMIT`
- Alternatives rejected: honeypot-only; Turnstile now; in-memory counters
- Consequences / debt: Requires KV namespace create in CF account / wrangler
- Source: clarify Q-2-3

#### ADR-6: Public PDF + UX lead gate
- Context: Static-first ADR-0001 vs cryptographic gate
- Decision: Ideal — public `/media-kit/el-brieff-media-kit.pdf`; form is lead/UX gate only
- Alternatives rejected: Signed/short-lived tokens
- Consequences / debt: Direct URL fetch possible; document in OKF
- Source: clarify Q-2-4 / Q-10-2

#### ADR-7: Partial ship + US-007 partial
- Context: Email ops may lag UI
- Decision: Ideal — ship platforms + About; media-kit form disabled until smoke; US-007/FR-009 stay `partial` until To/Cc email received
- Alternatives rejected: Hold entire Phase 3; mark US-007 implemented without mail
- Consequences / debt: Honest OKF status; form UI present but non-submitting
- Source: clarify Q-3-1 / Q-7-2 / Q-8-1

#### ADR-8: Sequential same-tree on phase-3 branch
- Context: Shared header/config conflict risk
- Decision: Ideal — sequential tasks; branch `phase-3-convert-trust` from `main`; Isolation `same-tree`
- Alternatives rejected: Parallel worktrees for UI vs API
- Consequences / debt: Longer wall-clock; safer merges
- Source: clarify Q-3-2 / Q-3-3

#### ADR-9: Playwright PDF + commit artifact
- Context: In-repo PDF without Playwright in Workers Builds
- Decision: Ideal — `playwright` devDependency; `npm run media-kit:pdf`; commit PDF under `public/media-kit/`
- Alternatives rejected: Canva-only; Playwright inside CF CI; HTML-only without committed PDF
- Consequences / debt: Approved new package `playwright`; regenerate locally when copy changes
- Source: clarify Q-4-2 / Q-10-1; user “Generate in-repo”

#### ADR-10: PlatformLinks text list (no pills)
- Context: Avoid generic pill clusters; accessible names
- Decision: Ideal — text links + hairline separators; five platforms only; no YouTube
- Alternatives rejected: Stitch chip row
- Consequences / debt: Less “app-like”; more editorial
- Source: clarify Q-6-1

#### ADR-11: About Ideal composition
- Context: Stitch About exists but conflicts with OKF
- Decision: Ideal — host brand signal, short+full bio, cover portrait, facts `<dl>`, Brieffy text, Instagram, platforms, CTA `/#escuchar`
- Alternatives rejected: Literal Stitch (YouTube, fake headshot, Brieffy href)
- Consequences / debt: Visual delta vs Stitch export
- Source: clarify Q-6-2

#### ADR-12: Media-kit page chrome
- Context: No Stitch media-kit screen
- Decision: Ideal — listen-zone dark chrome; H2 `Media kit`; nav `Prensa`; sage submit only; no card stack
- Alternatives rejected: Light surface-light form panel
- Consequences / debt: Agent must not invent card UI
- Source: clarify Q-6-3

#### ADR-13: Escuchar cross-route
- Context: `#escuchar` breaks on `/about` and `/media-kit`
- Decision: Ideal — Escuchar → `/#escuchar` everywhere
- Alternatives rejected: Hide Escuchar off-home
- Consequences / debt: Full navigation reload to home listen zone
- Source: clarify Q-6-4

#### ADR-14: Cover portrait; photo-brief out of gate
- Context: Headshot backlog; photo-brief.md exists for photographer
- Decision: Ideal — use cover on About/PDF; do not block on photo session
- Alternatives rejected: Wait for headshot; invent AI portrait
- Consequences / debt: Weaker portrait fidelity until photo-brief delivers
- Source: clarify Q-5-1 / ADR-P3-14

### Expected Outcomes
- Home shows five labeled platform deep links below the Spotify listen zone
- `/about` presents host, approved bio, cover, facts, Brieffy text attribution, Instagram, platforms, and listen CTA
- `/media-kit` presents kit summary and a form; while email disabled, submit is blocked with clear messaging
- After Email ops + flag on, a successful submit emails To/Cc and offers PDF download
- Committed PDF exists at `/media-kit/el-brieff-media-kit.pdf` matching playbook outline (no metrics)
- Footer does not link to brieffy.com; JSON-LD has no Brieffy URL/sameAs
- Live Worker serves new routes on workers.dev (or branch preview)

### Preflight
- [ ] Read all Files to Read before touching any Files to Modify
- [ ] Confirm working tree clean or list expected dirty files with reason
- [ ] Create/checkout branch `phase-3-convert-trust` from latest `main`
- [ ] Verify tools: Node `>=22` (`.nvmrc`), `npm`, `npx tsc`, `wrangler` via package
- [ ] Confirm no prior partial Phase 3 routes (`src/pages/about.astro`, `media-kit*`, `api/media-kit*` absent or intentional resume)
- [ ] Note Email Service ops status (ready / not ready); default `mediaKitEmailEnabled: false`
- [ ] Do not flip email flag without human confirmation destinations verified

### Data Contracts

```ts
// src/config/site.ts extensions
type SiteConfig = {
  // ...existing fields...
  host: {
    name: 'Arturo Salazar Bazúa';
    alternateName: '@elchearturo';
    bioShort: string;
    bioLong: string;
  };
  producer: { name: 'Brieffy' }; // no url field used in UI/JSON-LD
  press: {
    from: 'prensa@strtgy.ai';
    to: 'arturo@strtgy.ai';
    cc: 'mar@strtgy.ai';
  };
  features: {
    mediaKitEmailEnabled: boolean; // default false until ops smoke
  };
};

// POST /api/media-kit
type MediaKitRequest = {
  name: string;
  email: string;
  organization?: string;
  reason?: string;
  website?: string; // honeypot; must be empty/absent
};

type MediaKitSuccess = {
  ok: true;
  downloadUrl: '/media-kit/el-brieff-media-kit.pdf';
};

type MediaKitError = {
  ok: false;
  error: 'validation' | 'honeypot' | 'rate_limit' | 'email_failed' | 'disabled';
};

// Env bindings (wrangler types)
type MediaKitEnv = {
  EMAIL: {
    send: (msg: {
      from: string;
      to: string | string[];
      cc?: string | string[];
      subject: string;
      text?: string;
      html?: string;
    }) => Promise<{ messageId: string }>;
  };
  RATE_LIMIT: KVNamespace;
};
```

Bio strings: copy `bioLong` verbatim from `el-brieff-okf/architecture/media-kit.md` approved bio; `bioShort` = first two sentences of that paragraph.

Rate limit rule: key `mk:{ipHash}` and/or `mk:{emailLower}`; max **5** submissions / **10 minutes**; on exceed return 429 `rate_limit`.

### Execution Order

1. Task 1 — Extend site config
2. Task 2 — Update SiteHeader (depends on Task 1: nav labels ok without config; soft dep)
3. Task 3 — Update SiteFooter (depends on Task 1: `producer` shape without url)
4. Task 4 — Create PlatformLinks (depends on Task 1: `site.platforms`)
5. Task 5 — Mount platforms on home (depends on Task 4: `PlatformLinks.astro`)
6. Task 6 — Create About page (depends on Task 1 + Task 4)
7. Task 7 — Extend JsonLd (depends on Task 1 producer shape; used by Task 6)
8. Task 8 — Build media-kit PDF (depends on Task 1 bios/copy)
9. Task 9 — Wire API + bindings (depends on Task 1 press/features)
10. Task 10 — Create media-kit page (depends on Task 4, Task 8 PDF path, Task 9 API)
11. Task 11 — Update OKF (depends on Tasks 5–10 outcomes)
12. Task 12 — Deploy & verify (depends on Tasks 1–11)

### Execution Waves

- Wave 1 (serial | Isolation: same-tree): Task 1
- Wave 2 (serial | Isolation: same-tree): Task 2 → Task 3 (header/footer both touch chrome; keep serial)
- Wave 3 (serial | Isolation: same-tree): Task 4 → Task 5
- Wave 4 (serial | Isolation: same-tree): Task 7 → Task 6 (JsonLd before/with About; prefer Task 7 then Task 6)
- Wave 5 (serial | Isolation: same-tree): Task 8
- Wave 6 (serial | Isolation: same-tree): Task 9 → Task 10
- Wave 7 (serial | Isolation: same-tree): Task 11 → Task 12
- Notes: Clarify Ideal = sequential same-tree; do not parallelize despite some soft independence

### Tasks

#### Task 1: Extend-site-config
- Status: done
- Todo title: Extend site.ts with bios, press.from, features.mediaKitEmailEnabled, producer without live URL
- Goal: Centralize Phase 3 copy and feature flag in `site.ts`
- Files to Read: `src/config/site.ts`, `el-brieff-okf/architecture/media-kit.md`
- Files to Modify: `src/config/site.ts`
- Parallelizable: no
- Inputs: approved bio text from media-kit.md; press emails
- Outputs: updated `SiteConfig` + `site` export matching Data Contracts
- Dependencies: none
- Error Handling: TypeScript compile error if `producer.url` still required by consumers — update types first, then Task 3/7
- Acceptance Criteria:
  - `host.bioShort` and `host.bioLong` present; bioLong matches OKF approved bio
  - `press.from` is `prensa@strtgy.ai`; to/cc unchanged
  - `features.mediaKitEmailEnabled === false`
  - `producer` has `name` only (no url used)
- Verification: `npx tsc --noEmit` (may fail until Task 3/7 remove `.url` usages — if so, complete Task 3 and Task 7 before declaring Task 1 done, or temporarily keep optional `url?` unused)
- DoD Evidence: `src/config/site.ts` contains `bioLong`, `press.from`, `mediaKitEmailEnabled: false`; `tsc` green after dependent URL removals
- Failure Mode: If bio mismatch, re-copy from media-kit.md; do not invent bio
- Atomic check: Single config module contract for Phase 3; splitting bios vs flag would leave inconsistent site object

#### Task 2: Update-site-header
- Status: done
- Todo title: Update SiteHeader nav (Acerca, Prensa) and Escuchar to /#escuchar
- Goal: Wire Phase 3 nav targets
- Files to Read: `src/components/SiteHeader.astro`
- Files to Modify: `src/components/SiteHeader.astro`
- Parallelizable: no
- Inputs: nav labels Inicio, Escuchar, Acerca, Prensa
- Outputs: header links `/`, `/#escuchar`, `/about`, `/media-kit`
- Dependencies: none (routes may 404 until later tasks)
- Error Handling: N/A static links
- Acceptance Criteria:
  - Escuchar href is exactly `/#escuchar`
  - Acerca → `/about`; Prensa → `/media-kit`
  - Inicio remains `/`
- Verification: `rg -n "Escuchar|Acerca|Prensa|#escuchar" src/components/SiteHeader.astro`
- DoD Evidence: rg shows `/#escuchar`, `/about`, `/media-kit`
- Failure Mode: If still `#escuchar` only, replace with `/#escuchar`
- Atomic check: One component, one nav contract

#### Task 3: Unlink-footer-brieffy
- Status: done
- Todo title: Unlink Brieffy in SiteFooter (text-only attribution)
- Goal: Remove live brieffy.com link from footer
- Files to Read: `src/components/SiteFooter.astro`, `src/config/site.ts`
- Files to Modify: `src/components/SiteFooter.astro`
- Parallelizable: no
- Inputs: `site.producer.name`
- Outputs: text “Producción por Brieffy” without `<a href>`
- Dependencies: Task 1 producer shape
- Error Handling: If `site.producer.url` referenced, remove usage
- Acceptance Criteria:
  - No `brieffy.com` href in footer
  - Producer name still visible
- Verification: `rg -n "brieffy|producer" src/components/SiteFooter.astro`
- DoD Evidence: no `href=` to brieffy in footer file
- Failure Mode: Replace anchor with `<span>` or plain text
- Atomic check: Single footer attribution change

#### Task 4: Create-platform-links
- Status: done
- Todo title: Create PlatformLinks.astro text-link list from site.platforms
- Goal: Reusable accessible platform link list
- Files to Read: `src/config/site.ts`, `src/components/SpotifyEmbed.astro`, `src/styles/tokens.css`
- Files to Modify: `src/components/PlatformLinks.astro` (create)
- Parallelizable: no
- Inputs: `site.platforms` ordered array
- Outputs: `PlatformLinks.astro` component
- Dependencies: `site.platforms` from Task 1/existing
- Error Handling: Empty platforms → render nothing (should not happen)
- Acceptance Criteria:
  - Renders all five labels as text links (not icon-only)
  - Order Spotify → Apple → Deezer → iHeart → radio.net
  - No rounded-full pills; hairline separators; dark section chrome
  - No YouTube
- Verification: file exists; `rg -n "site.platforms|Apple Podcasts|YouTube" src/components/PlatformLinks.astro`
- DoD Evidence: component file present; no YouTube string
- Failure Mode: If pills crept in, restyle to text list per DESIGN
- Atomic check: One presentational component

#### Task 5: Mount-platforms-home
- Status: done
- Todo title: Mount PlatformLinks on home below SpotifyEmbed
- Goal: Satisfy FR-004 on home
- Files to Read: `src/pages/index.astro`, `src/components/PlatformLinks.astro`
- Files to Modify: `src/pages/index.astro`
- Parallelizable: no
- Inputs: `PlatformLinks` component
- Outputs: home section order Hero → SpotifyEmbed → PlatformLinks
- Dependencies: Task 4 output `PlatformLinks.astro`
- Error Handling: Import path failure → fix relative import
- Acceptance Criteria:
  - PlatformLinks appears below `#escuchar` block
  - Listen zone chrome unchanged (US-001)
- Verification: `rg -n "PlatformLinks|SpotifyEmbed" src/pages/index.astro`; visual check `/` after build
- DoD Evidence: index imports and renders PlatformLinks after SpotifyEmbed
- Failure Mode: If order wrong, reorder JSX only — do not edit SpotifyEmbed
- Atomic check: Single page mount point

#### Task 6: Create-about-page
- Status: done
- Todo title: Create about.astro Ideal composition with FR-007 metadata
- Goal: Ship `/about` E-E-A-T page
- Files to Read: `src/layouts/BaseLayout.astro`, `src/config/site.ts`, `src/components/PlatformLinks.astro`, `prototypes/stitch/acerca_de_el_brieff_desktop/code.html`, `el-brieff-okf/requirements/fr-005-about-host.md`
- Files to Modify: `src/pages/about.astro` (create)
- Parallelizable: no
- Inputs: site bios, pitch, cover `/elbrieff-cover.png`, Instagram URL
- Outputs: About page matching Ideal section order (ADR-11)
- Dependencies: Task 1, Task 4; Task 7 preferred before or same wave for JsonLd include
- Error Handling: Missing bio → fail Task 1 first
- Acceptance Criteria:
  - Section order per ADR-11
  - Cover used as portrait (no invented headshot)
  - Brieffy text only (no href)
  - BaseLayout title/description/canonicalPath `/about` unique and ≤~160 char description
  - Includes PlatformLinks + CTA to `/#escuchar`
  - Includes JsonLd (via Task 7 component)
- Verification: `npm run build` includes `about/index.html` or `about.html` in dist; open `/about`
- DoD Evidence: built about HTML contains host name, `@elchearturo`, bioShort, cover img, “Brieffy” without brieffy.com link
- Failure Mode: If Stitch leftovers (YouTube), delete them
- Atomic check: One route page = one FR-005 surface

#### Task 7: Extend-jsonld-about
- Status: done
- Todo title: Extend JsonLd for About without Brieffy url/sameAs
- Goal: FR-008 graph without offline Brieffy URL
- Files to Read: `src/components/JsonLd.astro`, `src/config/site.ts`
- Files to Modify: `src/components/JsonLd.astro`
- Parallelizable: no
- Inputs: site host, producer.name, spotify.showUrl, social.instagram
- Outputs: JSON-LD `@graph` with PodcastSeries, Person, Organization (no Organization.url; no Brieffy sameAs)
- Dependencies: Task 1 producer shape
- Error Handling: Invalid JSON → build may still emit; validate stringify
- Acceptance Criteria:
  - Organization has `name: Brieffy` and **no** `url` / brieffy.com
  - Person includes name + alternateName; sameAs only verified URLs (Instagram and/or Spotify as applicable — Person may use Instagram; Series keeps Spotify+Instagram)
  - Home still works with same component
- Verification: `rg -n "brieffy.com|producer.url" src/components/JsonLd.astro` → no matches; build + view page source
- DoD Evidence: no brieffy.com in JsonLd output
- Failure Mode: Remove `url: site.producer.url` line
- Atomic check: One schema component contract

#### Task 8: Build-media-kit-pdf
- Status: done
- Todo title: Build media-kit print HTML + Playwright script + committed PDF
- Goal: Produce committed static PDF asset from in-repo HTML
- Files to Read: `el-brieff-okf/architecture/media-kit.md`, `DESIGN.md`, `src/config/site.ts`, `public/elbrieff-cover.png`
- Files to Modify: `src/print/media-kit.html` (create), `scripts/media-kit-pdf.mjs` (create), `package.json`, `public/media-kit/el-brieff-media-kit.pdf` (create), `package-lock.json`
- Parallelizable: no
- Inputs: playbook outline; site copy; cover image path
- Outputs: PDF ≤5 MB at `public/media-kit/el-brieff-media-kit.pdf`; npm script `media-kit:pdf`
- Dependencies: Task 1 bios; approved package `playwright` (Approval Gate)
- Error Handling: Playwright launch failure — install browsers `npx playwright install`; PDF >5MB — compress images/simplify
- Acceptance Criteria:
  - `src/print/media-kit.html` is not an Astro route
  - PDF contains: cover/wordmark, pitch, bio+handle+cover, facts, five platforms, brand notes, contact `arturo@strtgy.ai`; no audience metrics
  - Footer version/date present
  - `npm run media-kit:pdf` regenerates the same path
  - Workers Builds does **not** invoke Playwright
- Verification: `npm run media-kit:pdf`; `ls -la public/media-kit/el-brieff-media-kit.pdf`; size ≤ 5242880 bytes
- DoD Evidence: PDF file exists committed; script exit 0; size check
- Failure Mode: If size overrun, reduce image DPI; if script fails, check Chromium install — stop-and-ask if blocked >30m
- Atomic check: Print source + generator + artifact are one PDF pipeline deliverable

#### Task 9: Wire-media-kit-api
- Status: done
- Todo title: Wire wrangler EMAIL+KV bindings and POST /api/media-kit
- Goal: Implement form backend with Ideal email + rate limit
- Files to Read: `wrangler.jsonc`, `src/config/site.ts`, `src/env.d.ts`, Cloudflare Email Workers API docs
- Files to Modify: `wrangler.jsonc`, `src/pages/api/media-kit.ts` (create), `src/env.d.ts` (Env types)
- Parallelizable: no
- Inputs: MediaKitRequest; Env EMAIL + RATE_LIMIT; `site.features.mediaKitEmailEnabled`
- Outputs: POST handler returning MediaKitSuccess | MediaKitError
- Dependencies: Task 1 press/features; KV namespace must exist or be created via wrangler
- Error Handling:
  - `disabled` if flag false → 403/400 with error `disabled`
  - honeypot filled → `honeypot`
  - validation fail → `validation`
  - rate limit → `rate_limit` 429
  - EMAIL.send throw → `email_failed` 502
- Acceptance Criteria:
  - `wrangler.jsonc` has `send_email` binding name `EMAIL` with allowed destinations arturo+mar
  - KV binding `RATE_LIMIT` present
  - Handler implements Data Contracts exactly
  - Does not send when flag false
- Verification: `npm run build`; unit-ish curl against `wrangler dev` POST with flag false expects `disabled`; with honeypot expects `honeypot`
- DoD Evidence: build succeeds; curl responses match error codes
- Failure Mode: If adapter ignores API routes, stop-and-ask (ADR-1 blocker) — do not invent separate Worker silently
- Atomic check: Bindings + handler are one deployable API surface

#### Task 10: Create-media-kit-page
- Status: done
- Todo title: Create media-kit.astro page with gated form UI
- Goal: Public HTML page for FR-009 UX
- Files to Read: `src/layouts/BaseLayout.astro`, `src/config/site.ts`, `src/components/PlatformLinks.astro`, `src/components/SpotifyEmbed.astro` (chrome reference)
- Files to Modify: `src/pages/media-kit.astro` (create)
- Parallelizable: no
- Inputs: feature flag; API contract; PDF path
- Outputs: `/media-kit` with H2 “Media kit”, form, PlatformLinks optional
- Dependencies: Task 4, Task 8 (PDF exists), Task 9 (API)
- Error Handling: API error → show message; never invent success
- Acceptance Criteria:
  - Nav-compatible route `/media-kit`; H2 text `Media kit`
  - CTA copy includes Solicitar/descargar media kit (PDF)
  - Sage primary submit only; no card stack
  - When flag false: controls disabled + clear unavailable message; UI does not offer anonymous PDF bypass
  - When flag true: POST JSON; on ok trigger download of `downloadUrl`
  - FR-007 metadata for page
- Verification: build + open `/media-kit` at ~360 and ≥1280; submit disabled state visible when flag false
- DoD Evidence: screenshot or DOM note of disabled form; built HTML contains H2 Media kit
- Failure Mode: If form still posts when disabled, add `disabled` attrs + early return
- Atomic check: One route for media-kit UX

#### Task 11: Update-okf-statuses
- Status: done
- Todo title: Update OKF statuses, delivery-plan, log, media-kit playbook
- Goal: Reflect Phase 3 implementation state in knowledge bundle
- Files to Read: `el-brieff-okf/roadmap/delivery-plan.md`, `el-brieff-okf/log.md`, `el-brieff-okf/architecture/media-kit.md`, FR/US files for 004/005/009 and 003/004/007
- Files to Modify: `el-brieff-okf/requirements/fr-004-platform-subscribe.md`, `el-brieff-okf/requirements/fr-005-about-host.md`, `el-brieff-okf/requirements/fr-009-media-kit-pdf.md`, `el-brieff-okf/stories/us-003-subscribe-platforms.md`, `el-brieff-okf/stories/us-004-learn-about-show.md`, `el-brieff-okf/stories/us-007-download-media-kit.md`, `el-brieff-okf/requirements/index.md`, `el-brieff-okf/stories/index.md`, `el-brieff-okf/roadmap/delivery-plan.md`, `el-brieff-okf/log.md`, `el-brieff-okf/architecture/media-kit.md`, `el-brieff-okf/architecture/deployment.md` (form/email note if needed)
- Parallelizable: no
- Inputs: implementation outcomes from Tasks 5–10
- Outputs: statuses — FR-004/005 + US-003/004 → `implemented` when AC met; FR-009/US-007 → `partial` until email smoke; media-kit.md documents CF Email Service + Playwright PDF path
- Dependencies: Tasks 5–10
- Error Handling: Do not mark US-007 implemented without email smoke
- Acceptance Criteria:
  - Log entry dated for Phase 3 progress
  - media-kit.md provider = Cloudflare Email Service; PDF generation script documented
  - Delivery plan Phase 3 items checked where true; email caveat noted
- Verification: `rg -n "partial|implemented|Email Service|media-kit:pdf" el-brieff-okf/`
- DoD Evidence: log.md top entry references Phase 3; US-007 still partial if flag false
- Failure Mode: Revert any premature `implemented` on US-007
- Atomic check: OKF consistency is one documentation surface for the phase gate

#### Task 12: Deploy-verify-phase3
- Status: done
- Todo title: Build, deploy, and verify Phase 3 AC (US-007 partial until email smoke)
- Goal: Ship and prove Phase 3 Ideal outcomes on Worker
- Files to Read: `el-brieff-okf/architecture/deployment.md`, `package.json`
- Files to Modify: none required (deploy side effect); may flip `mediaKitEmailEnabled` **only** after Approval Gate
- Parallelizable: no
- Inputs: green build; CF account access
- Outputs: live/preview URLs; verification notes
- Dependencies: Tasks 1–11
- Error Handling: Deploy asset wipe failure → ensure `cf:deploy` still deletes `.wrangler/deploy/config.json`
- Acceptance Criteria:
  - `npx tsc --noEmit` exit 0
  - `npm run build` exit 0
  - Deploy or Workers Builds preview succeeds
  - US-003 AC on `/` ~360 + ≥1280
  - US-004 AC on `/about` ~360 + ≥1280
  - axe: 0 critical/serious on `/`, `/about`, `/media-kit`
  - About JSON-LD validates (no brieffy.com)
  - US-007 remains partial until human confirms email received; then enable flag + smoke + mark implemented in follow-up (stop-and-ask before flag flip)
- Verification: commands above + browser checks on https://el-brieff.fei-d02.workers.dev/ (or preview URL)
- DoD Evidence: deploy URL; checklist notes; Lighthouse/axe summaries; email smoke evidence or explicit “pending ops”
- Failure Mode: If `/` listen zone regresses, revert SpotifyEmbed/Hero changes immediately; if API 500, check bindings in dashboard
- Atomic check: End-to-end verify is one gate task after all code tasks

### Verification Plan

1. `npx tsc --noEmit`
2. `npm run media-kit:pdf` && confirm PDF size ≤5MB
3. `npm run build`
4. `npm run deploy` or push `phase-3-convert-trust` for Workers Builds preview
5. Browser: `/` platforms + listen zone; `/about` Ideal content; `/media-kit` disabled form
6. axe on three routes; JSON-LD About paste check
7. Human Email ops → approve flag → one real submit → confirm To/Cc → update US-007/FR-009 to implemented
8. Run `agentic-plan-verify`

### Expected Artifacts
- `src/config/site.ts` (modified)
- `src/components/SiteHeader.astro` (modified)
- `src/components/SiteFooter.astro` (modified)
- `src/components/PlatformLinks.astro` (created)
- `src/components/JsonLd.astro` (modified)
- `src/pages/index.astro` (modified)
- `src/pages/about.astro` (created)
- `src/pages/media-kit.astro` (created)
- `src/pages/api/media-kit.ts` (created)
- `src/print/media-kit.html` (created)
- `scripts/media-kit-pdf.mjs` (created)
- `public/media-kit/el-brieff-media-kit.pdf` (created)
- `package.json` / `package-lock.json` (playwright + script)
- `wrangler.jsonc` (EMAIL + RATE_LIMIT)
- `src/env.d.ts` (Env types)
- OKF files listed in Task 11
- Git branch `phase-3-convert-trust`

### Guardrails
- Do NOT: invent audience metrics, YouTube links, Brieffy CTA/URL, AI headshot, or change approved bio
- Do NOT: regress US-001 listen chrome (`#escuchar` heading, sage CTA, embed theme/height 352, fallback/noscript)
- Do NOT: run Playwright inside Workers Builds / `npm run build`
- Do NOT: set `mediaKitEmailEnabled: true` without human Email ops confirmation
- Do NOT: add signed PDF token system or separate Worker entrypoint
- Do NOT use: new UI component libraries; Turnstile (unless new approval); Resend/Brevo
- Do NOT use: rounded-full platform pills or card stacks on media-kit
- Preserve: `src/components/SpotifyEmbed.astro` behavior; `src/components/Hero.astro` primary CTA semantics; `cf:deploy`/`cf:preview` config wipe; five platform URLs in `site.platforms`
- Approved new package: `playwright` (devDependency) only for `media-kit:pdf`

### Approval Gates
- Stop and ask before: adding any package other than `playwright`; creating/destroying CF KV outside wrangler plan; flipping `mediaKitEmailEnabled`; deleting files outside Expected Artifacts; changing Email `from`/destination addresses; force-push; committing secrets
- Stop and ask if: Astro adapter cannot serve `/api/media-kit`; Email Service domain onboard blocked; PDF >5MB after reasonable compression

### Out of Scope
- FR-006 / US-005 Brieffy crossover bridge
- FR-002 / FR-003 / US-002 episode catalog/detail (v1.1)
- Custom domain cutover, Search Console, GA4 hard launch (Phase 4)
- Editorial headshot production / executing photo-brief session
- Audience metrics in PDF
- Turnstile, signed URLs, CMS, newsletter, Stitch nav noise (Episodes/Newsletter/search)

### Resume Rules
- Mark each completed task body Status: done and matching frontmatter todos[].status: completed immediately after verification passes
- While a task is in progress or blocked, keep frontmatter todo status: pending; body Status (`in_progress` | `blocked` + note) is the source of truth
- If interrupted, set the current task to Status: blocked with a note on the blocking condition; leave matching todo pending
- On resumption: re-run Preflight, then continue from the first task that is not done
- Do not re-execute done tasks unless the user explicitly resets their status
