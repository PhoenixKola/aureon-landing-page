# Signature experience: empty stage, gym assembled object by object

**Batch 01 revision (9 October 2026).** The SVG illustration is replaced by a real-time, physically lit 3D gym (three.js), modelled in code to real equipment dimensions. Each object enters on its own beat. There is never a completed gym image underneath the animation. The navbar eases in last. Full rationale: `docs/HERO-PRODUCTION-PLAN.md`.

## Modes (decided before first paint by the inline script in `DocumentShell.tsx`)

| Mode | When | What the visitor sees |
|---|---|---|
| `hero-intro` | First visit this session, motion allowed | Empty stage → assembly (about 4.8 s) → render loop stops. Copy arrives in beats from 560 ms; header arrives after the scene settles |
| `hero-static` | `prefers-reduced-motion: reduce`, or the assembly already played this session (sessionStorage `aureon-hero-played`) | Completed still at once, replaced invisibly by the live completed scene; header immediately |
| no JS | Script disabled | Completed still (theme-correct), header and all links visible |
| WebGL failure / context loss | Scene import or context fails | `.is-fallback` shows the completed still; header released at once |
| Safety | Any case | Header is forced visible after 9 s, or on the first Tab key press |

## Timeline

See the shot list in `docs/HERO-PRODUCTION-PLAN.md`. The hero copy beats are CSS (`[data-hero-beat]`). The 3D timeline is the deterministic `Timeline` in `src/lib/motion.ts`, so `#hero-t=<ms>` renders any exact frame (used for evidence).

## Files

- `src/components/hero/Hero.tsx`: semantic hero (H1, CTA, caption), fallback stills, shade
- `src/components/hero/HeroScene.tsx`: lazy WebGL bootstrap, theme/resize observers, settle/fallback state
- `src/components/hero/gym-scene.ts`: scene, materials, choreography, cameras per breakpoint and theme looks
- `src/lib/motion.ts`: easing vocabulary and timeline, reused by later batches
- `src/components/RevealOnScroll.tsx` + `[data-reveal]` / `[data-reveal-item]` CSS: section entrances for Batches 02–03
- `scripts/hero-frames.mjs`, `scripts/record-opening.mjs`, `scripts/render-hero-stills.mjs`: evidence and still generation
