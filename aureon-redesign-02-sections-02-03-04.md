> **AUREON WEBSITE / DIRECT IMPLEMENTATION TASK**  
> Apply this prompt to the **latest actual working tree**, starting with the 9 Oct 2026 ZIP `aureon-react-nextjs-landing-page-rebuild.zip` if that is still the latest source. **Do not** edit `gym-app-main`/the platform apps. This is not a mockup request; implement actual code.  
> This is one of **four sequential batches**; execute only this batch, verify it, then stop and report. **Do not commit, push, or deploy** until the user approves the complete redesign.

## Before editing: source and design audit

Read `CLAUDE.md`, `README.md`, `docs/AUREON-SOURCE-FACTS.md`, `docs/BRAND-AND-VISUAL-DIRECTION.md`, `docs/SIGNATURE-EXPERIENCE-MAP.md`, `docs/LEGAL-CONTENT-STATUS.md`, and the current relevant `.tsx` and `app/globals.css` files. Examine the running site at desktop (1440×900), mobile (390×844), and narrow mobile (320×667) in **both** light and dark themes, with screenshots. Read the user's critique and accompanying screenshots. The screenshots may show UI from the immediately preceding build; the **current code** is the implementation authority. If the tree differs, inspect and adapt rather than blindly applying stale selectors.

**Shared non-negotiable constraints:** standalone Next.js App Router + React + strict TypeScript; static export (`out/`), no server runtime or platform secrets; actual Aureon chevron and source-aligned warm brass/deep olive identity; exactly EN/SQ/IT visible and fully translated; one coherent sans-serif family; truthful, source-supported product claims; no imaginary customers, certifications, statistics, authentication flow, gym tenant URL, operator data, or legal approvals. Do not imitate ProGreen, use checker/grid/blueprint backgrounds, decorative radial/circular gradient blobs, generic glowing orbs, or boxy SaaS card farms. Do not make it 'futuristic' by lowering readability. Preserve proper a11y, keyboard interactions, reduced motion, progressive enhancement, SEO metadata, and real URL configuration in `src/config/site.ts`. Use **lucide-react** for interface icons where appropriate; keep Aureon's actual brand SVG, which is not a Lucide icon. Install an animation/3D library only where it creates a concrete visual improvement; pin dependencies, update `package-lock.json`, and keep the site locally runnable using only `npm install && npm run dev`.

**Quality bar:** This is a substantial visual reconstruction, not a patch of colors, padding or text. Design distinctive polished states on desktop **and** mobile, with intentional choreography and meaningful content density. Never pronounce the work premium or complete simply because the build passes. Review actual screenshots and iterate.

# BATCH 02 — Complete expressive rebuild of Section 02 + Section 03 + Section 04

## Goal

The user calls the whole middle of the site generic, empty, unfinished and lifeless. **Completely re-art-direct all three central sections.** The website must now feel like a carefully directed design studio made it, with meaningful software/club-world storytelling and a confident futuristic athletic brand. Don't create filler to occupy space. Distinctive composition + restrained, cohesive motion + useful product narrative matter more than adding a ton of decorative cards.

**Batch prerequisite:** Apply after Batch 01 is completed/checked so hero, navigation, tokens and shared motion system already exist. Inspect actual files and report if the prerequisite hasn't happened. Do not undo Batch 01.

## Verified current code and user problems

- In `src/components/HomePage.tsx`, Section **02** uses `.statement-layout`, the 02 rail, one giant static headline and `.statement-lower` with a tiny isolated `<BrandMark/>` beside a long right-hand paragraph. Screenshot reads 'A gym is more than its equipment' surrounded by dead space.
- Section **03** uses `.section-intro`, a short description on the far right and `src/components/ProductExperience.tsx`: three text tabs (`member`, `front desk`, `management`), a plain left description and a heavily generic invented UI illustration on the right. User likes **the three-perspective idea**, not the empty execution. On mobile, the tab list is horizontally scrollable with an exposed horizontal scrollbar.
- Section **04** is `.roles-heading` plus `roles-list` containing 3 short columns with a tiny arrow and ghosted giant 'AUREON' background word. It looks unfinished, almost like an empty placeholder.
- All user-facing EN/SQ/IT text lives in `src/content/dictionary.ts`. Product truth is registered in `docs/AUREON-SOURCE-FACTS.md`; stay within it, inspect underlying platform source only where actually available.
- Existing global reveal uses `RevealOnScroll.tsx` and `[data-reveal]` as **one animation per giant section**. Bring purposefully staggered child animation without hiding content from JS-disabled or reduced-motion users.

## Overall visual thesis for these three sections

Show the viewer **how a gym actually operates**, with physical → human → software relationships, not 'three SaaS features'. The whole landing page should move between immersive physical context and believable sharp software/product moments. Use source-backed copy and **synthetic demo-only visuals labeled as illustrative** (never pretend these are actual live/customer screens). Introduce well-crafted architectural crops, illustrated interface panels, motion systems, staff/member journey diagrams, choreographed linework, custom iconography from `lucide-react`, selective texture and subtly moving highlights. Each section needs a **clear focal point and a reason to exist**. Be daring in layout while keeping one font family, controlled brass accents, strong contrast and mobile clarity. A section with only text and a huge empty right side fails even if typography is good.

## Section 02 — 'One coherent system' as a visual turning point

Do NOT simply enlarge the current mark or add 3 feature cards. Redesign as a **high-impact transitional composition**:

- One decisive headline, understandable in 3 seconds (the gym is more than equipment; operations span people, spaces and moments).
- Meaningful graphic treatment connecting real-world activity to digital coordination. Preferred direction: an elegant spatial sequence/animated signal line from an architectural gym detail through 'check-in → schedule → team → management' **only when those are sourced**. Could be a thin architectural cross-section, close-up split visual, or a carefully layered operational pathway. The diagram must be legible, not a fake live product screenshot or glowing sci-fi HUD.
- Replace lonely logo in the lower-left and unanchored right paragraph with purposeful visual hierarchy: a short articulate description integrated into composition, one standout interaction/illustration and secondary microcopy/labels that teach something real.
- Use a beautiful entrance choreography on scroll: visual assembles or connects while headline reveals; finite, interruptible, no scroll trapping.
- Distinct desktop + mobile arrangements. Aim for a section rich with meaningful detail, not a near-empty giant viewport.

## Section 03 — Keep 3 perspectives; totally elevate the visual and interaction

Keep the **member / front desk / management** selector concept because the user explicitly likes it. Everything around it may be reconceived:

- Transform `.product-experience` into a polished **product theatre**: a dominant realistic interface composition inside a purposeful device/window framing, with layered context/side-details and useful anatomy, rather than a white generic browser card with three rows. Keep it clearly marked as a representative concept until actual sanitized product screenshots can be verified.
- Use *source-verified* workflows and proper relevant product iconography. Reuse actual Aureon source patterns/colors where safe; never invent capabilities, names of live users, payment figures, access credentials, attendance stats or customer testimonials. If you can derive sanitized screenshots from existing non-personal fixture/mockup routes, prefer true-to-product assets, and document provenance.
- Change of perspective must feel intentional: transition the displayed UI scene + contextual story, not just text swap. Use a responsive shared visual frame, animated active track, keyboard-appropriate tabs (`role=tablist`, Arrow/Home/End support as current code does), proper tabpanel labeling and reduced-motion equivalent.
- Replace a long floating explanation on the **far right** of `.section-intro` with an integrated overline, proof notes, illustrative disclaimer, or short contextual micro-layout that looks deliberate at every width. Keep disclosure text visible yet not visually dominant; no randomly floating two-line paragraph.
- Avoid permanent horizontal tabs that require dragging an unseen scrollbar on phones. Use a 3-state compact accessible segmented control, vertical picker or intentional mobile select/drawer, but keep the three states easy to discover **without horizontal overflow**.
- Each tab must offer *real meaningful visual difference* in the UI panel and copy. Use believable member/front-desk/operator roles and real source terminology, not the same generic panel with a renamed heading.
- Optional micro-interactions: cursor spotlight on desktop, click-triggered explanatory callouts, animated content layers; do not make the component dependent on hover or canvas to understand it.

## Section 04 — Build an actual centerpiece, not three empty columns

The screenshot's `THE MEMBER / THE TEAM / THE OPERATOR` 3 columns and giant low-contrast AUREON word are not an acceptable endpoint. Treat this as a **new signature information design** that connects all roles, with visual proof and movement.

Recommended strong direction: **'One club, three viewpoints — a single connected day'**. Create one compelling continuous timeline/spatial workflow or interactive 3-part stage. A member makes a plan/checks activity, front desk manages check-ins/schedules, management sees operations; labels and visual scenes are **illustrative, not live data**. Alternatively choose another genuinely superior execution and justify it in `docs/BATCH-02-REVIEW.md`.

Required characteristics:

- Richness from crafted illustration/product states, clear details and purposeful content; no empty giant background word as the main graphic.
- Desktop: a coherent foreground composition with readable sequence/dynamic transitions, two or three meaningful zones, tactile surfaces or derived media, clear relationship to platform.
- Mobile: stack/recompose into connected steps/cards **with content**, not a cut-off desktop horizontal diagram, three tiny headings, or scroll-jacking.
- Interaction: scroll-triggered or user-controlled progression with accessible focus/click controls, visible active state, motion under ~500ms for UI transitions, no endless auto-cycling. No hidden essential content.
- Distinct from Section 03: Section 03 is **role-specific product view**, Section 04 proves **how the roles connect as a system**. Do not duplicate three tabs with different background paint.
- Thoughtful ending that naturally leads into Section 05 rather than abrupt blank space.

## Typography, pacing and content rules

- Stop making every section a huge heading + short paragraph in a distant column. Use varied optical balance, deliberate asymmetry, art-directed density and clear negative space. Empty space must frame a meaningful subject, not conceal absent content.
- One cohesive sans-serif, 2 or 3 sizes for primary content tiers, readable body, consistent shared tokens. Use icons with purpose (Lucide), not decorative confetti.
- Avoid a repeat of `hero → three cards → three cards → three cards`; these three sections should have **different compositional logic**.
- Make natural EN/SQ/IT versions with matching intent and similar visual weight. Expand dictionaries if needed, with completeness tests. No raw keys/English bleed on Albanian/Italian pages.

## Main files in scope

`src/components/HomePage.tsx` (02–04 only), `ProductExperience.tsx`, new meaningful presentation components, `RevealOnScroll.tsx` if needed for child sequencing, `app/globals.css`, `src/content/dictionary.ts`, `public/assets/` or properly licensed new media, docs/asset manifest, tests. Don't redo the hero, legal pages, footer or global header in this batch except a narrowly necessary compatibility fix.

## Required QA + definition of done

- Capture before/after desktop (1440/1920), tablet 768, phones 390 and 320; full section screenshots (not just a tiny crop) and video of actual interactions; inspect both themes and at least one long Italian/Albanian headline.
- On 320px: no clipped headings, horizontal scrollbars, missing panels, off-screen role controls, overlapping visual layers or small tap targets. Product views all accessible by touch and keyboard.
- Sections are meaningfully content-rich and fully composed; Section 02 is an identifiable visual story, Section 03 has three **different** polished scenes, and Section 04 demonstrates role connection via actual visual relationship.
- Content remains visible without JS, and essential material remains comprehensible in reduced-motion mode. Animations run once, respect visibility, don't cause layout shift or persistent 60fps work.
- Update behavior-based tests; check EN/SQ/IT. Run `npm run check` plus Playwright tests (`npm run test:e2e` after the required browser setup); record exact pass/fail and reason for anything skipped.
- Produce `docs/BATCH-02-REVIEW.md` listing visual decisions, file edits, actual asset licensing, accessibility checks, screenshots, changes in dependencies and limitations. **Do not commit/push/deploy.**
