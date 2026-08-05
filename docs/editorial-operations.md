# Operación editorial (una persona) — El Brieff

Actualizado: 2026-08-04T21:00:00-06:00 (Ideal remediations F-4-1 / F-6b-1 / F-2-1 / F-7-1). Entorno: Node 22.16, Wrangler 4.118, Astro 7.1.6, D1 local `el-brieff-editorial`, `agents@0.20.1`.

## Límite de entrega CMS vs Phase-3

- **CMS plan package surface:** `agents@0.20.1` — **Approval Gate confirmado** en remediación Ideal (usuario: “Continúa con tus remediaciones ideales”, 2026-08-04). No incluye `qrcode` ni `@types/node`.
- **CMS commit surface (Ideal):** incluir solo Expected Artifacts del plan CMS + excepciones listadas abajo. Al abrir PR CMS, **no** mezclar Phase-3/media-kit/DESIGN/Hero/About/analytics.
- **Phase-3 / media-kit / GA4 (paralelo en working tree):** pueden coexistir en la rama local, pero **no** forman parte de Expected Artifacts del plan CMS. Regenerar QR es opcional (`node scripts/generate-media-kit-qr.mjs` tras instalar `qrcode` solo en un PR Phase-3). Analytics (`src/lib/analytics/**`, gtag) pertenece al plan GA4 — no a artículos CMS.
- **Guardrail artículo público:** `/opinion/[slug]` sin client JavaScript (remediación Ideal F-5-1). Tracking de lectura de artículo, si se reactiva, vive en el plan GA4 con excepción explícita al Guardrail CMS.
- **Excepciones de artefactos CMS aprobadas en remediación (F-2-1):** `src/lib/integrations/delivery.ts`, `src/lib/agents/inference.ts`, `src/pages/api/admin/agent.ts`, `tests/integrations/delivery.test.ts`, `tests/agents/sdk-integration.test.ts`, `tests/agents/inference.test.ts`, `tests/editorial/publish-api.test.ts`, `tsconfig.editorial.json`.

### Checklist PR CMS (aislar Phase-3)

Antes de `git add` / PR del CMS:

```bash
# Debe quedar fuera del stage CMS:
git status --short -- DESIGN.md PRODUCT.md src/components/Hero.astro \
  src/pages/about.astro src/pages/media-kit.astro src/print/media-kit.html \
  src/lib/analytics src/scripts/analytics-client.ts public/arturo-*.png \
  public/*logo* scripts/generate-media-kit-qr.mjs public/media-kit
```

Stage solo rutas del plan CMS (+ excepciones arriba). Phase-3/GA4 → PR aparte.

## Ciclo editorial

1. Entrar a `/admin/` (Cloudflare Access en staging/prod; local mock `EDITORIAL_DEV_ACTOR_EMAIL`).
2. Crear borrador en `/admin/articles/new/` (persiste en D1) o `POST /api/admin/articles`.
3. Transicionar desde la bandeja (`/admin/` POST) o `PATCH /api/admin/articles` (`idea → research → draft → editing → approved`).
4. Publicar con `POST /api/admin/publish` solo desde `approved` hacia `scheduled|published` con título, slug, resumen, cuerpo, autor, asset, categoría, disclosure y ≥1 cita.
5. Entregas Resend/LinkedIn: aprobar `PublicationRequest` y ejecutar con `executeApprovedDelivery` (dispara `EDITORIAL_WORKFLOW` + executor idempotente).
6. Revisar URL pública `/opinion/[slug]/`, JSON-LD, sitemaps y `/rss.xml`.

## Aprobación y reintentos de canal

- Toda entrega Resend/LinkedIn nace como `PublicationRequest.approvalState = needs_approval`.
- Ejecutar solo con `executeApprovedDelivery: true` sobre un request `approved`.
- Idempotencia: misma `idempotency_key` / `priorProviderId` no reenvía; se registra `duplicate` en `channel_deliveries`.
- Fallos de proveedor → `failed` + diagnóstico seguro (sin texto crudo del driver).

## Ingesta de fuentes

- Solo URLs del catálogo aprobado o carga manual autorizada (`src/lib/knowledge/catalog.ts`).
- Cada retrieval debe devolver título, URL, extracto, fechas y `sensitivity`.
- `confidential` nunca entra en rutas con `allowExternalModel: true`.

## Outages de proveedor

| Proveedor | Comportamiento |
|-----------|----------------|
| Resend | Marcar delivery `failed`; reintentar tras aprobación; no mezclar con media-kit EMAIL |
| LinkedIn | Idem; exigir `LINKEDIN_ORGANIZATION_URN` + token sandbox |
| Vectorize | Degradar a búsqueda D1 keyword (`degraded: true`) |
| Access | Denegar `/admin/*` sin header allowlisted |

## Retención / borrado / exportación

Ver `docs/privacy-data-lifecycle.md`. No borrar filas de auditoría; soft-delete de contactos vía `unsubscribe_at` / `retention_until`.

## Rotación de secretos

Secretos solo vía `wrangler secret` (nunca en git): `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `LINKEDIN_ACCESS_TOKEN`. Vars no secretas: `ACCESS_ALLOWED_EMAILS`, `AI_GATEWAY_ID`.

## Onboarding de socio RSS

1. Firmar acuerdo (atribución, enlace canónico, `noindex` en copia completa).
2. Asignar `syndication_rule` (`exclude|excerpt|full_after_delay|full`).
3. Entregar `/syndication.xml` (header `X-Robots-Tag: noindex`).
4. No conectar Meta/Substack automatizado (fuera de alcance hasta credenciales/acuerdo).

## Asistente (Agents SDK)

- Clase `EditorialAgent` extiende `Agent` del paquete `agents` (Durable Object + estado SQLite).
- **ADR-4 / Ideal F-4-1:** el paso de borrador llama `env.AI.run(model, …, { gateway: { id: env.AI_GATEWAY_ID } })` vía `src/lib/agents/inference.ts`. Workers AI es el default (`@cf/meta/llama-3.1-8b-instruct`). Modelos externos requieren `allowExternalModel: true` y no pueden ver contexto `confidential`.
- Fallo de proveedor → borrador fallback + `inference` audit `degraded` (no crea delivery).
- Borrador sin efecto: `POST /api/admin/agent` con `{ brief }` → `runBrief`.
- Efecto externo: `action: "requestTool"` → `needs_approval`; luego `action: "approveTool"` con la misma identidad Access.
- Rutas `/agents/*` también pasan por Access allowlist + `routeAgentRequest`.
- Auditoría de prompt/modelo/citas/aprobaciones/inference en D1 `audit_events` (`entity_type=agent_session`).

## Bindings locales declarados

`EDITORIAL_DB`, `EDITORIAL_DOCUMENTS`, `KNOWLEDGE_INDEX`, `AI`, `AI_GATEWAY_ID`, `EDITORIAL_QUEUE`, `EDITORIAL_WORKFLOW`, `EDITORIAL_AGENT`, más `EMAIL`, `RATE_LIMIT`, `ASSETS`.

## Verificación registrada (local)

| Check | Resultado | Timestamp / nota |
|-------|-----------|------------------|
| `npm run test` | pass (41) | 2026-08-04T21:00 local (+ inference suite) |
| `npm run build` | exit 0 | 2026-08-04T21:00 local |
| `npm run editorial:typecheck` | exit 0 | 2026-08-04T21:00 (`tsconfig.editorial.json`, sin `@types/node`) |
| `npx wrangler d1 execute el-brieff-editorial --local --file=migrations/0001_editorial.sql` | 18 commands success | 2026-08-04 local |
| RSS builder / live feeds | well-formed XML + live 200 | unit + wrangler smoke |
| Package surface | `agents` present; `qrcode` absent; article pages **sin** client JS analytics | Ideal F-5-1 / F-7-1 |
| CMS vs Phase-3 boundary | checklist PR CMS documentada arriba | Ideal F-6-1 |
| AI Gateway draft path | unit tests assert `gateway.id` | Ideal F-4-1 |
| Preview routes `/`, `/admin/`, feeds | see smoke section below | 2026-08-04T20:24 wrangler `:8787` |
| Admin viewport screenshots (1280/390) | **pendiente** | F-3-1 MANUAL |
| Rich Results / Lighthouse / Access staging / sandbox Resend+LinkedIn | **bloqueados** | Approval Gates / F-3-2 / F-3-3 / F-8-1 |

### Smoke preview (local) — recorded 2026-08-04T20:24

```bash
# If build fails with EBUSY on Windows, stop local `astro dev` / `wrangler dev` for this repo first.
npm run build
npx wrangler d1 execute el-brieff-editorial --local --config dist/server/wrangler.json --file=migrations/0001_editorial.sql
npx wrangler dev --config dist/server/wrangler.json --local --ip 127.0.0.1 --port 8787
```

Observed against `http://127.0.0.1:8787`:

| Route | Result |
|-------|--------|
| `GET /` | 200; Spotify embed + link `/opinion/` |
| `GET /robots.txt` | 200; Disallow `/admin/` |
| `GET /admin/` (no Access) | 401; checklist Access |
| `GET /admin/` (Access email allowlisted) | 200; bandeja + cola |
| `POST /admin/articles/new/` (Access) | Form POST may be blocked by platform CSRF in curl; use API below |
| `POST /api/admin/articles` (Access JSON) | 201; draft persisted; aparece en cola `/admin/` |
| `GET /opinion/` | 200 |
| `GET /rss.xml` | 200 `application/rss+xml` |
| `GET /syndication.xml` | 200 + `X-Robots-Tag: noindex` |
| `GET /sitemap-index.xml`, `/news-sitemap.xml` | 200 XML |

Note: apply the D1 migration with `--config dist/server/wrangler.json` so preview uses the same local DB as `wrangler dev`.

Rich Results Test and Lighthouse remain manual against a public/staging URL after Approval Gates.
