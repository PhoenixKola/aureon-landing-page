# Final cinematic & visual polish — review (2026-10-10)

Working tree only. Nothing committed, pushed or deployed.

## What materially changed

**Hero (`src/components/hero/gym-scene.ts`, `HeroScene.tsx`, `DocumentShell.tsx`)**
- **Lighting plan, not uniform fill:** a warm work light over the platform from the first frame; a cool rim from the window side; an area light in the glazing (dusk blue or overcast daylight); three linear pendants and a cove wash that switch on once the room is built. In light mode, a real sun through the window casts mullion shadows across the floor.
- **Image pipeline:** HalfFloat MSAA target → GTAO (contact and ambient occlusion; glass and backdrop excluded) → subtle bloom on the practicals → ACES output → grade (split tone, light vignette, fine grain, slight edge chroma). GTAO is skipped on ≤4-core devices.
- **Materials:** CC0 ambientCG scans for the rubber floor, concrete walls and oak slats, mapped in world space so they stay continuous at true scale. Changes from the procedural look:
  - Powder-coat steel is now dielectric and clear-coated, not metallic grey, and all tube corners are radiused instead of razor-edged.
  - Real details: anisotropic chrome sleeves, a knurled shaft, bumper plates with a recessed face, raised lip, steel hub and moulded weight lettering, plus through-bolts, UHMW-lined J-cups, upholstery piping with leather grain, and pulleys, cables and a selector pin on the trainer. Kettlebells were added.
- **Architecture:** the back wall now has a real window opening, so the exterior (a hazed, layered street at dusk or in daylight) is visible beyond the glass. The roof slides over the room. The tiled floor seams are hairline.
- **Choreography and camera:** an empty floor under one work light → platform drops → uprights rise (a rack is readable at 0.5 s) → the bar drops into its cups (it previously floated about 7 cm above them) → plates slide on, rotating → the room, glazing and exterior → benches, racks, trainer, treadmills → lights → the brand light-line. Drops use a gravity curve with one damped rebound. The camera is a slow pull-back on a shift lens (verticals stay vertical) that decelerates into the final composition; the separate mobile path frames the rack under the copy. Treadmill consoles show a neutral UI with no Aureon branding (no hardware claims).
- **Loading behaviour:**
  - Static mode (reduced motion, **Save-Data**, already played) no longer imports three.js or creates a GPU context; only the capture hashes (`#hero-still`, `#hero-shot=`, `#hero-t=`) do.
  - "Played" is recorded at the first frame, so a locale switch mid-assembly does not replay.
  - The clock accumulates a clamped delta, so a hidden tab resumes instead of jumping.
  - Creation errors fall back to the still.

**Section 04:** a sliding brass spotlight column marks the active stage while inactive cells recede (contrast about 4.7:1, still readable). A connector grows from the origin lane to each lane that sees the moment, with a dot on every involved lane. A readout under the matrix states the moment and the flow ("Starts here: Front desk → In view: Member → Management"). New string `inView` in EN / SQ / IT (“In view / E sheh / Lo vede”). Keyboard, `aria-current`, the live announcement (now naming the flow), the mobile cards and reduced motion are kept.

**Rhythm**
- Section 03 sets the phone view's callouts beside the phone on wide screens, filling the empty stage.
- Section 05 mirrors Section 02, so the image is now on the right.
- Section 06 shows the same club at 07:10 and 22:00 (the first and last moments of Section 04) in a split figure. The divider sweeps in on reveal and follows the mouse; it is decorative and `aria-hidden`.
- The CTA logic for a missing `APP_ENTRY_URL` is unchanged.

**Engineering:** `npm test` now transpiles `src/content/sections.ts` with the project's own TypeScript, so it runs on Node ≥20.9 without the experimental type-stripping flag. This was verified with `--no-experimental-strip-types`.

## Assets
- All stills, section close-ups, the OG image and the 404 backdrop were re-rendered from the new scene. Sizes are listed in `docs/ASSET-LICENSES.md`. The largest is `gym-desktop-light.webp` at 227 KB, which is under the 260 KB test budget.
- New maps in `public/assets/hero/tex/`: 6 files, 180 KB in total; 157–183 KB are loaded per theme, after first paint. All are CC0 (ambientCG Rubber001, Concrete034, Wood092). Nothing is hotlinked.
- The hero JS chunk is 249 KB gzip, up from 231 KB, because of the post-processing passes.

## Checks actually run
- `npm run lint` passed. `npm run typecheck` passed. `npm test`: 18/18 passed, also with Node type-stripping disabled. `npm run build` and `npm run check:export` passed: 18 localized pages, a designed 404, and 562 internal links. `npm run release:check` fails, as intended.
- Smoke pass against the static export (Playwright Chromium, SwiftShader software GL):
  - H1 and CTA are in the first paint. The page starts in intro mode with the header hidden, and the completed still is **not** displayed during assembly. The header stays hidden while assembling and is visible after settle. No replay control. CLS 0.0000.
  - Theme switch works. EN → SQ works without a replay.
  - No horizontal overflow at 390 or 320 px. The mobile menu takes focus and closes with Escape.
  - Reduced motion: still shown, header immediate, **0 WebGL contexts, 0 texture requests**.
  - `/privacy/` returns 200 with its TOC. `/it/does-not-exist/` returns a **404** (designed, Italian). The first Tab focuses the skip link.
  - The CTA check first failed on timing (smooth scroll under software-GL load). A targeted re-run confirmed `#platform` lands at the header offset after about 1 s.
- **Not run:** Lighthouse, on-device GPU profiling, Firefox or WebKit, and the full `test:e2e` suite. Under SwiftShader the assembly took about 12 s of wall time; the clock clamp was afterwards raised from 100 to 250 ms per frame so slow devices stay closer to the 4.6 s timing. Real-GPU frame rate is **unmeasured**.

## Evidence (`evidence/batch-05/`)
`desktop-dark-t0000 / t0500 / t1500 / t2800 / t5000`, `desktop-light-t5000`, `phone-dark-t5000`, `reduced-motion-desktop-dark` (.webp)

## Unresolved
- No verified `APP_ENTRY_URL`, so no app CTA is shown (by design).
- Legal texts are drafts, not approved. Operator identity, jurisdiction and privacy contact are missing. The site is **not approved for public release**.
- Performance on mid-range phones with GTAO and bloom has not been profiled. If needed, the fallback is to disable GTAO on the mobile layout (one line).

## Verdict
The hero is now a **strong real-time WebGL shot**, not a viewport preview. It has motivated light, contact shadows, real surface scans, an exterior through the glass, a directed pull-back, and an opening that reads as a gym within half a second. It is **not photoreal commercial footage.** Equipment silhouettes are still hand-modelled primitives, with no cloth or wear detail and no global illumination. The light-mode floor reads closer to terrazzo than rubber, and the trainer close-up is the weakest frame. Film-grade results would need offline path tracing (for example Blender/Cycles) with licensed high-poly equipment models, delivered as a pre-rendered video. Neither was available in this environment.
