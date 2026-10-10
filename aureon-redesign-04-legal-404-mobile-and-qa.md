> **AUREON WEBSITE / DIRECT IMPLEMENTATION TASK**  
> Apply this prompt to the **latest actual working tree**, starting with the 9 Oct 2026 ZIP `aureon-react-nextjs-landing-page-rebuild.zip` if that is still the latest source. **Do not** edit `gym-app-main`/the platform apps. This is not a mockup request; implement actual code.  
> This is one of **four sequential batches**; execute only this batch, verify it, then stop and report. **Do not commit, push, or deploy** until the user approves the complete redesign.

## Before editing: source and design audit

Read `CLAUDE.md`, `README.md`, `docs/AUREON-SOURCE-FACTS.md`, `docs/BRAND-AND-VISUAL-DIRECTION.md`, `docs/SIGNATURE-EXPERIENCE-MAP.md`, `docs/LEGAL-CONTENT-STATUS.md`, and the current relevant `.tsx` and `app/globals.css` files. Examine the running site at desktop (1440×900), mobile (390×844), and narrow mobile (320×667) in **both** light and dark themes, with screenshots. Read the user's critique and accompanying screenshots. The screenshots may show UI from the immediately preceding build; the **current code** is the implementation authority. If the tree differs, inspect and adapt rather than blindly applying stale selectors.

**Shared non-negotiable constraints:** standalone Next.js App Router + React + strict TypeScript; static export (`out/`), no server runtime or platform secrets; actual Aureon chevron and source-aligned warm brass/deep olive identity; exactly EN/SQ/IT visible and fully translated; one coherent sans-serif family; truthful, source-supported product claims; no imaginary customers, certifications, statistics, authentication flow, gym tenant URL, operator data, or legal approvals. Do not imitate ProGreen, use checker/grid/blueprint backgrounds, decorative radial/circular gradient blobs, generic glowing orbs, or boxy SaaS card farms. Do not make it 'futuristic' by lowering readability. Preserve proper a11y, keyboard interactions, reduced motion, progressive enhancement, SEO metadata, and real URL configuration in `src/config/site.ts`. Use **lucide-react** for interface icons where appropriate; keep Aureon's actual brand SVG, which is not a Lucide icon. Install an animation/3D library only where it creates a concrete visual improvement; pin dependencies, update `package-lock.json`, and keep the site locally runnable using only `npm install && npm run dev`.

**Quality bar:** This is a substantial visual reconstruction, not a patch of colors, padding or text. Design distinctive polished states on desktop **and** mobile, with intentional choreography and meaningful content density. Never pronounce the work premium or complete simply because the build passes. Review actual screenshots and iterate.

# BATCH 04 — Legal-page composition, active TOC, genuine 404, mobile excellence, full release-grade QA

## Goal

This batch turns a beautiful-but-incomplete desktop preview into an **actually coherent, impressive cross-device website**. Repair the 404 bug, upgrade legal UX without disturbing legal truth, redesign the mobile menu, and inspect/refine **every** section after Batches 01–03. No 'done' without screenshots and behavior tests.

**Prerequisite:** Completed Batches 01, 02 and 03 in the current working tree; inspect their diff and visual evidence. Don't undo their hard-earned art direction, media, brand or motion. Focus on legal, responsive navigation, localization, 404 and whole-site polish.

## Concrete evidence from current source and user screenshots

- Legal screens are readable but `.legal-hero` is heavily left weighted with unused right-hand space; TOC `src/components/LegalPage.tsx` is only static anchor links; each `.legal-chapter` starts with awkward separate `01 / 06` and big heading block. User wants balanced composition, refined chapter hierarchy and **active TOC item while scrolling**.
- `src/components/NotFoundPage.tsx` already exists, as do route-group files `app/(en)/not-found.tsx`, `app/(sq)/sq/not-found.tsx` and `app/(it)/it/not-found.tsx`. However the screenshot of `http://localhost:3000/sa/` shows **Next.js's generic default 404**. Diagnose App Router route-group boundaries/static export unknown-route handling instead of saying '404 exists'. Make the real unknown URL return a designed brand 404 with HTTP 404 in dev/production. A root-level `app/not-found.tsx` and correct root layout restructuring may be needed; make changes compliant with Next.js and static export.
- `SiteHeader.tsx` mobile navigation currently uses `<details className="mobile-menu">` plus an absolutely positioned white dropdown, no immersive motion, limited focus management; screenshot shows small menu panel abruptly covering hero. User says mobile navbar can be much better.
- At least one mobile screenshot of `ProductExperience` exposes a horizontal scrollbar; a screenshot of the native browser scrollbar shows a conspicuous dark track. Batch 01–02 should address these; **re-test them** here rather than assuming done.

## 1. Legal pages — keep content/legal status honest; art-direct every detail

Retain 5 legal pages × EN/SQ/IT, with actual data placeholders/approval gating from `src/config/site.ts`, `docs/LEGAL-CONTENT-STATUS.md` and related docs. No invented legal address, entity, jurisdiction, retention periods, privacy grounds or GDPR-compliance claims. All legal copy is still a **draft** until actual client facts and professional review exist.

**Design changes:**

- Rebalance the upper legal hero. Left: concise title and descriptive lead. Right: an art-directed **document identification panel**, small 'current section/chapters' preview, a typographic policy index, minimal linework/verified brand motif, or another meaningful/legal-relevant composition. Nothing faked like certification stamps or approval badges. No giant blank right third. Respect one sans-serif family, both themes and natural translations.
- Rethink chapter heading/index design. Remove the awkward orphan `01 / 06` over a generic heading. Make an integrated, sophisticated section index treatment aligned with the title (number in rail, stable left aligned label, fine divider etc.). Keep scanability, strong contrast and printable clean layout.
- Upgrade TOC into responsive **scroll-spy** navigation: currently viewed section automatically highlights with tasteful visual bar/active color, updates `aria-current="location"` or equivalent, correct active state on direct hash URL, click, scrolling up/down, reload and at page bottom. Use IntersectionObserver with tuned `rootMargin` or carefully designed scroll measurement; avoid observers firing multiple active items/jitter. Preserve ordinary `<a href="#section-#">` anchors without JS. Sticky desktop TOC must not get cut off on 768px/short-height devices. On phone use an intentional compact chapter jump UI without a huge permanent sticky panel or broken focus.
- Keep heading semantics (`h1` page title, `h2` chapter), accessible links and 60–80ch article reading measure; handle long Albanian and Italian legal copy without overflow. Smooth scroll respects reduced motion. Section anchors must account for header height; print layout should be clean with no sticky artifacts.
- The small 'Draft — not approved for publication' information remains truthful in developer preview; it must be designed, not removed. `release:check` continues to **fail** when legal identity/approval missing. No false 'public-release-ready' status.

## 2. Real root 404 + locale-aware behavior

- Diagnose the actual Next.js App Router layout issue: current route-group `not-found.tsx` components do not catch tested unknown root `/sa/` as expected. Fix the hierarchy, not by adding a fake page at `/sa/`.
- Deliver a designed **Aureon 404** with strong but tasteful visual impact consistent with the rest of the site, clickable correct home navigation, beautiful both themes, visible at 320px, and **correct HTTP 404** for unknown routes in dev and exported host. Preserve localization for known `/sq/…` and `/it/…` routes where the framework/server can infer locale; do not claim arbitrary prefix localization when unsupported by static export. Unrecognized locales should safely fall back to EN 404, not look like crashed app.
- Test direct open, refresh, back navigation and links for `/sa/`, `/not-a-real-page/`, `/sq/nope/` and `/it/nope/`. For a static export, verify real 404 fallback document/host setup (`out/404.html`, Apache/Nginx instructions); do not turn not-found into HTTP 200. Avoid catch-all logic that forces runtime server features and breaks `output:'export'`.
- Include SEO robots behavior/noindex for error content if appropriate and ensure no fake 404 entries in sitemap.

## 3. Make the mobile navbar memorable and usable

- Replace the abrupt tiny `<details>` dropdown with an intentional **premium mobile navigation experience**: robust overlay, bottom/side sheet, or full-height panel thoughtfully designed from the Aureon visual language (not copied from unrelated sites). Animated open/close (200–350ms approximate) with readable typography, well-spaced destinations, elegant brass active line, cross/close icon (Lucide), integrated language/theme controls, and deliberate small-view design. It should feel as designed as the hero, not look like a native select expanded over it.
- Implement accessible button + `aria-expanded`, `aria-controls`, Escape key, outside press if appropriate, correct focus transfer and return, no focusable hidden links, background interaction policy (if dialog-style modal, actually trap focus and lock body **while open only**), close on route/hash selection, clear current-page state and restoration after theme/locale changes.
- On 320×667 no cut-off panel, overlap with browser UI, ghost scrollbars or impossible-to-close menu; account for safe area. Prefer robust body scrolling in page and correct scroll restoration. Touch targets aim at 44px. Desktop nav still excellent and preserves Batch 01's entrance rule on homepage.
- Test no-JS path: navigation must remain available in a meaningful fallback (or offer normal anchor links that don't require hydration to access them).

## 4. Cohesion pass — the entire site, no cheap shortcuts

Revisit all pages/sections after the redesign with a genuine **art director's eye**. Fix optical spacing, inconsistent text widths, lone floating description blocks, page rhythm, image sharpness, scale, line break quality, icon sizing, keyboard/focus states and transitions. Validate consistency of hero, Sections 02–06, footer, legal and 404 without flattening them into one repetitious template. Everything should feel *from one design system*. Use Lucide React consistently for control icons, source-correct SVG for the brand. Polish both light/dark color schemes independently. Text must read naturally in EN/SQ/IT, not overflow or turn into raw keys. No foreign live customer data/analytics/tracking and no fake features.

Test matrix at minimum: home + one legal + 404 for EN/SQ/IT; homepage all sections at 320×667, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080; both themes; touch/mobile menu; keyboard, Escape, focus visible, active legal TOC; reduced motion; missing hero media/network failure; app URL configured/unconfigured; after JS blocked, semantic content and links still usable.

## Testing and final handoff gates

1. Run `npm install`/`npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run check:export`, `npm run test:e2e`, and `npm run release:check`; the **last command is expected to block publication** until real operator/legal/app facts are provided; don't 'fix' that by weakening safety.
2. Run real Playwright/Chromium screens; also test Safari/WebKit and Firefox if available. Track horizontal overflow programmatically; capture whole-page light/dark screenshots plus 0ms/intermediate/final hero movie frames. Audit contrast, reduced motion, focus controls, legal TOC and new 404 HTTP status. No claiming passed if browser unavailable.
3. Review `docs/ASSET-LICENSES.md`: every new external asset cleared, self-hosted with attribution where needed. Verify licenses for models/textures/typography, optimize media sizes, no remote third-party trackers.
4. Verify static route export including 15 legal URLs + 3 localized homepages, 404.html, sitemap/hreflang and no broken internal links; use release check to flag missing SEO origin and legal approver honestly.
5. Update docs (`docs/UX-UI-ACCEPTANCE-MATRIX.md`, `docs/VISUAL-QA-REPORT.md`, `docs/SEO-PERFORMANCE-REPORT.md`, `docs/FINAL-PRODUCTION-SIGNOFF.md`) with **actual evidence**, not unmeasured scores or fake signoff.
6. Create `docs/BATCH-04-FINAL-REVIEW.md`: concise changed-files summary, test results with commands, screenshot/video contact sheet, responsive/theme/a11y issues fixed, remaining real release blockers. If users need data (verified URL, operator/legal facts), clearly list exactly what and where to configure without stalling local development.
7. Do not commit, push, deploy or alter the Aureon platform. Stop after a complete local implementation and truthful final report; user will review it.

**Definition of success:** Every section is intentionally designed; arrival is cinematic and the navbar enters last; the hero owns the first viewport; content below is bold and sophisticated without being cluttered; language/theme controls feel alive; 03 is a first-class product experience; 04 is a finished connected-role story; accordion animates beautifully; CTA/footers are sharp; legal TOC tracks scroll; `/sa/` shows a true custom 404; mobile feels like a designed product. Local `npm install` + `npm run dev` works with no hidden setup, while production release remains gated by real information.
