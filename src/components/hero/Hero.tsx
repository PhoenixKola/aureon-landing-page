import {ArrowDown, ArrowRight} from 'lucide-react';
import {BrandMark} from '@/components/icons';
import {HeroScene} from '@/components/hero/HeroScene';
import type {Dictionary} from '@/content/dictionary';
import {site} from '@/config/site';

/** Completed-scene stills rendered from the same WebGL scene. Shown only for no-JS,
 * reduced motion / repeat visits (until the live canvas takes over) and WebGL failure. */
function HeroStill({theme}: {theme: 'dark' | 'light'}) {
  return <picture className={`hero-still hero-still-${theme}`}>
    <source media="(max-width: 719px), (max-aspect-ratio: 9/10)" srcSet={`/assets/hero/gym-mobile-${theme}.webp`} type="image/webp"/>
    <img src={`/assets/hero/gym-desktop-${theme}.webp`} alt="" loading="lazy" decoding="async" width={1920} height={1080}/>
  </picture>;
}

export function Hero({d}: {d: Dictionary}) {
  return <div className="hero-runway"><section className="hero" aria-labelledby="hero-title">
    <div className="hero-media" role="img" aria-label={d.heroImage}>
      <HeroStill theme="dark"/><HeroStill theme="light"/>
      <HeroScene/>
      <div className="hero-shade" aria-hidden="true"/>
      <div className="hero-handoff" aria-hidden="true"/>
    </div>
    <div className="hero-inner shell">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow" data-hero-beat="1"><span className="tiny-line"/>{d.heroEyebrow}</p>
        <h1 id="hero-title">{d.heroTitle.map((line, i) => <span key={i} className={i === 2 ? 'accent' : undefined} data-hero-beat={2 + i}>{line}</span>)}</h1>
        <p className="hero-body" data-hero-beat="5">{d.heroBody}</p>
        <div className="hero-ctas" data-hero-beat="6">
          <a className="button button-light" href="#platform">{d.explore}<ArrowRight className="cta-arrow" strokeWidth={1.8} aria-hidden="true"/></a>
          {site.appEntryUrl && <a className="button button-gold" href={site.appEntryUrl}>{d.entry}<ArrowRight className="cta-arrow" strokeWidth={1.8} aria-hidden="true"/></a>}
        </div>
      </div>
    </div>
    <div className="hero-foot shell" data-hero-beat="7">
      <span className="stage-tag"><BrandMark/><span>{d.stageCaption}</span></span>
      <a className="scroll-cue" href="#platform"><span>{d.scroll}</span><ArrowDown strokeWidth={1.6} aria-hidden="true"/></a>
    </div>
  </section></div>;
}
