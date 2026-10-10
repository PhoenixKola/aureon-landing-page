'use client';
import {useCallback, useEffect, useId, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Menu, X} from 'lucide-react';
import {BrandMark} from '@/components/icons';

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Full-height navigation sheet (modal dialog). While open: focus is trapped, the rest of the page is inert,
 * body scrolling is locked. Closes on Escape, backdrop press, or choosing a link; focus returns to the trigger.
 * Without JS the trigger is replaced by a plain link to the footer navigation.
 */
export function MobileMenu({label, closeLabel, homeHref, homeLabel, children}: {label: string; closeLabel: string; homeHref: string; homeLabel: string; children: ReactNode}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const restore = useRef(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback((restoreFocus = true) => {
    restore.current = restoreFocus;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOpen(false); return; }
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, 260);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const outside = Array.from(document.body.children).filter(el => !el.hasAttribute('data-menu-portal')) as HTMLElement[];
    outside.forEach(el => el.setAttribute('inert', ''));
    root.classList.add('menu-open');
    root.style.setProperty('--scrollbar-comp', `${scrollbar}px`);
    const first = sheet.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || !sheet.current) return;
      const items = Array.from(sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      // Move focus explicitly: Safari's Tab skips links by default, so first/last checks alone would leak.
      e.preventDefault();
      const i = items.indexOf(document.activeElement as HTMLElement);
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    };
    const onResize = () => { if (window.innerWidth > 1020) close(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      outside.forEach(el => el.removeAttribute('inert'));
      if (restore.current) { restore.current = false; trigger.current?.focus(); }
      root.classList.remove('menu-open');
      root.style.removeProperty('--scrollbar-comp');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  return <div className="mobile-menu">
    <button ref={trigger} type="button" className="menu-button" aria-expanded={open} aria-controls={id} aria-haspopup="dialog" aria-label={label} onClick={() => setOpen(true)}>
      <Menu className="mi mi-open" strokeWidth={1.6} aria-hidden="true"/>
    </button>
    <noscript><a className="menu-button menu-fallback" href="#footer-nav" aria-label={label}><Menu strokeWidth={1.6} aria-hidden="true"/></a></noscript>
    {mounted && open && createPortal(
      <div className={`menu-layer${closing ? ' is-closing' : ''}`} data-menu-portal="">
        <div className="menu-backdrop" onClick={() => close()} aria-hidden="true"/>
        <div ref={sheet} id={id} className="menu-sheet" role="dialog" aria-modal="true" aria-label={label}
          onClick={e => { if ((e.target as HTMLElement).closest('a[href^="#"],a[href*="/#"]')) close(false); }}>
          <div className="menu-sheet-head">
            <a className="wordmark" href={homeHref} aria-label={homeLabel}><span className="mark-box"><BrandMark/></span><span>AUREON<small>GYM PLATFORM</small></span></a>
            <button type="button" className="menu-close" onClick={() => close()} aria-label={closeLabel}><X strokeWidth={1.7} aria-hidden="true"/></button>
          </div>
          <div className="menu-sheet-body">{children}</div>
        </div>
      </div>, document.body)}
  </div>;
}
