'use client';
import {useEffect, useRef} from 'react';
import type {GymSceneApi, HeroShot, HeroTheme} from './gym-scene';

const PLAYED_KEY = 'aureon-hero-played';

function effectiveTheme(): HeroTheme {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

declare global { interface Window { __aureonHeroCapture?: (type?: string, quality?: number) => string } }

/** Real-time WebGL assembly. Loaded after first paint; the HTML hero never depends on it. */
export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const media = canvas.closest('.hero-media');
    const frozen = /^#hero-t=(\d+)$/.exec(location.hash);
    const shot = /^#hero-shot=(plates|bench|trainer|entrance|ceiling)$/.exec(location.hash)?.[1] as HeroShot | undefined;
    const capture = location.hash === '#hero-still' || !!shot || !!frozen;
    // Static mode (reduced motion, Save-Data, already played) shows the theme stills: no three.js, no GPU context.
    if (root.classList.contains('hero-static') && !capture) return;

    let api: GymSceneApi | null = null;
    let cancelled = false;
    const fallback = () => { media?.classList.add('is-fallback'); root.classList.add('hero-settled'); };
    const firstFrame = () => {
      media?.classList.add('is-live');
      // Marked as played as soon as it starts, so a locale switch mid-assembly does not replay it.
      if (!capture) try { sessionStorage.setItem(PLAYED_KEY, '1'); } catch { /* storage may be blocked */ }
    };

    import('./gym-scene').then(({createGymScene}) => {
      if (cancelled) return;
      try {
        api = createGymScene(canvas, {
          theme: effectiveTheme(),
          instant: location.hash === '#hero-still' || !!shot,
          freezeAt: frozen ? Number(frozen[1]) : undefined,
          shot,
          onFirstFrame: firstFrame,
          onSettled: () => root.classList.add('hero-settled'),
        });
      } catch { fallback(); return; }
      if (capture) window.__aureonHeroCapture = (type, q) => api!.capture(type, q);
    }).catch(fallback);

    const onTheme = () => api?.setTheme(effectiveTheme());
    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(root, {attributes: true, attributeFilter: ['data-theme']});
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', onTheme);
    const resizeObserver = new ResizeObserver(() => api?.resize());
    resizeObserver.observe(canvas);
    canvas.addEventListener('webglcontextlost', fallback);

    return () => {
      cancelled = true;
      themeObserver.disconnect();
      scheme.removeEventListener('change', onTheme);
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', fallback);
      api?.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true"/>;
}
