> **AUREON WEBSITE / DIRECT IMPLEMENTATION TASK**  
> Apply this prompt to the **latest actual working tree**, starting with the 9 Oct 2026 ZIP `aureon-react-nextjs-landing-page-rebuild.zip` if that is still the latest source. **Do not** edit `gym-app-main`/the platform apps. This is not a mockup request; implement actual code.  
> This is one of **four sequential batches**; execute only this batch, verify it, then stop and report. **Do not commit, push, or deploy** until the user approves the complete redesign.

## Before editing: source and design audit

Read `CLAUDE.md`, `README.md`, `docs/AUREON-SOURCE-FACTS.md`, `docs/BRAND-AND-VISUAL-DIRECTION.md`, `docs/SIGNATURE-EXPERIENCE-MAP.md`, `docs/LEGAL-CONTENT-STATUS.md`, and the current relevant `.tsx` and `app/globals.css` files. Examine the running site at desktop (1440×900), mobile (390×844), and narrow mobile (320×667) in **both** light and dark themes, with screenshots. Read the user's critique and accompanying screenshots. The screenshots may show UI from the immediately preceding build; the **current code** is the implementation authority. If the tree differs, inspect and adapt rather than blindly applying stale selectors.

**Shared non-negotiable constraints:** standalone Next.js App Router + React + strict TypeScript; static export (`out/`), no server runtime or platform secrets; actual Aureon chevron and source-aligned warm brass/deep olive identity; exactly EN/SQ/IT visible and fully translated; one coherent sans-serif family; truthful, source-supported product claims; no imaginary customers, certifications, statistics, authentication flow, gym tenant URL, operator data, or legal approvals. Do not imitate ProGreen, use checker/grid/blueprint backgrounds, decorative radial/circular gradient blobs, generic glowing orbs, or boxy SaaS card farms. Do not make it 'futuristic' by lowering readability. Preserve proper a11y, keyboard interactions, reduced motion, progressive enhancement, SEO metadata, and real URL configuration in `src/config/site.ts`. Use **lucide-react** for interface icons where appropriate; keep Aureon's actual brand SVG, which is not a Lucide icon. Install an animation/3D library only where it creates a concrete visual improvement; pin dependencies, update `package-lock.json`, and keep the site locally runnable using only `npm install && npm run dev`.

**Quality bar:** This is a substantial visual reconstruction, not a patch of colors, padding or text. Design distinctive polished states on desktop **and** mobile, with intentional choreography and meaningful content density. Never pronounce the work premium or complete simply because the build passes. Review actual screenshots and iterate.

# BATCH 01 — Cinematic hero rebuild + navigation + global motion foundation

## User feedback to resolve in this batch

1. Native scrollbar track/background should be visually transparent; only the thumb visible (while retaining normal scrolling and discoverability).
2. Opening hero must occupy **the whole first viewport** at desktop and phone sizes: absolutely no glimpse of section 02. Account for nav/header and `svh`/`dvh`; no 100vh mobile browser chrome trap.
3. **Delete** the visible `Replay gym assembly` control entirely.
4. Improve EN/SQ/IT language selection and add a satisfying accessible hover/press/focus transition to theme controls; header identity/layout is broadly accepted—refine, don't gratuitously replace the entire brand/navigation system.
5. Current gym animation concept is good but artwork is school-project quality. Replace the primitive line-art SVG gym with **cinematic, commercially credible gym equipment imagery/3D assets**. Hero must start without a completed gym image in place. Actual equipment pieces must enter and settle **sequentially**. Navbar/brand controls should be the **last visual arrival**.
6. Provide a motion system that the later batches can reuse throughout the site.

## Verified starting implementation defects (inspect again in the current tree)

- `src/components/HomePage.tsx` renders `<HeroStage>` and then `.hero-under` outside it; `.hero-stage` in `app/globals.css` is currently `height:clamp(640px,57vw,790px)` and `.hero-stage.intro-hero` overrides it to `height:clamp(660px,62vw,825px)`, not viewport-relative.
- `src/components/HeroStage.tsx` hardcodes a `<button className="replay">` and replay state/callback; delete the UI and its dead logic/translation props.
- `src/components/GymConstruction.tsx` is a hand-authored simplistic path-based SVG (`gym-piece-*`) and the existing assembly CSS drives its staging. The central idea is valid, the rendering standard is not.
- `src/components/SiteHeader.tsx` has tiny outlined inline locale links, a `<details>` mobile menu and `ThemeToggle` from `src/components/ThemeToggle.tsx` using system/dark/light cycling. Existing header entrance CSS includes `header-finally-arrives`.
- Tests in `tests/project.test.mjs` and `tests/browser/site.spec.ts` currently assert *old implementation details* (specific SVG class names/animation delays). Replace brittle tests with behavior-based checks while maintaining the actual quality gates; never remove coverage to get green.

## 1. Creative production route — make the physical assembly unforgettable

Use the current hero as an idea only. Before implementing, write `docs/HERO-PRODUCTION-PLAN.md` comparing **two realizable high-quality asset and motion pipelines**: (A) licensed production 3D models with pre-rendered staged animation (optimized WebM/MP4 + correct posters); (B) excellent optimized 3D GLB/glTF models with choreographed in-browser assembly. A polished sprite/composite sequence is permissible if it genuinely beats both in image quality. Choose by **actual available asset quality, creative control, device performance and bundle footprint**, not personal library preference. Implement the choice, not a speculative plan.

**Asset research is mandatory:** actively search for and inspect real downloadable gym-equipment assets: weight rack, loaded barbell/plates, bench, dumbbells, treadmill/cable equipment, architectural lights, flooring. Research candidates on:

- Poly Haven (CC0 source, license: https://polyhaven.com/license) — useful for HDRIs, textures and models where available.
- Sketchfab downloadable models, **only individually suitable licenses**; credit and link original creator/model where required (https://sketchfab.com/developers/download-api/guidelines). CC-NC is not permitted; don't assume all models permit commercial use.
- Blendkit/BlenderKit licenses and individual asset terms (https://www.blendkit.com/docs/licenses/); distinguish CC0 from Royalty Free and observe distribution limitations.
- Other reputable free/CC0 model sources if directly verified.

Only self-host legally cleared final exported assets. **Do not** embed Sketchfab viewers, hotlink remote videos/models, copy preview images, download from a random Google image result, or ship unverified license claims. Record direct asset URLs, creator, exact license/version/date, attribution placement, any redistribution restrictions and transformations in `docs/ASSET-LICENSES.md`. If an asset cannot be legally or technically obtained, replace it with a valid asset or report the remaining blocker **honestly**; don't silently retreat to the original crude SVG.

**Creative treatment:** film-quality dark athletic architecture with recognizable *real* strength equipment, tactile steel/rubber/leather, intentional metallic reflections, physically motivated linear lighting, strong spatial perspective, mature Aureon brass accents. Gym must not feel like a house/warehouse or fictional sci-fi circuit-board facility. Work from a shot list: empty architectural/black stage → floor foundation → structural beams/zones → rack+plates → bench/weights → cable/cardio → reception/lighting → Aureon software/brand connection. The first equipment silhouette appears rapidly; by ~0.5–1 second the viewer can recognize a gym. Every beat has a reason, weighted ease and real occlusion/shadow depth. After 3–5 seconds the **fully assembled** scene rests as an excellent hero still, not an infinite GPU spectacle.

**Critical first-frame instruction:** There must be **no final gym photo hiding behind** the animation, no cropped duplicate 'already assembled' image, no pretend construction with opacity masks on a complete gym photo, and no fully assembled gym poster showing before motion starts. The empty scene refers to the *gym imagery*, not to the semantic webpage: H1, usable CTA and meaningful product category must exist in HTML from first paint. Use a deliberately empty/architectural initial scene or physically correct early object. Reduced-motion or media-failure users must have an immediate **high-quality completed static fallback**, not a blank void. Ensure no contradiction between video poster selection and the first animated frame. No autoplay audio, aggressive strobe, loading gate or scroll lock.

**Final frame:** a beautifully lit, identifiable gym connected to actual Aureon product capabilities. No giant floating app dashboards, invented access devices or fake door hardware. If you introduce overlays, make them refined product-aware labels with truthful functionality—not pretend live telemetry. Mobile framing must be specifically art-directed (different crop/camera rendition as required), not desktop squeezed to 320 px. Dark and light themes both art-directed: don't use only a grayscale filter.

## 2. Header and first-screen choreography

- Build a truly first-viewport hero, with header integrated/overlaid cleanly. Establish CSS contract so the next section starts **below** the fold at 320×667, 390×844, 1366×768 and 1440×900, even if language, browser zoom or top controls vary. Avoid vertical clipping of headline/CTAs on short phones.
- Only the hero and its initial meaningful content show at arrival; all later sections use entrance behavior on scroll in later batches.
- Stage/machine assembly arrives first. Hero title, supporting caption and CTA use controlled one-by-one arrivals without making them unavailable to assistive technology or causing CLS. **Navbar's visual entrance comes last**, once the assembly has essentially settled; a gentle ease from translateY/opacity/blur (very limited blur) is enough. Do not create a keyboard trap or invisible focusable controls. On non-home/legal pages, navbar must appear immediately. On reduced motion it must appear immediately too.
- Remove `<button className="replay">` fully, associated state/handlers, CSS, user-facing labels and dead imports. No substitute replay UI hidden behind a submenu.
- Simplify/harden hero state for reload/navigation/locale/theme changes. Avoid replay on every React render, restore final state where sensible without adding analytics/tracking. The user should never see broken intermediate hero frames on theme changes.

## 3. Global controls and motion language

- Scrollbar: transparent native track / corner and a slender well-contrasted thumb with hover state if supported. CSS for Firefox (`scrollbar-color`) and Chromium/WebKit (`::-webkit-scrollbar`, transparent track). **Do not** use `overflow:hidden` to suppress a normal vertical scrollbar or implement a fragile custom JS scroll container.
- Language selector: redesign as a compact premium segmented or single-trigger locale switcher with **animated active-state indicator**, clear labels (EN / SQ / IT or language names), proper `aria-current`, route-preserving locale paths including legal routes, and comfortable touch targets. No flag-only affordance, no excessive boxed borders. If popover, proper keyboard/ESC/outside-close. Keep all three visible to users when practical.
- Theme: use `lucide-react` Sun/Moon/Monitor or meaningful alternatives, tactile hover/focus states (icon rotation/slide with restrained motion), correct system/light/dark semantics and accessible label indicating chosen mode. Support mouse/keyboard/touch; keep preference behavior and no hydration flash.
- Establish reusable motion utilities/components for later sections: entrance choreography, inline micro-interactions, restrained spring or strong easing, viewport reveal with reduced-motion fallback, no `transition: all` blanket. Prefer CSS for simple interactions, Motion for genuinely meaningful choreography. No gratuitous parallax or permanent looping.

## Files to inspect/change (adapt as needed)

`src/components/GymConstruction.tsx`, `HeroStage.tsx`, `HomePage.tsx` (hero only), `SiteHeader.tsx`, `ThemeToggle.tsx`, `icons.tsx`, `DocumentShell.tsx`, `app/globals.css`, `src/content/dictionary.ts`, public hero media, source/audit docs, package/lockfile and relevant tests. Keep section 02–06 layouts for Batch 02/03; do not pre-redesign them here.

## Acceptance and evidence — all required

- Screenshots + short recorded opening from **true initial load**, at 0ms, first recognizable equipment, mid-build, final assembled scene, and reduced-motion fallback; no fully assembled gym visible at 0ms on motion-enabled screens. Inspect frame-by-frame for clipping, flat/crude graphics or premature full-image reveal.
- `document.documentElement.scrollWidth <= innerWidth` at 320/390/768/1440; hero fills exactly the first viewport; navbar is last animated entry; `Replay gym assembly` absent in all languages.
- Native scroll preserved; scrollbar track transparent, thumb visible; test Firefox if available.
- EN/SQ/IT selector destinations correct on home and legal page; theme cycle works with visible hover/press/focus feedback and persists.
- No-JS and reduced-motion: meaningful HTML content and working links; stable high-quality still, no hidden header; no blank hero if media fails.
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run check:export`, and focused Playwright browser tests pass. If an external environment prevents any command, say **not verified**, give exact command/error and do not substitute a claim.
- Deliver `docs/BATCH-01-REVIEW.md` with before/after contact sheet paths, chosen scene technique, measured artifact bytes and actual asset licenses, what was tested, and remaining blockers. **Do not commit, push or deploy.**
