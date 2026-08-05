---
target: /print/media-kit.html
total_score: 21
p0_count: 0
p1_count: 2
timestamp: 2026-08-04T20-37-01Z
slug: src-print-media-kit-html
---
Method: dual-agent (A: 1935e18d-f002-48e6-bfe2-50fce8efe538 · B: 280551b4-5b0a-48a6-92ad-c0f55ca5e4cb)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Version and date exist, but there are no page numbers or document map. |
| 2 | Match system / real world | 3/4 | Clear Spanish overall; `es-MX`, “Do/Don’t,” and “partnerships” read as internal jargon. |
| 3 | User control and freedom | 2/4 | Contact links work, but platform URLs are plain text and there is no contents navigation. |
| 4 | Consistency and standards | 3/4 | Cohesive palette and type; heading order and mixed-language terminology weaken consistency. |
| 5 | Error prevention | 1/4 | The leadership claim has no cited evidence. |
| 6 | Recognition rather than recall | 3/4 | Sections and facts are labeled clearly. |
| 7 | Flexibility and efficiency | 1/4 | No direct asset downloads, QR codes, press shortcuts, or linked platform actions. |
| 8 | Aesthetic and minimalist design | 2/4 | Clean, but the excessive whitespace and repeated template treatment feel unfinished. |
| 9 | Error recovery | 1/4 | No alternate route for stale links, unavailable assets, or contact failure. |
| 10 | Help and documentation | 2/4 | Basic brand rules exist; usage rights, credits, formats, and asset retrieval do not. |
| **Total** |  | **21/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**Does it look AI-generated? Borderline yes.** The cover is distinctive and brand-aligned, but the interior resembles an AI-generated first-draft fact sheet: repeated ruled headings, generic white-document styling, raw URLs, manual footers, and large accidental empty areas. It is clean, but not authored enough to feel press-ready.

**Deterministic scan:** 5 CLI warnings across 2 rules: 4 “Overused font” warnings at lines 39, 79, 127, and 146, plus 1 “Em-dash overuse” warning. The browser detector found 24 rule hits across 17 elements: 7 long lines, 12 viewport-edge contacts, 4 tiny footer-text hits, and 1 overused-font hit.

Most detector findings are contextual false positives. Montserrat is an intentional brand font; the em dashes mainly separate platform names from URLs; 8pt footer text is normal for print; and screen rendering ignores `@page` margins. The long biography and raw platform URLs remain valid readability findings. The viewport-edge findings also become real if this HTML is expected to work outside print/PDF.

**Visual overlays:** Injection succeeded and the findings are visible in the `[Human] El Brieff — Media Kit` browser tab. The live overlay server was stopped after inspection.

## Overall Impression

A strong branded opening is followed by four under-designed utility pages. The central opportunity is to turn “information placed on A4 pages” into a credible press instrument with verified claims, usable assets, and deliberate editorial pacing.

## What’s Working

- **Strong brand recognition:** The charcoal-green cover, stacked wordmark, restrained palette, and type choices align with the canonical cover and `DESIGN.md`.
- **Good baseline legibility:** Type sizes, spacing, and contrast are generally comfortable, with little decorative clutter.
- **Logical sequence:** Program → conductor → facts/platforms → brand/contact is understandable for a press reader.

## Priority Issues

### [P1] Unsupported credibility claim

**What:** The biography calls El Brieff “uno de los podcasts diarios… más escuchados en México y Latinoamérica” at lines 250–260.

**Why it matters:** `PRODUCT.md` explicitly says there are no verified audience metrics. A journalist or partner can challenge this immediately, undermining the trust the kit is meant to build.

**Fix:** Remove the superlative or cite a named, dated source. Separate verified facts from positioning language.

**Suggested command:** `/impeccable clarify src/print/media-kit.html`

### [P1] The document does not yet perform as a media kit

**What:** It lacks direct downloads for logos, cover art, headshots, short/long bios, image credits, usage rights, boilerplate copy, sample episodes, and a canonical press-assets location. The five platform addresses at lines 288–298 are plain text.

**Why it matters:** A press user cannot publish from this kit without emailing for the actual materials.

**Fix:** Add a compact press-resource index with clickable links, downloadable formats, usage notes, image credits, and one canonical asset destination. Add QR codes only where print handoff benefits.

**Suggested command:** `/impeccable shape src/print/media-kit.html`

### [P2] The A4 composition wastes most of the document

**What:** Every interior section reserves nearly a full page through `.page { min-height: 240mm; page-break-after: always; }`, despite sparse content. Manual footers sit after content instead of at the page bottom. `@page` margins also prevent a true full-bleed cover.

**Why it matters:** Five pages feel padded rather than premium, increase printing cost, and weaken the perceived substance of the kit.

**Fix:** Consolidate to roughly three purposeful pages: branded cover, story/evidence, press resources/contact. Use real page furniture and choose either printer-safe cover margins or intentional bleed.

**Suggested command:** `/impeccable layout src/print/media-kit.html`

### [P2] The brand and emotional arc collapse after the cover

**What:** The cover establishes confidence, then page two becomes a sparse generic worksheet. The document ends on a bare contact box and a development-domain URL.

**Why it matters:** The strongest emotional moment occurs first; the closing impression is operational and provisional rather than authoritative.

**Fix:** Carry the cover identity into interior page furniture, evidence callouts, image treatment, and the closing composition. End with a confident press CTA and canonical branded domain.

**Suggested command:** `/impeccable bolder src/print/media-kit.html`

### [P2] Accessibility and production semantics are incomplete

**What:** The first document heading is `h2`; the only `h1` appears on page three. The host image alt text describes the cover rather than Arturo. Platform URLs are not links. The fixed 52mm grid has no narrow-screen fallback. Fonts are referenced but not embedded.

**Why it matters:** Exported PDFs can vary by machine, screen-reader structure is misleading, and the HTML version is harder to use by keyboard or on mobile.

**Fix:** Correct the heading hierarchy, use accurate alternative text, turn destinations into links, add a responsive fallback, and embed or package the chosen fonts for deterministic export.

**Suggested command:** `/impeccable audit src/print/media-kit.html`

## Cognitive Load

**Moderate: 2 of 8 checks fail.**

- Pass: single focus, grouping, local visual hierarchy, one thing at a time, working-memory demand, and progressive disclosure.
- Fail: chunking. The biography is dense, and platform destinations are five unprioritized raw URLs.
- Fail: minimal choices. Five listening destinations carry equal visual weight with no preferred route.

This is not an overloaded document; it is under-curated. Low content density is not the same as clarity.

## Emotional Journey

- **Opening peak:** Distinctive, confident cover.
- **Valley:** “El programa” feels empty and generic.
- **Recovery:** Arturo’s image adds human credibility.
- **Second valley:** Raw platform URLs feel operational rather than editorial.
- **Ending:** Contact information is useful, but the worker-domain URL and missing asset access create a weak final impression.

## Persona Red Flags

**Jordan, first-timer:** Cannot identify a next action; `es-MX`, “Do/Don’t,” and “partnerships” add jargon; raw URLs appear actionable but are not links; available press assets are never explained.

**Riley, stress tester:** Will challenge “más escuchados” and find no source; cannot verify update ownership, image rights, or usage permissions; plain-text links can silently become stale; the development domain raises permanence concerns.

**Casey, distracted/mobile:** Must scroll through five screen-height pages with large empty areas; long URLs are hard to use; the fixed host grid has no narrow-screen fallback; there is no single primary handoff action.

**Press/professional user:** Missing ready-to-publish biography lengths, high-resolution headshots, logos, captions, credits, rights, boilerplate, and evidence provenance. The contact lacks a named press role, response expectation, and alternate channel.

## Minor Observations

- “Cofundador STRTGY” should likely be “cofundador de STRTGY.”
- Replace `~15 minutos` with “aprox. 15 minutos” or a verified range.
- “Actualidad empresarial y de conversación” is vague.
- Repeated inline styles weaken maintainability.
- The canonical cover is reused as a host portrait; a dedicated press headshot would be more useful.
- Version/date metadata is useful but needs an owner or revision policy.
- The detector’s broken image under its `/source` route was tooling-specific; the asset loaded correctly from the normal static server.

## Questions to Consider

1. If a journalist had five minutes before publication, could this kit supply everything without an email?
2. Is the kit primarily meant to persuade, verify, or distribute assets? It currently does each only partially.
3. What verifiable proof should replace the unsupported “más escuchados” claim?
4. Should the interior deliberately contrast with the cover, or should it feel like the same brand?
