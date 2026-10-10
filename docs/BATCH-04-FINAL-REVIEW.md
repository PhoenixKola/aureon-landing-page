# Batch 04 final review: legal UX, real 404, mobile navigation, release QA

Date: 2026-10-10. Batches 01–03 are preserved. This batch also includes the owner's follow-up fixes (see the last section).

## Changed files (summary)
- **Routing / 404:**
  - `app/(en|sq|it)/…/[slug]` replaced by 15 explicit static legal routes; the route-group `not-found.tsx` files were removed.
  - New `app/global-not-found.tsx`, `app/(en)/404-document/page.build.tsx` (build-only) and `scripts/finalize-404.mjs`.
  - `next.config.ts`: `experimental.globalNotFound` and build-only `pageExtensions`.
  - `src/components/NotFoundPage.tsx` rewritten; new 404 keys in `dictionary.ts`.
- **Legal:** `LegalPage.tsx` rewritten (hero + document panel + policy index, integrated chapter numbers, designed draft notice). New `LegalToc.tsx` (scroll-spy plus a compact phone chapter bar). New labels in all three languages.
- **Mobile navigation:** `MobileMenu.tsx` is now a portal-rendered modal sheet; `SiteHeader.tsx` supplies its content; `ThemeToggle.tsx` handles light/dark only.
- **Hosting:** `infra/apache/.htaccess` (see the note below), `infra/nginx/aureon-site.conf.example` (CSP fix), `scripts/preview.mjs` (`PREVIEW_CSP`).
- **Assets:**
  - New `scenes/unbuilt-*.webp` (404) and a regenerated `social-preview.webp`.
  - `gym-interior.webp` and the v1 evidence were moved to `evidence/legacy-v1/`.
- **QA tooling:**
  - `scripts/check-export.mjs` now also checks the 404 design and internal links.
  - `scripts/shoot-pages.mjs`, `shoot-menu.mjs`, `render-unbuilt.mjs`, `render-social.mjs`, `record-interactions-04.mjs`.
  - `playwright.config.ts`: `BASE_URL` and `CROSS` options.
- **Docs:** `UX-UI-ACCEPTANCE-MATRIX`, `VISUAL-QA-REPORT`, `SEO-PERFORMANCE-REPORT`, `FINAL-PRODUCTION-SIGNOFF`, `DEPLOYMENT-AND-ROLLBACK`, `ASSET-LICENSES`, `README`.

## The 404 diagnosis (what was actually wrong)
1. `/sa/` was **not** unmatched. It matched the English `[slug]` legal route (slug = "sa"). With `output: 'export'`, Next dev throws "missing param in generateStaticParams" for unknown params, so the request returned **HTTP 500** (the same happened for `/sq/nope/`).
2. With multiple root layouts there is no single layout to build a 404 from, so unmatched URLs got Next's default page.
3. `output: 'export'` does **not** prerender `global-not-found`, so `out/404.html` was Next's default page even after the dev fix.

Fix: explicit static legal routes; `global-not-found` (dev and server hosts); a build-only page rendered with the same component and turned into a runtime-free `out/404.html`, with the build-only route stripped from the export. The 404 contains EN/SQ/IT and picks one from the `/sq/` or `/it/` prefix before paint; it defaults to English for unrecognized prefixes. It is `noindex` and absent from the sitemap.

## Test results (exact commands)
| Command | Result |
|---|---|
| `npm ci` | OK, 0 vulnerabilities |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm test` | 18/18 |
| `npm run build` | pass (21 pages, then `[404] designed static 404.html written`) |
| `npm run check:export` | 18 localized pages, 404 design checks, 562 internal links across 21 pages, all resolve |
| `npm run test:e2e` (Chromium, dev server) | 22/22 |
| `BASE_URL=http://localhost:4310 CROSS=1 npx playwright test` against `PREVIEW_CSP=1` export | **66/66** (Chromium, Firefox 142, WebKit 26) |
| `curl` statuses on the export | `/`, `/sq/`, `/it/`, `/privacy/`, `/sq/terms/`, `/it/cookies/`: 200. `/sa/`, `/not-a-real-page/`, `/sq/nope/`, `/it/nope/`, `/404-document/`: 404 |
| `npm run release:check` | **Fails as intended** (list below) |

New tests cover:
- the 404 status, language and robots tag for four URLs, plus home navigation and browser back
- the legal TOC: direct hash, bottom of page, top, click, sticky
- the phone chapter bar: open, jump, active state, landing position, no overflow at 320 px
- the menu sheet: dialog semantics, focus trap (14 Tab presses), inert background, scroll lock, Escape returns focus, link closes and navigates
- no-JS fallbacks
- hero media failure (blocked 3D chunk falls back to the still and releases the header)
- the light/dark toggle (follows the OS, persists)
- the phone header showing only logo + menu
- hero hover contrast ≥ 4.5:1 in both themes

## Evidence (`evidence/batch-04/`)
- `before/`: the default 404 / HTTP 500 and the old legal pages
- `after/`: legal pages (3 languages × 5 widths × 2 themes) and the 404 (3 languages × 3 widths × 2 themes)
- `full/`: full-page homepage at 1920/1440/1024/768/390/320 in EN, plus SQ/IT, both themes
- `menu/`: open sheet, home + IT legal, 390/320, both themes
- `hero-frames/`: 0/1000/2400/5000 ms, desktop + phone, both themes
- `fixes/`: the owner-feedback fixes (Section 02, hero hover, phone header, menu, footer)
- `video/`: `mobile-menu-phone.webm`, `legal-scrollspy-desktop.webm`, `legal-chapters-phone.webm`, `not-found-404.webm`

## Responsive / theme / a11y issues fixed in this batch
- The 404 is a real 404 (dev and export) and localized.
- Legal hero rebalanced; chapter index integrated; TOC scroll-spy; phone chapter bar; anchor offsets corrected (`scroll-padding` + `scroll-margin` were doubling).
- Mobile sheet: dark-sheet language switch colours; WebKit focus trap (Safari's Tab skips links); focus restore after Escape (the trigger was still inert at that moment).
- The nginx CSP would have blocked the site's scripts; fixed in both hosting configs and verified with the full suite.

## Owner follow-up fixes (applied after the first Batch 04 pass)
1. Section 02: the connecting line was painting through the icons (station reveal animations created stacking contexts). It is redesigned as independent columns, each with its own rule, an icon chip and a brass accent that draws in and extends on hover. There is no shared line.
2. "Back to top" removed from the footer.
3. Hero "Explore the platform" hover: light theme was dark text on a dark hover; each theme now has its own hover ink (tested ≥ 4.5:1).
4. Theme control: light/dark only. The first visit follows the OS; the choice is stored. The Monitor/"System" option has been removed from the UI and all three languages.
5. Phone/tablet header (≤ 1020 px): logo + hamburger only. Language and theme live in the menu sheet.

## Remaining real release blockers (what to supply, where)
Set these in `.env.local` (build-time, public values) and rebuild:
- `SITE_ORIGIN`: the real HTTPS origin of this marketing site
- `APP_ENTRY_URL`: a verified tenant Client Web URL (not Keycloak / console)
- `OWNER_LEGAL_NAME`, `OWNER_LEGAL_ADDRESS`, `OWNER_JURISDICTION`, `PRIVACY_CONTACT_EMAIL` (optional: `OWNER_REGISTRATION_NUMBER`, `OWNER_TAX_ID`, `PUBLIC_CONTACT_EMAIL`)
- `LEGAL_APPROVED=true`, `LEGAL_APPROVER`, `LEGAL_APPROVAL_DATE`, set only after counsel approves
- Replace the bracketed placeholders in the `*Sections` legal copy in `src/content/dictionary.ts` with approved EN/SQ/IT text

Also outstanding: real-device and real-GPU testing, screen-reader passes, and a Lighthouse/field CWV measurement on the real host.

## Note on `infra/apache/.htaccess`
A pre-existing `.htaccess` (hidden from `ls`) was overwritten in this batch before it had been read, and there was no git history to recover it from. The new file implements what `infra/hetzner/DEPLOYMENT.md` requires (ErrorDocument 404, security headers, caching) with the corrected CSP. Compare it with any copy you may have elsewhere.
