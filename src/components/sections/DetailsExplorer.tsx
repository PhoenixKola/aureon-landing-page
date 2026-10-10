'use client';
import {useEffect, useState} from 'react';
import {CalendarDays, Check, ConciergeBell, Info, Minus, Plus, Radio, UserRound, type LucideIcon} from 'lucide-react';
import type {Detail, DetailId, SectionsCopy} from '@/content/sections';

const SHOT: Record<DetailId, string> = {member: 'bench', schedule: 'trainer', desk: 'entrance', radio: 'ceiling'};
const ICON: Record<DetailId, LucideIcon> = {member: UserRound, schedule: CalendarDays, desk: ConciergeBell, radio: Radio};

function Scene({item, eager = false}: {item: Detail; eager?: boolean}) {
  const shot = SHOT[item.id];
  return <>
    <img className="theme-img theme-img-dark" src={`/assets/scenes/${shot}-dark.webp`} alt="" width={1200} height={1500} loading={eager ? 'eager' : 'lazy'} decoding="async"/>
    <img className="theme-img theme-img-light" src={`/assets/scenes/${shot}-light.webp`} alt="" width={1200} height={1500} loading={eager ? 'eager' : 'lazy'} decoding="async"/>
  </>;
}

function DetailCard({item}: {item: Detail}) {
  const Icon = ICON[item.id];
  return <div className="s05-card" aria-hidden="true">
    <span className="s05-card-head"><span className="s05-card-icon"><Icon strokeWidth={1.8}/></span>{item.card.label}</span>
    {item.card.rows.map(([k, v]) => <span key={k} className="s05-card-row"><em>{k}</em><b>{v}</b></span>)}
  </div>;
}

/** Section 05: an image-led explainer. One item open at a time; the visual follows the last opened item. */
export function DetailsExplorer({c}: {c: SectionsCopy['s05']}) {
  const [open, setOpen] = useState<number | null>(0);
  const [shown, setShown] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const toggle = (i: number) => { setOpen(o => (o === i ? null : i)); setShown(i); };
  const item = c.items[shown];

  return <div className="s05-grid">
    <div className="s05-visual" aria-hidden="true">
      <div className="s05-frame">
        {c.items.map((it, i) => <figure key={it.id} className={`s05-shot${i === shown ? ' on' : ''}`}><Scene item={it} eager={i === 0}/></figure>)}
        <span className="s05-index"><b>0{shown + 1}</b> / 0{c.items.length}</span>
        <div className="s05-overlay" key={item.id}>
          <DetailCard item={item}/>
          <p className="s05-caption">{item.caption}</p>
        </div>
      </div>
    </div>

    <div className="s05-list">
      {c.items.map((it, i) => {
        const isOpen = open === i;
        const Icon = ICON[it.id];
        return <div key={it.id} className={`acc-item${isOpen ? ' open' : ''}`} data-reveal-item>
          <h3 className="acc-heading">
            <button type="button" id={`acc-btn-${it.id}`} aria-expanded={isOpen} aria-controls={`acc-panel-${it.id}`} onClick={() => toggle(i)}>
              <span className="acc-num">0{i + 1}</span>
              <span className="acc-icon"><Icon strokeWidth={1.7} aria-hidden="true"/></span>
              <span className="acc-title">{it.title}</span>
              <span className="acc-toggle" aria-hidden="true"><Plus className="acc-plus" strokeWidth={1.8}/><Minus className="acc-minus" strokeWidth={1.8}/></span>
            </button>
          </h3>
          <div className="acc-panel" id={`acc-panel-${it.id}`} role="region" aria-labelledby={`acc-btn-${it.id}`} inert={hydrated && !isOpen ? true : undefined}>
            <div className="acc-inner">
              <div className="acc-content">
                <p>{it.body}</p>
                <ul className="acc-points">{it.points.map(p => <li key={p}><Check strokeWidth={2} aria-hidden="true"/>{p}</li>)}</ul>
                <div className="acc-inline-visual" aria-hidden="true"><Scene item={it}/><DetailCard item={it}/></div>
              </div>
            </div>
          </div>
        </div>;
      })}
      <p className="s-note" data-reveal-item><Info strokeWidth={1.7} aria-hidden="true"/>{c.note}</p>
    </div>
  </div>;
}
