# Hero production plan — Batch 01 (9 October 2026)

Goal: replace the flat line-art SVG gym with commercially credible gym equipment that **assembles piece by piece** on first load. The stage starts empty, the gym is recognisable within about a second, the scene rests as a finished still after about 4.8 s, and the navbar arrives last.

## Pipelines compared

| | (A) Licensed 3D models, pre-rendered video (WebM/MP4 + posters) | (B) Optimised 3D in the browser, choreographed live |
|---|---|---|
| Image quality ceiling | Highest (offline path tracing, GI, motion blur) | High with PBR, image-based lighting, soft shadows, area lights; no GI |
| Asset availability (verified today) | Needs gym models we can legally redistribute **and** a render farm or Blender pipeline. No licensed set was obtainable from this environment (see research below). | Same model problem **if** models are external. Solved by modelling the equipment in code to real dimensions. |
| Creative control | Fixed camera and timing per rendition; every crop or theme needs a new render (desktop/mobile × light/dark = 4 videos + 4 posters) | Full: camera per breakpoint, light/dark materials switch live, timeline tweakable in code |
| First frame vs poster contradiction | Real risk: the poster must be an *empty* frame, and reduced-motion needs a separate completed still | None: the first frame is computed; the completed still is rendered from the same scene |
| Device cost | Video decode only; very cheap at runtime | WebGL for about 5 s, then the render loop **stops** (renders again only on resize or theme change) |
| Bytes | 4 × ~1.5–3 MB video plus posters | 231 KB gzip JS (lazy, after first paint) + 4 fallback stills totalling 368 KB, of which a visitor downloads at most one, and only on fallback paths |
| Theme changes | Swap video, which shows an intermediate state or restarts | Instant material/light swap with no replay |

A sprite or composite sequence was rejected: it is the weakest on image quality and the heaviest per frame.

## Asset research (mandatory step)

- **Poly Haven** (CC0, https://polyhaven.com/license): queried the public API (`api.polyhaven.com/assets?t=models`, 521 models). It has **no gym equipment** (no racks, barbells, plates, benches, dumbbells or cardio). It does have usable CC0 lighting fixtures (`mounted_fluorescent_lights`, `hanging_industrial_lamp`) and HDRIs/textures. Not used; see the decision below.
- **Sketchfab** (download API guidelines: https://sketchfab.com/developers/download-api/guidelines): the search API (`downloadable=true`) returns candidates labelled *CC Attribution*. Examples: "Flat Bench" and "Treadmill Machine" by sousinho, "Weight Lifting Plates" by Dakota.Hinkle, "Dumbell Rack" by Polyowlstudios, "Gym equipment" by qw1nx1 (4.4 M faces), "GAME READY GYM ENVIRONMENT ASSET PACK" by oxygen3d. Several hits are CC-NC (excluded). **Blocker:** downloading requires an authenticated Sketchfab account token (OAuth), which this environment does not have. The individual licence and quality of each file could not be inspected, so none were used. The candidate list is in `docs/ASSET-LICENSES.md`.
- **BlenderKit** (https://www.blendkit.com/docs/licenses/): assets need a logged-in account and the Blender add-on. The "Royalty Free" tier forbids redistribution of the raw asset (a web GLB is effectively redistribution). Not obtainable here.

## Decision: (B), with the equipment modelled in code

**Chosen:** real-time three.js scene (`src/components/hero/gym-scene.ts`). Every object is built procedurally to real-world dimensions:

- 2.2 m Olympic barbell (28 mm shaft, 50 mm chrome sleeves, IWF hand marks) and lathe-profiled 450 mm bumper plates with steel inserts
- 2.3 m power rack with Westside-style hole pattern, J-hooks with UHMW liners, safety arms and plate-storage horns
- flat bench (leather with sheen, brass seam), two-tier hex dumbbell rack (13 sizes), dual-stack functional trainer (pulleys, cables, stacks) and treadmills
- rubber-tile floor with an oak lifting-platform inlay, timber slat wall, steel-mullioned window band, ceiling beams, linear pendants and LED coves
- the Aureon chevron (the source glyph path) as a brass light line on the wall

**Reasons:**
1. It is the only route with **zero licence risk** and assets we can actually obtain today.
2. It gives full art direction per breakpoint and theme. The mobile camera is a separate composition, not a squeezed desktop view. Light theme is a daylight studio; dark theme is a night club with warm linear light, not a grayscale filter.
3. The first frame is genuinely empty, and the completed fallback still is the scene's own final frame (`scripts/render-hero-stills.mjs`), so the poster and the animation cannot contradict each other.

**Upgrade path:** if the operator later licenses production GLBs (for example CC-BY Sketchfab models downloaded with an account, or a commissioned set), each `// ---------- N.` builder in `gym-scene.ts` can be swapped for a loaded model. The timeline and choreography code stays as is. Record the licence in `ASSET-LICENSES.md` first.

## Shot list as implemented (ms from the first rendered frame)

| Beat | Time | Event |
|---|---|---|
| Empty stage | 0 | Hero colour, HTML headline only. No equipment, no photo |
| Foundation | 60–1060 | Rubber tiles seat outward from the training zone; wall rises; slats fill in |
| Structure | 380–1500 | Rack base, four uprights extrude (silhouette readable at about 0.9–1.2 s), window mullions and beams drop in |
| Rack + bar | 860–1900 | Top crossmembers, J-hooks; barbell lowers onto the hooks with a weighted settle |
| Plates | 1820–2970 | Eight plates slide onto the sleeves alternately, then brass collars clamp |
| Bench / weights | 2050–3550 | Bench glides into place, dumbbell rack rises, 13 dumbbells drop into cradles, a pair lands beside the bench |
| Cable / cardio | 2650–3810 | Trainer towers extrude, weight stacks stack plate by plate, carriages and cables hang; treadmills roll in under the windows |
| Lighting | 3350–4250 | Pendants lower; linear lights, coves and wall wash ramp up (no strobe) |
| Brand | 3900–4800 | Chevron draws itself in brass and warms the timber wall |
| Rest | ≥ 4800 | Render loop stops; header eases in (opacity/translate, 4 px blur, 1 s) |

The camera dollies from a high, wide position to the final framing over 4.6 s on a blend of in-out cubic and out-cubic easing.
