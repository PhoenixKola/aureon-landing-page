'use client';
import {useEffect} from 'react';

/** Marks the fixed header as "scrolled" so it gains a solid surface once it leaves the hero. */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!header) return;
    header.dataset.ready = '';
    let frame = 0;
    const update = () => { frame = 0; header.toggleAttribute('data-scrolled', window.scrollY > 24); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return null;
}
