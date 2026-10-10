import {ArrowDown, ArrowRight, ArrowUpRight, Info} from 'lucide-react';
import {DayNightFigure} from '@/components/sections/DayNightFigure';
import {MagneticLink} from '@/components/sections/MagneticLink';
import type {SectionsCopy} from '@/content/sections';

/** Section 06. The app CTA appears only for a verified APP_ENTRY_URL; otherwise the honest action is to explore. */
export function FinalCta({c, appEntryUrl}: {c: SectionsCopy['s06']; appEntryUrl: string | null}) {
  return <section className="s06" id="entry" aria-labelledby="s06-title" data-reveal="fade">
    <div className="s06-panel">
      <div className="shell s06-grid">
        <div className="s06-copy">
          <p className="eyebrow s-kicker" data-reveal-item><span className="s-num">06</span><span className="s-rule"/>{c.kicker}</p>
          <h2 id="s06-title" data-reveal-item><span>{c.title[0]}</span> <span className="s06-soft">{c.title[1]}</span></h2>
          <p className="s06-body" data-reveal-item>{appEntryUrl ? c.bodyWithApp : c.bodyNoApp}</p>
          <div className="s06-actions" data-reveal-item>
            {appEntryUrl
              ? <>
                  <MagneticLink href={appEntryUrl} className="s06-cta" external><span>{c.openApp}</span><span className="s06-cta-icon"><ArrowUpRight strokeWidth={1.9} aria-hidden="true"/></span></MagneticLink>
                  <a className="s06-secondary" href="#platform">{c.explore}<ArrowRight strokeWidth={1.9} aria-hidden="true"/></a>
                </>
              : <MagneticLink href="#platform" className="s06-cta"><span>{c.explore}</span><span className="s06-cta-icon"><ArrowRight strokeWidth={1.9} aria-hidden="true"/></span></MagneticLink>}
          </div>
          {!appEntryUrl && <p className="s06-preview" data-reveal-item><Info strokeWidth={1.8} aria-hidden="true"/>{c.previewNote}</p>}
          <nav className="s06-revisit" aria-label={c.revisit} data-reveal-item>
            <span className="s06-revisit-label">{c.revisit}</span>
            {c.revisitLinks.map(([id, label], i) => <a key={id} href={`#${id}`}><b>0{i + 2}</b>{label}<ArrowDown strokeWidth={1.8} aria-hidden="true"/></a>)}
          </nav>
        </div>
        <DayNightFigure caption={c.caption} times={['07:10', '22:00']}/>
      </div>
    </div>
    <div className="s06-steps" aria-hidden="true"><i/><i/><i/></div>
  </section>;
}
