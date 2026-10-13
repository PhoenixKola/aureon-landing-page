import {DocumentShell} from '@/components/DocumentShell';
import {Hero} from '@/components/hero/Hero';
import {ConnectedDay} from '@/components/sections/ConnectedDay';
import {ProductTheatre} from '@/components/sections/ProductTheatre';
import {SystemPath} from '@/components/sections/SystemPath';
import {DetailsExplorer} from '@/components/sections/DetailsExplorer';
import {FinalCta} from '@/components/sections/FinalCta';
import {sections} from '@/content/sections';
import {dictionaries,type Locale} from '@/content/dictionary';
import {site} from '@/config/site';
import {CinemaStory, type Chapter} from '@/components/CinemaStory';

/** The same gym, seen from a new position in each chapter: stills rendered from the hero scene, softened behind the DOM. */
function Backdrop({scene}: {scene: string}) {
  return <div className="scene-backdrop" aria-hidden="true">
    <img className="theme-img theme-img-dark" src={`/assets/scenes/${scene}-dark.webp`} alt="" loading="lazy" decoding="async"/>
    <img className="theme-img theme-img-light" src={`/assets/scenes/${scene}-light.webp`} alt="" loading="lazy" decoding="async"/>
  </div>;
}

export function HomePage({locale}:{locale:Locale}) {
  const d=dictionaries[locale];const x=sections[locale];
  const chapters:Chapter[]=[...x.s06.revisitLinks.map(([id,label],i)=>({id,num:`0${i+2}`,label})),{id:'entry',num:'06',label:x.s06.kicker}];
  return <DocumentShell locale={locale} home><main id="main">
    <Hero d={d}/>
    <CinemaStory chapters={chapters} label={x.s06.revisit}/>
    <SystemPath c={x.s02}/>
    <section className="s03 section-padding" id="connected" aria-labelledby="s03-title" data-reveal="fade"><Backdrop scene="entrance"/><div className="shell">
      <header className="s-head"><p className="eyebrow s-kicker" data-reveal-item><span className="s-num">03</span><span className="s-rule"/>{x.s03.kicker}</p>
        <h2 id="s03-title" data-reveal-item>{x.s03.title}</h2><p className="s-lead" data-reveal-item>{x.s03.lead}</p></header>
      <div data-reveal-item><ProductTheatre c={x.s03}/></div>
    </div></section>
    <section className="s04 section-padding" id="gyms" aria-labelledby="s04-title" data-reveal="fade"><Backdrop scene="trainer"/><div className="shell">
      <header className="s-head s04-head"><p className="eyebrow s-kicker" data-reveal-item><span className="s-num">04</span><span className="s-rule"/>{x.s04.kicker}</p>
        <h2 id="s04-title" data-reveal-item>{x.s04.title}</h2><p className="s-lead" data-reveal-item>{x.s04.lead}</p></header>
      <ConnectedDay c={x.s04}/>
    </div></section>
    <section className="s05 section-padding" id="details" aria-labelledby="s05-title" data-reveal="fade"><div className="shell">
      <header className="s-head s05-head"><p className="eyebrow s-kicker" data-reveal-item><span className="s-num">05</span><span className="s-rule"/>{x.s05.kicker}</p>
        <h2 id="s05-title" data-reveal-item>{x.s05.title}</h2><p className="s-lead" data-reveal-item>{x.s05.lead}</p></header>
      <DetailsExplorer c={x.s05}/>
    </div></section>
    <FinalCta c={x.s06} appEntryUrl={site.appEntryUrl}/>
  </main></DocumentShell>;
}
