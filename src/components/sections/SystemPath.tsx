import {CalendarDays, DoorOpen, Info, LayoutDashboard, UsersRound, type LucideIcon} from 'lucide-react';
import type {SectionsCopy, StationIcon} from '@/content/sections';

const ICONS: Record<StationIcon, LucideIcon> = {entry: DoorOpen, schedule: CalendarDays, team: UsersRound, overview: LayoutDashboard};

/** Section 02: the physical floor connected, station by station, to the people and views that run it. */
export function SystemPath({c}: {c: SectionsCopy['s02']}) {
  return <section className="s02 section-padding" id="platform" aria-labelledby="s02-title" data-reveal="fade">
    <div className="shell s02-grid">
      <div className="s02-copy">
        <p className="eyebrow s-kicker" data-reveal-item><span className="s-num">02</span><span className="s-rule"/>{c.kicker}</p>
        <h2 id="s02-title" data-reveal-item>{c.title[0]} <span className="s-accent">{c.title[1]}</span></h2>
        <p className="s-lead" data-reveal-item>{c.lead}</p>
      </div>
      <figure className="s02-figure" data-reveal-item>
        <img className="theme-img theme-img-dark" src="/assets/scenes/plates-dark.webp" alt={c.imageAlt} width={1200} height={1500} loading="lazy" decoding="async"/>
        <img className="theme-img theme-img-light" src="/assets/scenes/plates-light.webp" alt="" width={1200} height={1500} loading="lazy" decoding="async"/>
        <figcaption><span className="s02-chip">01 · {c.imageLabel}</span><span>{c.imageNote}</span></figcaption>
      </figure>
      <div className="s02-path">
        <p className="s02-path-label" data-reveal-item>{c.pathLabel}</p>
        <ol className="s02-stations">
          {c.stations.map((s, i) => {
            const Icon = ICONS[s.icon];
            return <li key={s.title} className="s02-station" data-reveal-item style={{['--i' as string]: i + 3}}>
              <span className="s02-station-head"><span className="s02-node" aria-hidden="true"><Icon strokeWidth={1.6}/></span><span className="s02-step">0{i + 2}</span></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul className="s02-who">{s.who.map(w => <li key={w}>{w}</li>)}</ul>
            </li>;
          })}
        </ol>
        <p className="s-note" data-reveal-item><Info strokeWidth={1.7} aria-hidden="true"/>{c.note}</p>
      </div>
    </div>
  </section>;
}
