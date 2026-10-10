import {
  AlertCircle, Banknote, BarChart3, Bell, CalendarCheck, CalendarDays, CalendarX2, ClipboardList, Clock3, Contact,
  DoorOpen, Dumbbell, FileText, LayoutDashboard, LockKeyhole, MessageSquareWarning, Receipt, Search, Ticket, User,
  UserCog, UserMinus, UsersRound, Wallet, type LucideIcon,
} from 'lucide-react';
import type {ReactNode} from 'react';
import {BrandMark} from '@/components/icons';
import type {SectionsCopy} from '@/content/sections';

type UI = SectionsCopy['s03']['ui'];

/** A highlightable area of the illustrative UI, numbered to match the anatomy notes. */
function Region({n, className, children}: {n: number; className?: string; children: ReactNode}) {
  return <div className={`ui-region ${className ?? ''}`} data-region={n}><span className="ui-marker" aria-hidden="true">{n}</span>{children}</div>;
}
const Redacted = ({w}: {w: number}) => <span className="ui-redact" style={{width: `${w}%`}}/>;

export function MemberScreen({ui}: {ui: UI['member']}) {
  const tabIcons: LucideIcon[] = [LayoutDashboard, Dumbbell, CalendarDays, Ticket, User];
  return <div className="ui ui-member">
    <div className="ui-status"><span>18:02</span><span className="ui-status-icons"><i/><i/><i/></span></div>
    <header className="ui-m-head"><span className="ui-brand"><BrandMark/></span><strong>{ui.today}</strong><span className="ui-avatar"><User strokeWidth={1.8}/></span></header>
    <p className="ui-m-greet">{ui.greeting}</p>
    <div className="ui-week">{[13, 14, 15, 16, 17, 18, 19].map(d => <span key={d} className={d === 16 ? 'on' : undefined}>{d}</span>)}</div>
    <Region n={1} className="ui-card ui-card-hero">
      <span className="ui-card-k">{ui.nextClass}</span>
      <strong>{ui.className}</strong>
      <span className="ui-meta"><Clock3 strokeWidth={1.8}/>{ui.classMeta}</span>
      <span className="ui-pill">{ui.book}</span>
    </Region>
    <Region n={2} className="ui-card">
      <span className="ui-card-icon"><Dumbbell strokeWidth={1.8}/></span>
      <span className="ui-card-body"><span className="ui-card-k">{ui.appointment}</span><strong>{ui.appointmentName}</strong><span className="ui-meta">{ui.appointmentMeta}</span></span>
    </Region>
    <div className="ui-card ui-progress">
      <span className="ui-card-k">{ui.progress}</span>
      <svg viewBox="0 0 200 48" aria-hidden="true"><path d="M2 40 C28 38 34 30 52 31 S82 20 100 24 S134 12 150 15 S182 6 198 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
      <span className="ui-meta">{ui.progressNote}</span>
    </div>
    <div className="ui-card ui-bookings">
      <span className="ui-card-k">{ui.bookings}</span>
      {ui.bookingList.map(([name, when]) => <span key={name} className="ui-booking">{name}<b>{when}</b></span>)}
    </div>
    <Region n={3} className="ui-tabbar">
      {ui.tabs.map((t, i) => { const I = tabIcons[i]; return <span key={t} className={i === 0 ? 'on' : undefined}><I strokeWidth={1.8}/>{t}</span>; })}
    </Region>
  </div>;
}

function Sidebar({app, items, icons, active}: {app: string; items: string[]; icons: LucideIcon[]; active: number}) {
  return <nav className="ui-side" aria-hidden="true">
    <span className="ui-side-brand"><BrandMark/><b>{app}</b></span>
    {items.map((label, i) => { const I = icons[i]; return <span key={label} className={i === active ? 'on' : undefined}><I strokeWidth={1.8}/><em>{label}</em></span>; })}
  </nav>;
}

export function DeskScreen({ui}: {ui: UI['desk']}) {
  const icons = [BarChart3, UsersRound, Wallet, Contact, Receipt, DoorOpen, CalendarDays, ClipboardList];
  return <div className="ui ui-desktop ui-desk">
    <Sidebar app={ui.app} items={ui.nav} icons={icons} active={5}/>
    <div className="ui-main">
      <header className="ui-topbar"><strong>{ui.view}</strong><span className="ui-chip">{ui.today}</span><span className="ui-search"><Search strokeWidth={1.8}/></span><Bell strokeWidth={1.8}/></header>
      <div className="ui-desk-grid">
        <Region n={1} className="ui-panel ui-table">
          <div className="ui-tr ui-th">{ui.columns.map(c => <span key={c}>{c}</span>)}</div>
          {[['07:12', 0, 62], ['07:40', 1, 48], ['08:05', 2, 70], ['09:30', 3, 55], ['10:15', 0, 40]].map(([time, s, w], i) =>
            <div className="ui-tr" key={i}><span className="ui-person"><span className="ui-avatar sm"><User strokeWidth={1.8}/></span><Redacted w={w as number}/></span><span className="ui-time">{time}</span><span className={`ui-status-chip s${s}`}>{ui.statuses[s as number]}</span></div>)}
        </Region>
        <div className="ui-desk-side">
          <Region n={2} className="ui-panel ui-classes">
            <span className="ui-panel-k">{ui.classes}</span>
            {ui.classList.map(([t, name], i) => <span key={t} className={`ui-class${i === 2 ? ' on' : ''}`}><b>{t}</b>{name}</span>)}
          </Region>
          <Region n={3} className="ui-panel ui-notice">
            <AlertCircle strokeWidth={1.8}/><span><strong>{ui.notice}</strong><small>{ui.noticeText}</small></span>
          </Region>
        </div>
      </div>
    </div>
  </div>;
}

export function ManagerScreen({ui}: {ui: UI['manager']}) {
  const icons = [BarChart3, UsersRound, UserMinus, Wallet, UserCog, Banknote, ClipboardList, CalendarCheck, LockKeyhole, MessageSquareWarning];
  const noticeIcons = [FileText, CalendarX2, LockKeyhole];
  return <div className="ui ui-desktop ui-manager">
    <Region n={3} className="ui-side-wrap"><Sidebar app={ui.app} items={ui.nav} icons={icons} active={0}/></Region>
    <div className="ui-main">
      <header className="ui-topbar"><strong>{ui.view}</strong><span className="ui-chip">{ui.week}</span><span className="ui-search"><Search strokeWidth={1.8}/></span><Bell strokeWidth={1.8}/></header>
      <Region n={1} className="ui-notices">
        {ui.notices.map((n, i) => { const I = noticeIcons[i]; return <span key={n} className={`ui-panel ui-notice-card n${i}`}><I strokeWidth={1.8}/><strong>{n}</strong></span>; })}
      </Region>
      <Region n={2} className="ui-charts">
        <div className="ui-panel ui-chart"><span className="ui-panel-k">{ui.chartA}</span>
          <svg viewBox="0 0 220 90" preserveAspectRatio="none" aria-hidden="true"><path className="ui-area" d="M0 70 C30 64 44 50 70 52 S112 34 140 38 S186 18 220 20 L220 90 L0 90Z"/><path className="ui-line" d="M0 70 C30 64 44 50 70 52 S112 34 140 38 S186 18 220 20"/></svg>
        </div>
        <div className="ui-panel ui-chart"><span className="ui-panel-k">{ui.chartB}</span>
          <div className="ui-bars" aria-hidden="true">{[28, 46, 62, 40, 30, 36, 58, 74, 52, 34].map((h, i) => <i key={i} style={{height: `${h}%`}}/>)}</div>
        </div>
      </Region>
      <div className="ui-panel ui-staff"><span className="ui-panel-k">{ui.staff}</span>
        {ui.staffRows.map((r, i) => <span key={r} className="ui-staff-row"><em>{r}</em><span className="ui-shift"><i style={{left: `${[6, 30, 48][i]}%`, width: `${[46, 38, 30][i]}%`}}/></span></span>)}
      </div>
    </div>
  </div>;
}
