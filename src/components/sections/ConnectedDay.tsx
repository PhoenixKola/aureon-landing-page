'use client';
import {useRef, useState, type KeyboardEvent} from 'react';
import {ArrowDown, ChevronLeft, ChevronRight, ConciergeBell, Info, LayoutDashboard, Smartphone, type LucideIcon} from 'lucide-react';
import type {RoleId, SectionsCopy} from '@/content/sections';

const LANES: RoleId[] = ['member', 'desk', 'manager'];
const LANE_ICONS: Record<RoleId, LucideIcon> = {member: Smartphone, desk: ConciergeBell, manager: LayoutDashboard};

/** Section 04: a single illustrative day across the three roles. Desktop: user-stepped matrix; mobile: stacked moments. */
export function ConnectedDay({c}: {c: SectionsCopy['s04']}) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLButtonElement | null)[]>([]);
  const n = c.moments.length;
  const go = (i: number, focus = false) => { const next = (i + n) % n; setActive(next); if (focus) steps.current[next]?.focus(); };
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const map: Record<string, number> = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1};
    if (!(e.key in map)) return;
    e.preventDefault(); go(map[e.key], true);
  }
  const m = c.moments[active];

  return <div className="day" style={{['--step' as string]: active, ['--steps' as string]: n}}>
    {/* Desktop matrix */}
    <div className="day-matrix" data-reveal-item>
      <div className="day-corner">
        <span className="day-step-count">{c.stepLabel} {active + 1}/{n}</span>
        <span className="day-arrows">
          <button type="button" onClick={() => go(active - 1)} aria-label={c.prev}><ChevronLeft strokeWidth={1.8} aria-hidden="true"/></button>
          <button type="button" onClick={() => go(active + 1)} aria-label={c.next}><ChevronRight strokeWidth={1.8} aria-hidden="true"/></button>
        </span>
      </div>
      <div className="day-steps" role="group" aria-label={c.title}>
        <span className="day-progress" aria-hidden="true"><i/></span>
        {c.moments.map((mo, i) => <button key={mo.time} ref={el => { steps.current[i] = el; }} type="button" className="day-step"
          aria-current={i === active ? 'step' : undefined} tabIndex={i === active ? 0 : -1} onClick={() => go(i)} onKeyDown={e => onKey(e, i)}>
          <span className="day-dot" aria-hidden="true"/>
          <time>{mo.time}</time><span>{mo.title}</span>
        </button>)}
      </div>
      {LANES.map((lane, li) => {
        const Icon = LANE_ICONS[lane];
        return [
          <div key={`${lane}-label`} className="day-lane" style={{gridRow: li + 2}}><Icon strokeWidth={1.7} aria-hidden="true"/>{c.lanes[lane]}</div>,
          ...c.moments.map((mo, i) => {
            const text = mo.lanes[lane];
            const origin = mo.origin === lane;
            return <div key={`${lane}-${i}`} className={`day-cell${i === active ? ' on' : ''}${origin ? ' origin' : ''}${text ? '' : ' empty'}`} style={{gridRow: li + 2, gridColumn: i + 2}} onClick={() => go(i)}>
              {origin && <span className="day-origin">{c.starts}</span>}
              <p>{text ?? '—'}</p>
            </div>;
          }),
        ];
      })}
      <span className="day-link" key={active} aria-hidden="true" style={{gridColumn: active + 2, ['--o' as string]: LANES.indexOf(m.origin)}}/>
    </div>
    <p className="sr-only" aria-live="polite">{`${c.stepLabel} ${active + 1}/${n}: ${m.time}, ${m.title}`}</p>

    {/* Mobile / narrow: every moment as a connected card */}
    <ol className="day-cards">
      {c.moments.map((mo, i) => <li key={mo.time} className="day-card" data-reveal-item style={{['--i' as string]: i + 2}}>
        <header><time>{mo.time}</time><h3>{mo.title}</h3></header>
        <ul>
          {LANES.map(lane => {
            const text = mo.lanes[lane];
            if (!text) return null;
            const Icon = LANE_ICONS[lane];
            return <li key={lane} className={mo.origin === lane ? 'origin' : undefined}>
              <span className="day-card-lane"><Icon strokeWidth={1.7} aria-hidden="true"/>{c.lanes[lane]}{mo.origin === lane && <em>{c.starts}</em>}</span>
              <p>{text}</p>
            </li>;
          })}
        </ul>
      </li>)}
    </ol>

    <div className="day-foot" data-reveal-item>
      <p className="s-note"><Info strokeWidth={1.7} aria-hidden="true"/>{c.note}</p>
      <p className="day-outro">{c.outro} <a href="#details">{c.outroLink}<ArrowDown strokeWidth={1.8} aria-hidden="true"/></a></p>
    </div>
  </div>;
}
