# Batch 01 review: cinematic hero, navigation, motion foundation

Date: 2026-10-09. Not committed, pushed or deployed (per brief).

## What changed

| Area | Before | After |
|---|---|---|
| Hero art | Flat line-art SVG (`GymConstruction.tsx`) | Real-time three.js gym modelled to real dimensions (`src/components/hero/gym-scene.ts`), PBR materials, soft shadows, area lights, light/dark looks, separate mobile camera |
| First frame | Empty SVG stage | Empty stage (architecture only); equipment arrives piece by piece; rack silhouette readable at about 1.0 s; scene rests at about 4.8 s, then the render loop stops |
| Hero size | `clamp(660px,62vw,825px)`; section 02 visible on phones; strip under the hero | `height:100svh`; header overlaid; the `.hero-under` strip is removed. Section 02 starts exactly at the fold at 320×667, 390×844, 768×1024, 1366×768 and 1440×900 |
| Replay | Visible button, state, translations, CSS | Deleted everywhere (component, dictionary in all 3 languages, CSS, icon); a test and the audit guard against it returning |
| Header | Absolute, CSS-timed at 4450 ms | Fixed over the hero, solid blurred surface once scrolled; arrives **when the scene settles** (JS signal). Non-home pages, reduced motion and repeat visits: immediate. Tab key or 9 s timer always releases it |
| Language | Tiny boxed links | Segmented control with a spring indicator that previews hover/focus and rests on `aria-current`; route-preserving (incl. legal routes); full-name version in the mobile menu; hidden from the header bar only below 375 px |
| Theme | Text glyphs, flash on load | Lucide Monitor/Sun/Moon crossfade-rotate, hover rotation, press scale, translated `aria-label` ("Theme: Dark"); applied before paint, so no flash |
| Mobile menu | `<details>` without Escape/outside close | Button with `aria-expanded`/`aria-controls`, Escape returns focus, outside click closes, animated panel, 58 px rows |
| Scrollbar | Default | Transparent track and corner, slim thumb (`scrollbar-color` + WebKit fallback with hover); native scrolling untouched |
| Motion system | One-off CSS keyframes | Tokens (`--ease-out`, `--ease-spring`, durations), `src/lib/motion.ts` (easings + deterministic `Timeline`), `[data-reveal]` / `[data-reveal="fade"]` / `[data-reveal-item]` stagger via `RevealOnScroll` |
| Skip link | English only | Translated |

## Scene technique and bytes (production export)

- Technique: pipeline (B), with equipment modelled in code. Rationale and research: `docs/HERO-PRODUCTION-PLAN.md`; licences: `docs/ASSET-LICENSES.md`. No external models, textures or photos ship.
- Lazy 3D chunk (three + scene): **763 KB raw / 231 KB gzip**. It is not referenced by the HTML and is imported after hydration.
- Initial JS referenced by `/index.html`: 566 KB raw / 175 KB gzip (Next + React runtime + page). CSS: 33 KB / 8 KB gzip.
- Fallback stills: desktop dark 103 KB, desktop light 168 KB, mobile dark 42 KB, mobile light 55 KB. These use `loading="lazy"` and are hidden on the motion path, so motion visitors never download them.

## Evidence (all under `evidence/batch-01/`)

- Before: `before/{desktop,laptop,phone,narrow}-{dark,light}-{0,5200}ms.webp`
- Exact opening frames from the production export (`#hero-t=<ms>`): `frames/{desktop,phone,narrow}-{dark,light}-t{0000,0500,1000,1800,2800,3600,5000}.webp`
- Contact sheets: `contact-desktop-dark.webp`, `contact-desktop-light.webp`, `contact-phone-dark.webp`, `contact-narrow-light.webp`
- Real-time recordings of a true first load: `video/opening-desktop-dark.webm`, `video/opening-phone-dark.webm`. These are recorded under software WebGL (SwiftShader), so the frame rate is lower than on a real GPU.
- Reduced motion at 300 ms: `reduced-motion-{desktop,phone}-{dark,light}-300ms.webp`
- Controls: `state-lang-hover-sq.webp`, `state-theme-hover-focus.webp`, `state-header-scrolled.webp`, `state-mobile-menu-it.webp`, `narrow-320-sq-light.webp`
- Firefox 142: `firefox-desktop-home.webp`, `firefox-legal-scrollbar.webp`

Frame-by-frame review: t0 shows only the hero colour and architecture, with no equipment and no still on the motion path. Nothing is clipped at 320 px in EN, SQ or IT (`narrow-320-sq-light.webp`, `narrow-320-it-dark.webp`). The navbar appears only in the t5000 frames.

## Tests run

| Command | Result |
|---|---|
| `npm run lint` (audit: no radial/repeating gradients, no `transition: all`, no composite hero image, no replay) | pass |
| `npm run typecheck` | pass |
| `npm run test` (10 behaviour/config tests) | pass |
| `npm run build` | pass (20 static pages) |
| `npm run check:export` | pass (18 localized pages + 404 + robots) |
| `npx playwright test` (7 browser tests: empty first frame → live scene → header last; first-viewport fit and no overflow at 320/390/768/1366/1440; reduced motion; locale routing on legal pages; theme cycle + persistence; mobile menu Escape/focus; no-JS still + header) | pass (Chromium, dev server) |
| Firefox 142 (Playwright) | Hero renders and settles, hero = viewport. `scrollbar-color` resolves to thumb + transparent track |

## Remaining blockers and honest limits

- **Licensed production GLBs:** not obtained. Sketchfab downloads need an authenticated account, and BlenderKit's licence forbids redistributing raw assets. The scene is high-quality real-time 3D, **not** an offline path-traced film. Swapping in licensed models later is a per-builder change (see the plan).
- **Scrollbar visual in Firefox not seen:** Playwright's headless automation hides scrollbars (computed `scrollbar-width: none` is injected by the harness). The CSS is verified; the visual should be checked once in a real Firefox window.
- **Real-GPU performance not measured:** all browser runs used SwiftShader. Check on a mid-range phone that the 4.8 s assembly stays smooth (DPR is capped at 1.6 on mobile and 1.75 on desktop, with a 2048 shadow map).
- In the light theme the brass chevron is subtle against pale timber. This is deliberate restraint, but it is a candidate for art review.
- Dev-only: open `http://localhost:3000`. Under `127.0.0.1` Next 16 blocks dev resources and the page will not hydrate (documented in the README).
- Sections 02–06 are intentionally untouched (Batches 02–03). They already use the reusable reveal system.
