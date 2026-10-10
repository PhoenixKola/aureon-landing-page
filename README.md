# Aureon · Standalone website (Next.js + React + TypeScript)

This folder is **a real React application**, not the gym platform, a static HTML generator or a mock server. It uses Next.js 16 App Router and exports a hostable static site. No database, Docker, API, or backend credentials are required.

## Start here

Use **Node.js 20.9+** (Node 22 LTS recommended). Open this folder in VS Code:

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. You can edit components under `src/components/*.tsx`, locale dictionaries under `src/content/dictionary.ts` and styles in `app/globals.css`.

## Commands

- `npm run dev` — Next dev server
- `npm run build` — generate safe SEO artifacts, static output into `out/`, then the designed `out/404.html` (`scripts/finalize-404.mjs`)
- `npm run preview` — preview `out/` after building (unknown URLs get a real 404; `PREVIEW_CSP=1` applies the production CSP)
- `npm run typecheck` — strict TypeScript check
- `npm run lint` — project-specific static audit
- `npm test` — source/config/translation tests
- `npm run test:e2e` — Playwright browser tests (`npx playwright install chromium` once; uses software WebGL). `BASE_URL=http://localhost:4310 CROSS=1 npx playwright test` runs Chromium + Firefox + WebKit against a preview of the export
- `npm run check:export` — inspect exported HTML and locale files
- `npm run release:check` — *production approval gate* (expected to fail until missing legal/URL information is supplied)

## Pages

- `/`, `/sq/`, `/it/` — localized marketing homepages
- `/privacy/`, `/terms/`, `/imprint/`, `/disclaimer/`, `/cookies/` — English legal drafts (explicit static routes, no dynamic `[slug]` segment, so unknown paths 404 instead of erroring)
- `/sq/{legal-route}/` and `/it/{legal-route}/` — translated legal drafts
- designed 404 for every unknown URL (`app/global-not-found.tsx` in dev, `out/404.html` in the export), localized from the URL prefix

### Configuration

Copy `.env.example` to `.env.local` **only when you have real values**. `APP_ENTRY_URL` is a real verified tenant Client Web entry URL, not an invented Aureon universal login. A missing URL hides the app CTA; everything else works in local preview. `SITE_ORIGIN` becomes absolute canonical + hreflang URLs *when valid*. The legal drafts remain labeled and unindexed until facts and qualified approvals are supplied; see `docs/LEGAL-FACTS-REQUEST.md`.

### Visuals

The hero is a **real-time 3D gym** (three.js, lazy-loaded after first paint) modelled in code to real equipment dimensions: power rack, loaded barbell and bumper plates, bench, hex dumbbell rack, functional trainer, treadmills, linear lighting, and the Aureon chevron. **The first frame is empty.** Pieces assemble one by one, the scene rests after about 4.8 s, the render loop stops, and the navbar eases in **last**. Reduced-motion, repeat-visit, no-JS and WebGL-failure visitors get the completed scene immediately: stills in `public/assets/hero/` are rendered from the scene itself. Details: `docs/HERO-PRODUCTION-PLAN.md`, `docs/SIGNATURE-EXPERIENCE-MAP.md`, `docs/ASSET-LICENSES.md`.

Evidence helpers (need `npm run dev` or a preview server running): `node scripts/hero-frames.mjs <dir> 0,1000,5000` (exact frames via `/#hero-t=<ms>`), `node scripts/render-hero-stills.mjs` (regenerate fallback stills after changing the scene), `node scripts/record-opening.mjs` (real-time opening video; set `BASE_URL`), `node scripts/render-scene-shots.mjs` (section close-ups from the same scene), `node scripts/shoot-sections.mjs` and `node scripts/shoot-interactions-02.mjs` (section evidence). Open the dev site on **http://localhost:3000**, not 127.0.0.1: Next 16 blocks dev resources for other origins, so the page would not hydrate.

### Hosting

Static `out/` can go to a correctly configured HTTPS static host; deployment configs in `infra/`. This ZIP is ready to run locally but **not approved for public production release** without verified app destination, operator identity, translation/legal approval, and browser QA.

### Dependencies

All direct dependencies are pinned to exact versions and locked in `package-lock.json`; `npm install && npm run dev` is all that is needed.
