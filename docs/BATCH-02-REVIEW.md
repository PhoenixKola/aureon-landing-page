# Batch 02 review: sections 02, 03 and 04

Date: 2026-10-10. Prerequisite: Batch 01 (hero, header, tokens, motion system) was present and untouched apart from the additions noted below. Not committed, pushed or deployed (per brief).

## Source used for truthfulness

The approved product contract is the frozen mockups app in the local platform source (`Gym Platform App/apps/mockups`, read-only):
- roles and navigation: `components/gestionale/nav.tsx` (`ROLES`, `ROLE_NAV`), plus the comment that reception and coordinators close shifts and the till, and the manager reads the closures
- client sections: `app/client/[section]/page.tsx`
- EN/SQ/IT labels: `i18n/dictionaries.ts`
- notices: `components/shared/app-shell.tsx` ("Rinnovi da verificare", "Report settimanale pronto", "Turno scoperto domani")

Everything on the page uses these terms. Nothing claims live data, figures, customers, hardware or integrations.

## Visual decisions

Each of the three sections follows a different compositional logic, so the page no longer reads as "three columns, three times".

| Section | Before | After | Logic |
|---|---|---|---|
| 02 One coherent system | Giant headline, lone chevron, far-right paragraph | **Physical → human → software pathway.** A tall close-up of the loaded bar (rendered from the hero's own 3D gym) anchors the left. A brass signal line runs out of the photo through four stations: Entries → Classes & agenda → Team → Management. Each station has a Lucide icon, a source-backed description and chips naming the real roles that use it (Member, Reception, Course coordinator, Personal trainer, Manager) | Asymmetric photo + editorial path |
| 03 Platform in context | Three text tabs + one generic white card UI; horizontally scrolling tab bar on phones | **Product theatre.** Kept the three-perspective idea. Dark stage; role selector (vertical with a spring-sliding track on desktop, 3-column segmented control on phones with no overflow). The device **morphs** from phone (member app) to desktop (reception, manager). Each scene is different: the member week with next class, trainer appointment, progress, bookings and real tab bar; the reception Entries table with membership statuses, today's classes and a "Renewals to verify" notice; the manager dashboard with real notices, valueless charts, staff-on-shift strip and the manager's real navigation. Numbered markers link to "What you're looking at" notes, which highlight that region and dim the rest. The disclosure is a quiet pill inside the stage | Centred device stage |
| 04 Built for the way gyms work | Three thin columns + ghost "AUREON" word | **One connected day.** A swimlane matrix: three lanes (Member / Front desk / Management) × five moments (07:10 booking → 09:30 arrival → 13:00 renewal → 17:30 cover → 22:00 closing). Every cell has content. The active moment is lit, its origin is tagged "Starts here", and a brass connector draws from the origin lane to the others. User-stepped with prev/next, click or arrow keys, a progress rail, and screen-reader announcements; no auto-cycling. On phone/tablet: five stacked cards, each with the three lanes and a connector spine, with all content visible. It ends on "Look closer at the details ↓", linking to section 05 (`#details`) | Full-width information design |

Section 03 shows **role-specific product views**; Section 04 proves **how the roles connect**. They do not duplicate each other.

## Motion

- `data-reveal="fade"` per section plus `data-reveal-item` children, staggered through the Batch 01 system (`--i`).
- 02: the track draws from the photo across the stations (1.7 s); the nodes spring in one by one; a single signal dot travels the line **once**.
- 03: the device morphs (max-width and radius, 550 ms); the screen and story enter in 450–480 ms; the selector track springs (450 ms).
- 04: the progress rail fills (450 ms); the connector clips open from the origin and its dot pops (500 / 350 ms).
- Nothing loops, nothing runs per frame, and there is no scroll-jacking. Reduced motion removes all of these; the content is identical.

## Files

New: `src/content/sections.ts` (typed EN/SQ/IT copy for 02–04), `src/components/sections/{SystemPath,ProductTheatre,ProductScreens,ConnectedDay}.tsx`, `public/assets/scenes/plates-{dark,light}.webp`, `scripts/{render-scene-shots,shoot-sections,shoot-interactions-02,record-interactions-02}.mjs`.
Changed: `HomePage.tsx` (02–04 replaced; `id="details"` on 05), `app/globals.css` (Batch 02 block; 118 obsolete rules removed), `dictionary.ts` (14 dead keys × 3 locales removed), `gym-scene.ts`, `HeroScene.tsx` and `DocumentShell.tsx` (editorial `#hero-shot=plates` camera for still rendering only; no change to the hero), tests, docs.
Removed: `src/components/ProductExperience.tsx`.

## Dependencies

None added. Uses the existing `lucide-react@0.544.0` and `three@0.180.0` (the latter only offline, to render the close-up).
Bytes: initial JS 175 → 179 KB gzip; CSS 8 → 11 KB gzip; Section 02 image 66 KB (dark) / 103 KB (light), lazy.

## Accessibility checks

- Theatre: `role=tablist/tab/tabpanel`; `aria-selected`, roving `tabIndex`; Arrow (all four), Home and End; the panel is labelled by the tab and described by the role story. The illustration is `aria-hidden`; its meaning is carried by the story and the anatomy buttons (`aria-pressed`). Tabs on phones are ≥ 44 px tall (tested).
- Day: step buttons with `aria-current="step"`, arrow/Home/End, labelled prev/next, and a polite live region announcing "Moment n/5: time, title". Desktop and mobile versions swap with `display:none`, so assistive technology never reads both.
- No JS: all three sections are fully visible and readable (tested in Italian). Reduced motion: no animation, same content.

## Evidence (`evidence/batch-02/`)

- `before/{platform,connected,gyms}-{desktop,tablet,phone,narrow}-{dark,light}.webp`
- `after/{platform,connected,gyms}-{wide,desktop,tablet,phone,narrow}-{dark,light}.webp`, plus Albanian (`-sq`: desktop + narrow, both themes) and Italian (`-it`: desktop + phone, dark)
- `interactions/theatre-{member,desk,manager}-{desktop,phone}-{dark,light}.webp`, `day-step{3,4}-desktop-*.webp`, Italian `theatre-*-{desktop,narrow}-light-it.webp`
- `video/sections-desktop-dark.webm`, `video/sections-phone-dark.webm`: scroll, role switching, anatomy and stepping, recorded under software WebGL

Screenshots use reduced motion so every element is in its final state. Fixed header and dev badge are hidden for clean full-section captures.

## Tests (exact results)

| Command | Result |
|---|---|
| `npm run check` (audit, typecheck, 12 unit tests, build, export) | pass |
| `npx playwright test` (11 tests). New: theatre keyboard/scenes/anatomy; day stepping; 320 px in EN/SQ/IT (no overflow, tabs within the viewport and ≥ 44 px, 5 cards); no-JS readability | 11 passed (Chromium) |

New unit tests: EN/SQ/IT copy for 02–04 has an identical shape, no empty strings, and no English sentence reused in SQ/IT; old placeholder layouts are gone; the theatre keeps its tab semantics.

## Limitations

- Interface scenes are hand-built representative concepts in product tokens, not sanitized screenshots. The mockups app could be screenshotted, but its fixtures contain Italian personal names and figures, which this site must not show. Redacted bars stand in for names.
- Class names ("Strength foundations", "Indoor cycling"), times and "Studio 2" are illustrative examples, as the page states.
- At 1181–1300 px the day matrix cells are tight (about 3–4 lines each), but still readable.
- Real-device and real-GPU testing remain outstanding (as in Batch 01).
