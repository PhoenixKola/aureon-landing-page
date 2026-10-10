'use client';
import {useRef, type ReactNode, type PointerEvent} from 'react';

/** A link that leans slightly toward a fine pointer. No effect for touch or reduced motion. */
export function MagneticLink({href, className, children, external = false}: {href: string; className: string; children: ReactNode; external?: boolean}) {
  const ref = useRef<HTMLAnchorElement>(null);
  function move(e: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
  }
  function leave() { ref.current?.style.setProperty('--mx', '0px'); ref.current?.style.setProperty('--my', '0px'); }
  return <a ref={ref} href={href} className={className} onPointerMove={move} onPointerLeave={leave}
    {...(external ? {rel: 'noopener noreferrer'} : {})}>{children}</a>;
}
