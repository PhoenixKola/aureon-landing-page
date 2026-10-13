'use client';
import {useRef, type PointerEvent} from 'react';
import {BrandMark} from '@/components/icons';

/** Section 06 image: the same club at opening and at close; the divider follows the pointer. Decorative. */
export function DayNightFigure({caption, times}: {caption: string; times: [string, string]}) {
  const ref = useRef<HTMLElement>(null);
  const setSplit = (clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--split', `${Math.min(88, Math.max(12, ((clientX - r.left) / r.width) * 100))}%`);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' || ref.current?.hasAttribute('data-drag')) setSplit(e.clientX);
  };
  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' || !ref.current) return;
    ref.current.setAttribute('data-drag', '');
    ref.current.setPointerCapture(e.pointerId);
    setSplit(e.clientX);
  };
  const up = () => ref.current?.removeAttribute('data-drag');
  const leave = (e: PointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse') ref.current?.style.removeProperty('--split'); };
  return <figure ref={ref} className="s06-figure" data-reveal-item aria-hidden="true" onPointerMove={move} onPointerDown={down} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave}>
    <img className="s06-day" src="/assets/hero/gym-desktop-light.webp" alt="" width={1920} height={1080} loading="lazy" decoding="async"/>
    <img className="s06-night" src="/assets/hero/gym-desktop-dark.webp" alt="" width={1920} height={1080} loading="lazy" decoding="async"/>
    <span className="s06-split"><i/></span>
    <span className="s06-time s06-time-am">{times[0]}</span>
    <span className="s06-time s06-time-pm">{times[1]}</span>
    <figcaption><BrandMark/>{caption}</figcaption>
  </figure>;
}
