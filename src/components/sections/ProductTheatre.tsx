'use client';
import {useRef, useState, type KeyboardEvent} from 'react';
import {ConciergeBell, Info, LayoutDashboard, Smartphone, type LucideIcon} from 'lucide-react';
import type {RoleId, SectionsCopy} from '@/content/sections';
import {DeskScreen, ManagerScreen, MemberScreen} from '@/components/sections/ProductScreens';

const ROLE_ICONS: Record<RoleId, LucideIcon> = {member: Smartphone, desk: ConciergeBell, manager: LayoutDashboard};

/** Section 03 stage: one shared frame whose device, interface and story change with the chosen role. */
export function ProductTheatre({c}: {c: SectionsCopy['s03']}) {
  const [active, setActive] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const role = c.roles[active];
  const count = c.roles.length;

  function select(i: number) { setActive(i); setFocus(null); }
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const map: Record<string, number> = {ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: count - 1};
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + count) % count;
    select(next);
    tabs.current[next]?.focus();
  }

  return <div className="theatre" style={{['--role' as string]: active}}>
    <div className="theatre-rail">
      <div className="theatre-tabs" role="tablist" aria-label={c.selector} aria-orientation="vertical">
        <span className="theatre-track" aria-hidden="true"/>
        {c.roles.map((r, i) => {
          const Icon = ROLE_ICONS[r.id];
          return <button key={r.id} ref={el => { tabs.current[i] = el; }} type="button" role="tab" id={`role-tab-${r.id}`}
            aria-selected={i === active} aria-controls="role-panel" tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)} onKeyDown={e => onKey(e, i)}>
            <span className="theatre-tab-icon"><Icon strokeWidth={1.7} aria-hidden="true"/></span>
            <span className="theatre-tab-text"><b>{r.tab}</b><small>{r.hint}</small></span>
          </button>;
        })}
      </div>
      <div className="theatre-story" id="role-story" key={role.id}>
        <p className="theatre-eyebrow"><span className="dot"/>{role.eyebrow}</p>
        <h3>{role.title}</h3>
        <p>{role.text}</p>
      </div>
    </div>

    <div className="theatre-stage" id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${role.id}`} aria-describedby="role-story">
      <p className="theatre-disclosure"><Info strokeWidth={1.7} aria-hidden="true"/>{c.disclosure}</p>
      <div className={`device device-${role.id === 'member' ? 'phone' : 'desktop'}`} data-focus={focus ?? undefined} aria-hidden="true">
        <div className="device-screen" key={role.id}>
          {role.id === 'member' && <MemberScreen ui={c.ui.member}/>}
          {role.id === 'desk' && <DeskScreen ui={c.ui.desk}/>}
          {role.id === 'manager' && <ManagerScreen ui={c.ui.manager}/>}
        </div>
      </div>
      <div className="anatomy">
        <p className="anatomy-title">{c.anatomy}</p>
        <ol>
          {role.callouts.map((co, i) => <li key={`${role.id}-${i}`}>
            <button type="button" aria-pressed={focus === i + 1} onClick={() => setFocus(i + 1)}
              onMouseEnter={() => setFocus(i + 1)} onFocus={() => setFocus(i + 1)}>
              <span className="anatomy-n">{i + 1}</span>
              <span><b>{co.title}</b><small>{co.text}</small></span>
            </button>
          </li>)}
        </ol>
      </div>
    </div>
  </div>;
}
