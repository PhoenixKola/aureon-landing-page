# Asset manifest / provenance

| File | Origin | Status |
|---|---|---|
| `src/components/hero/gym-scene.ts` (hero 3D scene) | Original project code (Batch 01, 2026-10-09; cinematic pass 2026-10-10). All geometry is procedural three.js primitives and lathe profiles. Canvas-generated in code: floor wear map, bar knurl, plate lettering, neutral treadmill console UI, the exterior street seen through the windows. Reflections use three.js `RoomEnvironment` (procedural, ships with three); post-processing uses three's own `GTAOPass`, `UnrealBloomPass`, `OutputPass`. | No third-party models or HDRIs. Surface scans: see next row. |
| `public/assets/hero/tex/rubber-color.webp`, `rubber-normal.webp`, `rubber-light-color.webp` | ambientCG **Rubber001** (https://ambientcg.com/view?id=Rubber001), downloaded 2026-10-10 as `Rubber001_1K-JPG`. Resized to 512 px, WebP; `rubber-light-color` is a greyscale, softened, lifted-albedo derivative for the daylight look. Also reused at a small scale as the bench's leather grain normal. | **CC0 1.0** (public domain, no attribution required). 60 / 47 / 26 KB. Loaded by the hero chunk after first paint; the light variant only in light mode. |
| `public/assets/hero/tex/concrete-color.webp`, `concrete-normal.webp` | ambientCG **Concrete034** (https://ambientcg.com/view?id=Concrete034), downloaded 2026-10-10 (`1K-JPG`), resized to 512 px WebP. Back walls and outside terrace. | **CC0 1.0**. 10 / 26 KB. |
| `public/assets/hero/tex/oak-color.webp`, `oak-rough.webp` | ambientCG **Wood092** (https://ambientcg.com/view?id=Wood092), downloaded 2026-10-10 (`1K-JPG`), resized (512 / 256 px), colour desaturated to 55 %. Slat wall and platform insert. | **CC0 1.0**. 10 / 1 KB. |
| `public/assets/hero/gym-{desktop,mobile}-{dark,light}.webp` | Rendered from the scene above by `scripts/render-hero-stills.mjs` (final frame), 2026-10-10 | Project-owned. desktop-dark 74 / mobile-dark 32 / desktop-light 227 / mobile-light 66 KB. Fallback only (no-JS, reduced motion, Save-Data, repeat visit, WebGL failure). |
| `public/assets/scenes/plates-{dark,light}.webp` | Close-up rendered from the same scene (`#hero-shot=plates`) by `scripts/render-scene-shots.mjs`, re-rendered 2026-10-10 | Project-owned. 70 / 134 KB. Section 02 only; lazy-loaded; only the active theme's file is displayed. |
| `public/assets/scenes/{bench,trainer,entrance,ceiling}-{dark,light}.webp` | Four further camera shots of the same scene, re-rendered 2026-10-10 by `scripts/render-scene-shots.mjs` | Project-owned. 50–85 KB dark / 133–191 KB light. Section 05 only; lazy; only the active theme displays. |
| Section 06 image | Reuses both hero desktop stills (`gym-desktop-light.webp` morning side, `gym-desktop-dark.webp` night side) in a split figure | No new asset. Lazy-loaded. |
| Section 03 interface illustrations (`src/components/sections/ProductScreens.tsx`) | Original HTML/CSS drawings in the Aureon source tokens; navigation labels and notices taken from the approved product mockups (`apps/mockups`) | No screenshots, no people, no data. Names redacted as placeholder bars, charts carry no values. Labelled as a representative concept on the page. |
| `three@0.180.0` | npm, MIT licence | Bundled in the lazily loaded hero chunk with the scene and post-processing passes (249 KB gzip, measured on the 2026-10-10 export). |
| `lucide-react@0.544.0` | npm, ISC licence | Interface icons (theme, menu, arrows). The Aureon chevron is **not** a Lucide icon; it stays the source SVG path. |
| `evidence/legacy-v1/gym-interior.webp` | Earlier OpenAI-generated interior | **Removed from the site** in Batch 04 (no longer rendered); archived with the v1 evidence. |
| `public/assets/social-preview.webp` | Composed by `scripts/render-social.mjs` from the hero final frame + the source chevron and site copy (re-composed 2026-10-10) | Project-owned. 1200×630, 36 KB. |
| `public/assets/scenes/unbuilt-{dark,light}.webp` | The hero scene frozen at 1.25 s (`scripts/render-unbuilt.mjs`, re-rendered 2026-10-10), used as the 404 backdrop | Project-owned. 51 / 211 KB. |
| `public/brand/aureon-mark.svg`, `public/favicon.svg` | SVG implementation of the Aureon two-stroke brand geometry verified in uploaded source | Inherits project brand rights (operator must confirm). |
| CSS/JS/type | Original site implementation; OS/system fonts only | No embedded or redistributed font binaries. |

## External 3D asset research (Batch 01): not shipped

Researched on 2026-10-09 per the batch brief. **None of these files are in the repository or hotlinked.** The licence labels below are what the Sketchfab search API reported; they would need re-verification on each model page at download time.

| Source | Candidate | Reported licence | Why not used |
|---|---|---|---|
| Poly Haven (CC0) | No gym equipment in the 521-model catalogue; lights `mounted_fluorescent_lights`, `hanging_industrial_lamp` | CC0 | No gym equipment; the lights were built in code to match the scene instead |
| Sketchfab | Flat Bench (sousinho), https://sketchfab.com/3d-models/none-b56ab6e2b50246c88c7f72a4f16fc857 | CC BY | Download requires an authenticated account token (not available); quality unverified |
| Sketchfab | Treadmill Machine (sousinho), https://sketchfab.com/3d-models/none-faed3a2a275b4fd68089e1d8bdfb7f89 | CC BY | Same |
| Sketchfab | Weight Lifting Plates (Dakota.Hinkle), https://sketchfab.com/3d-models/none-f26c89d6991542af9ab37970b4683fb9 | CC BY | Same |
| Sketchfab | Dumbell Rack (Polyowlstudios), https://sketchfab.com/3d-models/none-289296b55ec141dda74406d6d3924e09 | CC BY | Same; 237k faces would need decimation |
| Sketchfab | GAME READY GYM ENVIRONMENT ASSET PACK (oxygen3d), https://sketchfab.com/3d-models/none-8aef4a478bbe49d483280968aff59064 | CC BY | Same |
| Sketchfab | Low Poly Bench Press (Darren.Hogan) | CC BY-NC | **Excluded**: non-commercial |
| BlenderKit | n/a | CC0 / Royalty Free | Needs account + add-on; Royalty Free forbids raw redistribution (a web GLB counts) |

If a CC-BY model is adopted later, add a row with direct model URL, creator, exact licence version, download date, transformations (decimation, Draco/KTX2) and where the attribution appears on the site (for example the footer or imprint).
