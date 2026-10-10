'use client';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {ChevronDown} from 'lucide-react';

const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Scroll-spy table of contents. The active chapter is the last one whose top has passed a line just
 * below the header (one measurement per frame, so exactly one item is ever active); at the page bottom
 * the final chapter wins. Plain #section-n anchors keep working without JavaScript.
 */
export function LegalToc({chapters, label, statusLabel, status}: {chapters: string[]; label: string; statusLabel: string; status: string}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const [bar, setBar] = useState({y: 0, h: 0});

  const measure = useCallback(() => {
    const root = document.documentElement;
    const header = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 80;
    const line = header + (window.innerWidth < 900 ? 96 : 140);
    let current = 0;
    chapters.forEach((_, i) => {
      const el = document.getElementById(`section-${i + 1}`);
      if (el && el.getBoundingClientRect().top - line <= 0) current = i;
    });
    if (window.innerHeight + window.scrollY >= root.scrollHeight - 4) current = chapters.length - 1;
    setActive(current);
  }, [chapters]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); }); };
    measure();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    window.addEventListener('hashchange', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.removeEventListener('hashchange', onScroll); cancelAnimationFrame(frame); };
  }, [measure]);

  useLayoutEffect(() => {
    const link = list.current?.children[active] as HTMLElement | undefined;
    if (link) setBar({y: link.offsetTop, h: link.offsetHeight});
  }, [active]);

  // Collapse the list first, then scroll, so the layout change cannot move the target after the jump.
  const jump = (i: number) => {
    setOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(`section-${i + 1}`);
      if (!el) return;
      el.scrollIntoView({block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      history.pushState(null, '', `#section-${i + 1}`);
    }));
  };
  const items = (onPick?: (i: number) => void) => chapters.map((heading, i) =>
    <li key={heading}><a href={`#section-${i + 1}`} aria-current={i === active ? 'location' : undefined} onClick={onPick ? e => { e.preventDefault(); onPick(i); } : undefined}><span>{num(i)}</span>{heading}</a></li>);

  return <nav className="legal-toc" aria-label={label}>
    <div className="toc-desktop">
      <p className="toc-title">{label}</p>
      <div className="toc-list-wrap">
        <span className="toc-indicator" aria-hidden="true" style={{transform: `translateY(${bar.y}px)`, height: bar.h}}/>
        <ol ref={list} className="toc-list">{items()}</ol>
      </div>
      <p className="toc-foot">{statusLabel}<strong>{status}</strong></p>
    </div>
    <div className="toc-mobile" data-open={open || undefined}>
      <button type="button" aria-expanded={open} aria-controls="toc-mobile-list" onClick={() => setOpen(o => !o)}>
        <span className="toc-mobile-label">{label}</span>
        <span className="toc-mobile-current"><b>{num(active)}/{num(chapters.length - 1)}</b>{chapters[active]}</span>
        <ChevronDown strokeWidth={1.8} aria-hidden="true"/>
      </button>
      <ol id="toc-mobile-list" className="toc-mobile-list" hidden={!open}>{items(jump)}</ol>
    </div>
  </nav>;
}
