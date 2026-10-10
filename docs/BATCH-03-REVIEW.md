# Batch 03 review: Section 05, closing Section 06, footer

Date: 2026-10-10. Prerequisite: Batches 01–02 present; their tokens, motion system and sections are unchanged. The only edits to their code: four camera shots added to `gym-scene.ts`, the matching hash list in `HeroScene.tsx`, and `slug` passed to the footer in `DocumentShell.tsx`. Not committed, pushed or deployed.

## Design decisions

### Section 05: "Behind every session, the platform at work."
- **Composition:** a sticky image frame on the left, with an interactive rail on the right. Every item has its **own** scene, rendered from the hero's 3D gym:
  - Member journeys → bench and free weights
  - Scheduling → functional trainer
  - Front desk → wide view as seen from the desk
  - Sound → linear lights and timber wall
  - Each scene carries a matching product-token detail card (member view, Thursday agenda, Entries today, Radio now playing) plus a caption and a 0n/04 index.
  - Scenes crossfade with a slow scale-settle (700 ms / 1.6 s); the card and caption rise in (600 ms). The visual change is tied to the item, not random.
- **Accordion:** replaced native `<details>` with buttons (`aria-expanded`, `aria-controls`), `role="region"` panels labelled by their buttons, and `inert` on closed panels after hydration.
  - Height animates through `grid-template-rows: 0fr→1fr` (600 ms ease-out): no measuring, it interrupts cleanly on rapid clicks, and it causes no scroll shift (tested).
  - Content fades and lifts in with a 120 ms delay.
  - A brass bar grows down the open item (`scaleY`); the number and icon disc turn brass; the toggle morphs from Lucide `Plus` to `Minus` (rotate + crossfade, spring).
  - One item is open at a time; the open item can be collapsed, and the visual keeps showing the last opened item.
- **Mobile (≤1060 px):** the sticky image is removed, so there is no 680 px picture before the text. Each open panel shows its own 16:10 scene and detail card inline, after the text. Buttons are ≥ 76 px tall.
- **No JS:** every panel renders expanded and readable (`html:not(.js)`, tested). Reduced motion: no transitions, identical content.

### Section 06: the closing panel
- The brass panel is built as **stepped tonal planes** (hard-stop linear gradient, a slightly deeper set in dark theme). On narrow screens the steps become thin vertical strips at the right edge, so they never cut through content.
- The right side echoes the opening: the hero's finished gym at night, framed, with the chevron caption.
- Type: two-line headline; the second line is in a deeper brass-brown, still readable on the panel.
- **CTA:** a 68 px pill in dark ink with a brass icon disc.
  - Hover: a one-pass light sweep, the arrow travels, and a mild magnetic lean (mouse pointers only; disabled for touch and reduced motion).
  - Press: scale .97. Focus: a 3 px ink outline with offset.
- **Routing honesty:** the closing panel follows `site.appEntryUrl`.
  - Unconfigured: a single "Explore the platform" button to `#platform`, plus a quiet preview chip ("App entry is not configured in this preview").
  - Configured: "Open your club's app" to the verified URL, with a secondary "Explore the platform" link and different body copy.
  - No demo, trial, form, payment or sales flow was added.
- A **Revisit** row links back to sections 02–05, so the page feels finished rather than ending on a blank.
- **Transition to the footer:** three tonal bands (brass → bronze → near-olive) that draw in left-to-right once when revealed.

### Footer
- Brand block: wordmark with the chevron box, a large tagline, and the existing note.
- Three columns:
  - Platform: in-page anchors, plus contact or website only if configured
  - Legal: all 5 pages, with `aria-current` on the active one
  - Language: EN/SQ/IT; each link preserves the current page, including legal pages (tested)
- Bottom row: © year, the release-status chip (unchanged logic), the Nivello credit, and Back to top.
- **Nivello credit:** renders exactly `Realizzato con ⚡️ da Nivello` in all locales, wrapped in `lang="it"`.
  - The emoji is `aria-hidden`.
  - The link goes to `https://www.nivello.it` with `target="_blank" rel="noopener noreferrer"`.
  - Styled with the project's CSS (paper at 75% opacity; link in brass, hover `#fcd34d`, brass focus outline). No Tailwind classes; a test guards against them.
- Mobile: links regroup into two columns (one below 380 px); the bottom row stacks.

## Source-backed copy
- Member sections: profile, membership, training, progress, bookings (`apps/mockups/app/client/[section]`, `apps/client-web/app/member/*`); "each club decides" follows the tenant configuration in `AUREON-SOURCE-FACTS.md`.
- Scheduling: classes, the course timetable and trainer appointments (gestionale `classes`, `calendar`, `ptAgenda`; client `bookings`, `agenda`). The wording says "planned in the same system members book from"; it does not claim real-time sync.
- Front desk: Entries, Members, Memberships and Till, in the reception navigation order; "renewals to verify" comes from the app-shell notices.
- Radio: `PRODUCT-CONTRACT.md` says browser-based, MP3 upload / audio library, playlists, schedule, announcements, browser playback, and no required hardware. The copy says exactly that.
- The old "The codebase contains…" phrasing is gone. The illustrative status stays visible: "Illustrative scenes and interface details. What each club sees depends on its own setup."
- All new copy lives in `src/content/sections.ts` (`s05`, `s06`, `footer`) in EN/SQ/IT. The shape-parity and no-English-bleed test covers it. Dead dictionary keys were removed (`capabilities*`, `final*`, `linkMissing`).

## Dependencies
None added. `motion` was not needed: CSS grid-row height animation is smooth, interruptible and reduced-motion friendly.
Bytes: initial JS 179 → 181 KB gzip; CSS 11 → 13 KB gzip. New images: 8 scene renders (76–160 KB each, lazy, only the active theme displays). `gym-interior.webp` is no longer rendered.

## Evidence (`evidence/batch-03/`)
- Before: `before/{details,entry,footer}-{desktop,phone,narrow}-{dark,light}.webp`
- After: `after/{details,entry,footer}-{wide,desktop,tablet,phone,narrow}-{dark,light}.webp`; Albanian `-sq` (desktop + narrow, light); Italian `-it` (desktop + phone, dark)
- States: `interactions/accordion-item{1..4}-desktop-{dark,light}.webp`, `interactions/cta-hover-desktop-{dark,light}.webp`
- Video: `video/details-cta-footer-{desktop,phone}-dark.webm`, showing item switching, keyboard Enter/Tab/Space, 6 rapid clicks, browser back/forward, CTA magnetic hover and the credit hover (software WebGL, Chromium)

## Gates (exact results)
| Check | Result |
|---|---|
| `npm run check` (audit, typecheck, 15 unit tests, build, export) | pass |
| `npx playwright test` (15 browser tests). New: accordion single-open + visual sync + `inert` + Enter/Space + 7 rapid clicks with < 2 px scroll drift; closing CTA honest `#platform` with no external link in `#entry`; Nivello text/emoji/href/rel/target; no overflow at 1440 EN, 390 IT, 320 SQ; footer language links keep `/sq/terms/` → `/it/terms/`; no-JS panels readable | 15 passed |
| `APP_ENTRY_URL=https://club.aureon-demo.it npm run build` (placeholder, verification build only, not kept) | 4 links to the URL (header, mobile menu, hero, closing), "Open your club's app" present, preview chip absent, IT variant present |
| Unconfigured build (current) | 0 app links, explore CTA `href="#platform"`, preview chip shown |

## Remaining blockers / limits
- Real GPU and real-device testing remain outstanding (all browser runs used software WebGL).
- `social-preview.webp` still derives from the old generated interior. Regenerating it from the 3D scene fits Batch 04 (SEO/QA).
- The configured-state closing panel was verified from the built HTML, not screenshotted.
