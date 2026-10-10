'use client';
import {useEffect, useRef} from 'react';

/** Floating page scroll thumb (no track, no arrows). The native root scrollbar is hidden in CSS; wheel, keys and touch scroll natively. */
export function ScrollThumb() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const doc = document.documentElement;
    let raf = 0, hideTimer = 0, drag: {y: number; scroll: number} | null = null;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight, sh = doc.scrollHeight;
      const scrollable = sh > vh + 1;
      el.hidden = !scrollable;
      if (!scrollable) return;
      const h = Math.max(44, (vh / sh) * vh);
      const y = (window.scrollY / (sh - vh)) * (vh - h);
      el.style.height = `${h}px`;
      el.style.transform = `translateY(${y}px)`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const wake = () => {
      el.classList.add('is-active');
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => { if (!drag) el.classList.remove('is-active'); }, 1100);
    };
    const onScroll = () => { schedule(); wake(); };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      drag = {y: e.clientY, scroll: window.scrollY};
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-drag', 'is-active');
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const vh = window.innerHeight, sh = doc.scrollHeight, h = el.offsetHeight;
      window.scrollTo({top: drag.scroll + ((e.clientY - drag.y) / (vh - h)) * (sh - vh), behavior: 'instant'});
    };
    const onUp = () => { drag = null; el.classList.remove('is-drag'); wake(); };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', schedule);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    update();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(hideTimer);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, []);
  return <div ref={ref} className="scroll-thumb" aria-hidden="true" hidden/>;
}
