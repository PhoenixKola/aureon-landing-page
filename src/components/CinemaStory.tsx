'use client';
import {useEffect, useRef} from 'react';

export interface Chapter {id: string; num: string; label: string}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scroll director for the homepage. One rAF-throttled scroll pass writes plain CSS variables:
 *  --story  (hero runway, 0..1)  copy clears, the still/scene pushes in toward the operational hub
 * and forwards --story to the single WebGL scene. Without JS, or with reduced motion, nothing here runs and every
 * section simply shows its full content.
 */
export function CinemaStory({chapters, label}: {chapters: Chapter[]; label: string}) {
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const runway = document.querySelector<HTMLElement>('.hero-runway');
    const rail = railRef.current;
    const els = chapters.map(c => document.getElementById(c.id));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, lastStory = -1;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (runway) {
        const active = getComputedStyle(runway).getPropertyValue('--runway-on').trim() === '1' && !reduce.matches;
        const travel = runway.offsetHeight - vh;
        const p = active && travel > 0 ? clamp(-runway.getBoundingClientRect().top / travel) : 0;
        if (p !== lastStory) {
          lastStory = p;
          runway.style.setProperty('--story', p.toFixed(4));
          runway.toggleAttribute('data-cleared', p > 0.55);
          window.dispatchEvent(new CustomEvent('aureon:story', {detail: p}));
        }
      }
      if (rail) {
        let current = -1;
        els.forEach((el, i) => { if (el && el.getBoundingClientRect().top < vh * 0.45) current = i; });
        rail.toggleAttribute('data-on', current >= 0);
        rail.querySelectorAll('a').forEach((a, i) => {
          if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          a.toggleAttribute('data-lit', i <= current);
        });
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
    };
  }, [chapters]);

  return <nav ref={railRef} className="chapter-rail" aria-label={label}>
    <ol>{chapters.map(c => <li key={c.id}><a href={`#${c.id}`}><b>{c.num}</b><span>{c.label}</span></a></li>)}</ol>
  </nav>;
}
