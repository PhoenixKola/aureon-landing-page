# Visual QA report (2026-10-10, after Batch 04)

All captures were taken from a **running build**: the Next dev server, or the static export served by `scripts/preview.mjs` with the production CSP (`PREVIEW_CSP=1`). They use Chromium with software WebGL (SwiftShader); Firefox and WebKit were exercised through the test suite.

## Coverage
- **Homepage, full page**, EN at 1920, 1440, 1024, 768, 390 and 320 in dark and light; SQ/IT at 1440/390/320: `evidence/batch-04/full/`. No horizontal overflow at any size.
- **Hero opening frames** (0 / 1000 / 2400 / 5000 ms), desktop + phone, both themes: `evidence/batch-04/hero-frames/`. Earlier batches: `evidence/batch-01/frames`.
- **Sections 02–06**: `evidence/batch-02/after`, `evidence/batch-03/after`, and the latest Section 02 redesign in `evidence/batch-04/fixes/`.
- **Legal pages** (EN privacy, SQ terms, IT cookies) at 1440, 1024, 768, 390 and 320, both themes: `evidence/batch-04/after/`.
- **404** (`/sa/`, `/sq/nope/`, `/it/nope/`) at 1440, 390 and 320, both themes: `evidence/batch-04/after/*nope*`, `sa-*`.
- **Mobile sheet** (home + IT legal, 390/320, both themes): `evidence/batch-04/menu/`.
- **Videos:**
  - `evidence/batch-04/video/` (menu, scroll-spy desktop/phone, 404 navigation)
  - `evidence/batch-03/video/` (accordion, CTA, footer)
  - `evidence/batch-02/video/` (theatre, connected day)
  - `evidence/batch-01/video/` (opening)

## Issues found and fixed in Batch 04
- `/sa/` and `/sq/nope/` returned **HTTP 500** in dev: the dynamic `[slug]` legal route throws under `output: 'export'` for unknown params. Fixed with 15 static legal routes + `global-not-found`.
- The static export's `404.html` was Next's **default** page, because export does not prerender `global-not-found`. Fixed with a build-only page plus `scripts/finalize-404.mjs`, guarded by `check:export`.
- Legal hero: the title sat low in a mostly empty composition, and the body left an empty right column. Rebalanced, with an aligned centred measure.
- Mobile sheet language switch inherited light-theme colours inside the dark sheet. Fixed.
- WebKit: Tab skips links, which let focus leave the sheet. The focus trap now cycles explicitly.
- Phone chapter jumps landed 80 px low (`scroll-padding` plus `scroll-margin` doubled). Fixed.
- Owner feedback:
  - Section 02's connecting line was painting through the icons (a stacking-context bug); the section is redesigned without it.
  - Back-to-top removed.
  - Light-theme hero button hover had dark-on-dark text; it now has a per-theme hover ink, tested ≥ 4.5:1.
  - Theme toggle reduced to light/dark.
  - Phone header shows only the logo and the menu.

## Known capture artifact
Playwright full-page screenshots repaint the fixed header and top tile at the bottom of very tall pages. The full-page script therefore makes the header absolute during capture. The real footer renders correctly; this was verified with viewport screenshots.

## Not verified
Real phones and tablets, real GPU frame rates, screen readers (NVDA/VoiceOver), and Safari on iOS (WebKit desktop engine only).
