# Design and UX acceptance matrix (after Batches 01–04, 2026-10-10)

Every "PASS" below has an automated test or a captured screenshot/video. The commands and evidence paths are listed in `docs/BATCH-04-FINAL-REVIEW.md`.

| Requirement | Implementation / proof | Status |
|---|---|---|
| Standalone site, no platform edits | Own package, static export; the platform source was only read | PASS |
| Aureon identity: source chevron, brass/olive tokens | `BrandMark` path from `BrandChevron`; source tokens used in product illustrations | PASS |
| Hero fills the first viewport at 320/390/768/1366/1440 | `100svh` hero; e2e checks hero height = viewport and the next section starts at or below the fold | PASS (Chromium, Firefox, WebKit) |
| Empty first frame, sequential 3D assembly, navbar last | three.js scene; frames `evidence/batch-01/frames`, `evidence/batch-04/hero-frames`; e2e "header hidden until settled" | PASS |
| Reduced motion / repeat visit / no JS / WebGL failure | Completed still + immediate header; e2e for reduced motion, no JS and a blocked 3D chunk | PASS |
| Sections 02–06 art-directed, different compositions | Batch 02/03 reviews; full-page shots `evidence/batch-04/full` | PASS (art review by owner pending) |
| Product truth | Copy grounded in the approved mockups; illustrations labelled, no data, people or figures | PASS with qualifiers |
| EN/SQ/IT complete, no English bleed | Unit tests: shape parity + no reused English sentences; 320 px checks in SQ/IT | PASS |
| Language switch (route-preserving) | Header, mobile sheet, footer and 404; e2e on legal routes | PASS |
| Theme: light/dark, no flash | Pre-paint script: stored choice, else OS preference; two-state toggle; e2e persistence | PASS |
| Mobile navigation | Full-height modal sheet: focus trap, inert background, scroll lock while open, Escape/backdrop close, focus returns to the trigger; phone header shows only logo + menu | PASS (e2e, 3 browsers) |
| No-JS navigation | Menu falls back to a link to the footer navigation; legal TOC is a plain list | PASS (e2e) |
| Legal pages composition | Hero + document identification panel + policy index; integrated chapter numbering; designed draft notice | PASS (screenshots) |
| Legal scroll-spy TOC | One active item, `aria-current="location"`, hash/scroll/bottom/reload; compact chapter bar on phones | PASS (e2e desktop + 320 px) |
| Custom 404 with HTTP 404 | Dev: `global-not-found`; export: designed `out/404.html`; localized from the `/sq/` and `/it/` prefixes | PASS (`/sa/`, `/not-a-real-page/`, `/sq/nope/`, `/it/nope/`) |
| No horizontal overflow | e2e at 320/390/768/1366/1440; full-page capture script logs overflow (none) | PASS |
| App CTA honesty | No app link unless `APP_ENTRY_URL` is verified; configured build verified (Batch 03) | PASS |
| Keyboard and focus | Tabs (Arrow/Home/End), accordion (Enter/Space), stepper, sheet trap; visible focus rings | PASS (e2e) |
| Contrast | Hero hover contrast > 4.5:1 tested in both themes; brass-on-panel text checked visually | PARTIAL (no full automated contrast audit) |
| Real devices / real GPU / screen readers | Not available in this environment | NOT VERIFIED |
| Public deployment authorized | `release:check` blocks: no origin, app URL, operator, approvals | BLOCKED (intentionally) |
