> **AUREON WEBSITE / DIRECT IMPLEMENTATION TASK**  
> Apply this prompt to the **latest actual working tree**, starting with the 9 Oct 2026 ZIP `aureon-react-nextjs-landing-page-rebuild.zip` if that is still the latest source. **Do not** edit `gym-app-main`/the platform apps. This is not a mockup request; implement actual code.  
> This is one of **four sequential batches**; execute only this batch, verify it, then stop and report. **Do not commit, push, or deploy** until the user approves the complete redesign.

## Before editing: source and design audit

Read `CLAUDE.md`, `README.md`, `docs/AUREON-SOURCE-FACTS.md`, `docs/BRAND-AND-VISUAL-DIRECTION.md`, `docs/SIGNATURE-EXPERIENCE-MAP.md`, `docs/LEGAL-CONTENT-STATUS.md`, and the current relevant `.tsx` and `app/globals.css` files. Examine the running site at desktop (1440×900), mobile (390×844), and narrow mobile (320×667) in **both** light and dark themes, with screenshots. Read the user's critique and accompanying screenshots. The screenshots may show UI from the immediately preceding build; the **current code** is the implementation authority. If the tree differs, inspect and adapt rather than blindly applying stale selectors.

**Shared non-negotiable constraints:** standalone Next.js App Router + React + strict TypeScript; static export (`out/`), no server runtime or platform secrets; actual Aureon chevron and source-aligned warm brass/deep olive identity; exactly EN/SQ/IT visible and fully translated; one coherent sans-serif family; truthful, source-supported product claims; no imaginary customers, certifications, statistics, authentication flow, gym tenant URL, operator data, or legal approvals. Do not imitate ProGreen, use checker/grid/blueprint backgrounds, decorative radial/circular gradient blobs, generic glowing orbs, or boxy SaaS card farms. Do not make it 'futuristic' by lowering readability. Preserve proper a11y, keyboard interactions, reduced motion, progressive enhancement, SEO metadata, and real URL configuration in `src/config/site.ts`. Use **lucide-react** for interface icons where appropriate; keep Aureon's actual brand SVG, which is not a Lucide icon. Install an animation/3D library only where it creates a concrete visual improvement; pin dependencies, update `package-lock.json`, and keep the site locally runnable using only `npm install && npm run dev`.

**Quality bar:** This is a substantial visual reconstruction, not a patch of colors, padding or text. Design distinctive polished states on desktop **and** mobile, with intentional choreography and meaningful content density. Never pronounce the work premium or complete simply because the build passes. Review actual screenshots and iterate.

# BATCH 03 — Make Section 05, conversion CTA, and footer feel elite

## Mission

The user likes the general FAQ/accordion idea and the big gold closing panel, but both are bland and nearly devoid of motion. The last half of the homepage should feel as art-directed and compelling as a flagship digital product, **not** a handful of React tutorial components. Preserve recognizable section goals while fully polishing visuals, interactions, copy density and responsive behavior.

**Prerequisite:** Batches 01–02 implemented in current working tree. Inspect their actual changes first; do not override their new tokens or animations. Scope is **Section 05, Section 06, global footer**, plus targeted polish at their boundaries only.

## Verified implementation starting points

- `src/components/HomePage.tsx` currently renders Section 05 with `.depth-layout`, a fixed `gym-interior.webp` picture, and `.accordion` made from native `<details open={i===0}>` with no measured/animated expansion. Screenshot: fairly decent big gym photo but basic four-rule list, little visual response when opening.
- Section 06 `.final-section` uses flat brass/gold fill, headline and a dark rectangular CTA; content is functionally correct, but visually generic. `site.appEntryUrl` in `src/config/site.ts` deliberately controls availability; keep that safety behavior.
- `src/components/SiteFooter.tsx` ends with `footer-bottom` containing copyright/preview notice only; **there is no Nivello credit**.
- `src/content/dictionary.ts` contains `capabilities`, `final*`, footer/legal labels; all visible UI must remain proper EN/SQ/IT.

## Section 05 — Premium feature/depth experience, animated accordion

Do not turn this into another 4 SaaS cards. Keep an image-led, informational deep-dive, but sharpen the sense of composition. Proposed direction: **'Behind every session: the platform at work'** with a gorgeous licensed visual or existing true-to-product art directed crop paired with **an interactive content rail**.

- The 4 capability items currently cover member journeys, scheduling, desk operations, and browser radio. Maintain only code-verified features (`docs/AUREON-SOURCE-FACTS.md`) and realistic qualifiers. This section is *not* a general Q&A; it is a structured explainer. You may rename the visible category to 'A closer look' or equivalent appropriate localized label.
- Implement polished **animated accordion transitions**: smooth height/opacity reveal, text and subtle supporting micro-graphics, icon rotation `Plus`↔`Minus` or `ChevronDown`, indicator movement and active-state accent. Quality spring/easing, no jerky native `<details>` snap. React state + accessible buttons (`aria-expanded`, `aria-controls`) and responsibly animated height/auto, or a supported accessible library if necessary. `motion/react` is acceptable: https://motion.dev/examples/react-accordion ; do not add it if simpler CSS can do the job well. Respect reduced-motion and ensure keyboard navigation, focus, clickable summary area, screen-reader output.
- Enhance the visual accompaniment: not one identical still for all 4 entries if a better source-accurate visual story can be created. Could subtly change crop, reveal an adjacent contextual screenshot/caption or move a visual highlight per active item; changes must look intentional, not an arbitrary random swap.
- On mobile, place visual and accordion in a good readable order; no unnecessary 680px tall picture before the user can read content. Do not sacrifice accessible touch size or contrast for minimalism.
- Refine content: concise high-quality copy with enough specificity; avoid vague one-line claims or awkward developer phrasing such as 'The codebase contains...'. Present feature as a **measured visitor benefit**, only where source supports it. Keep EN/SQ/IT translations equivalent, and ensure illustrative status remains clear.

## Section 06 — Convert the gold CTA into a memorable ending

This is a key emotional landing point. The current screenshot looks like gold background + giant slogan + one dark button. Keep the brand brass direction **but build a designed closing experience**:

- Consider a restrained architectural crop or final gym-to-software visual echo from the opening: perhaps a carefully cropped finished scene/linear light or tonal stepped panels, leading eye to the single genuine action. High-end contrast, no glowing radial blobs/no ornamental background grid.
- A satisfying *interaction-ready* CTA: hover/press with controlled arrow travel, texture/light shift or mild magnetic response where appropriate. Visible `:focus-visible`, large touch target and reduced-motion fallbacks. Use Lucide arrow icons consistently, not random glyphs.
- Type treatment dramatic but mature and readable, with a distinct visual hierarchy. The last section should *feel completed*, not a blank area next to copy.
- **Routing honesty is mandatory:** if `APP_ENTRY_URL` is not verified/configured, don't display a false 'Open App' button or fake direct login. Show a real useful `Explore the platform` action or a quieter in-page exploration invitation, and keep the dev-preview explanation appropriately styled. If configured, the hero/CTA can direct to the verified tenant Client Web URL only. Do not invent a product demo, trials, contact form, payment or sales pipeline.
- Finish with a visually seamless, crafted transition into the footer. No gratuitous repeating motion.

## Footer redesign + required Nivello credit

Preserve legal links, correctly localized destinations and brand; polish footer density, layout, typography, hover states, mobile link grouping, brand mark and relevant site navigation. Add **exactly this recognizable rendered wording** in the footer for all locales (Italian branding phrase kept as requested):

`Realizzato con ⚡️ da Nivello`

Implement accessible, semantic React/TSX equivalent to the supplied pattern:

```tsx
<span className="text-sm text-paper/75">
  Realizzato con <span aria-hidden="true">⚡️</span> da{' '}
  <a href="https://www.nivello.it" target="_blank" rel="noopener noreferrer"
     className="font-extrabold text-accent transition-colors hover:text-amber-300">
    Nivello
  </a>
</span>
```

This repo currently uses custom CSS, not necessarily Tailwind; **adapt the styles to existing CSS/tokens rather than pasting Tailwind classes that do nothing**. The rendered phrase and URL must match, with legible color/hover and focus states in both themes. Place in the footer's lower row without crowding the copyright or legal status. No fabricated legal company info or social accounts.

## Files in scope

`HomePage.tsx` (only 05/06), a dedicated animated accordion component where justified, `SiteFooter.tsx`, `icons.tsx`, `src/content/dictionary.ts`, `app/globals.css`, allowed new licensed assets and docs/tests. Preserve the hero, Section 02–04 and header from previous batches; don't rework legal UI until Batch 04.

## Mandatory evidence and gates

- Video showing accordion open/close transitions, active-state visuals, image/context changes and focus/keyboard. Test rapid repeated clicks and browser back/nav; no jumping/scroll shift or overlapping content.
- Screenshots: full Section 05, gold ending and footer in desktop light/dark and 320/390 mobile; at least Italian/Albanian longer copy. Inspect visually and iterate.
- Footer Nivello credit present and linked correctly, with the lightning symbol non-announced; no visible broken Tailwind class usage.
- `APP_ENTRY_URL` configured and unconfigured behavior verified (no fake link); external links safe; no new marketing forms or trackers.
- `npm run check`, Playwright interactions/accessibility tests and no-horizontal-overflow check. Capture exact failures if tools unavailable; do not claim browser checks you didn't perform.
- Create `docs/BATCH-03-REVIEW.md` containing design decisions, screenshots/recordings, source-backed copy notes, new dependencies and remaining blockers. **Do not commit/push/deploy.**
