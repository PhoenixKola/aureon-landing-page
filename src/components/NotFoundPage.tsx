import {ArrowRight} from 'lucide-react';
import {BrandMark} from '@/components/icons';
import {dictionaries, locales} from '@/content/dictionary';
import {homePath} from '@/lib/routes';

/*
 * One document serves every unmatched URL (dev global-not-found and the exported 404.html).
 * All three languages are rendered; NF_LOCALE picks one from the path prefix before paint.
 * Without JS the English version shows, with links to all three homes.
 */
export const NF_LOCALE = `(function(){var m=location.pathname.match(/^\\/(sq|it)(\\/|$)/);var l=m?m[1]:'en';var d=document.documentElement;d.setAttribute('data-nf',l);d.lang=l;})();`;

export function NotFoundPage() {
  return <>
    {locales.map(l => <a key={l} className="skip nf-l" data-nf-locale={l} href="#main">{dictionaries[l].skip}</a>)}
    <header className="nf-bar">
      <div className="shell nf-bar-inner">
        {locales.map(l => <a key={l} className="wordmark nf-l" data-nf-locale={l} href={homePath(l)} aria-label={`Aureon · ${dictionaries[l].home}`}>
          <span className="mark-box"><BrandMark/></span><span>AUREON<small>GYM PLATFORM</small></span>
        </a>)}
        <nav className="nf-langs" aria-label="Language / Gjuha / Lingua">
          {locales.map(l => <a key={l} href={homePath(l)} hrefLang={l} lang={l}><b>{l.toUpperCase()}</b><span>{dictionaries[l].lang}</span></a>)}
        </nav>
      </div>
    </header>
    <main id="main" className="nf">
      <div className="nf-media" aria-hidden="true">
        <img className="theme-img theme-img-dark" src="/assets/scenes/unbuilt-dark.webp" alt="" width={1920} height={1080}/>
        <img className="theme-img theme-img-light" src="/assets/scenes/unbuilt-light.webp" alt="" width={1920} height={1080}/>
      </div>
      <div className="nf-shade" aria-hidden="true"/>
      <div className="shell nf-inner">
        <p className="nf-code" aria-hidden="true"><span>4</span><BrandMark/><span>4</span></p>
        {locales.map(l => {
          const d = dictionaries[l];
          return <div key={l} className="nf-copy nf-l" data-nf-locale={l} lang={l}>
            <p className="eyebrow s-kicker"><span className="s-num">404</span><span className="s-rule"/>{d.notFoundK}</p>
            <h1>{d.notFoundTitle}</h1>
            <p className="nf-body">{d.notFoundP}</p>
            <div className="nf-actions">
              <a className="nf-cta" href={homePath(l)}><span>{d.back}</span><span className="nf-cta-icon"><ArrowRight strokeWidth={1.9} aria-hidden="true"/></span></a>
              <a className="nf-secondary" href={`${homePath(l)}#connected`}>{d.nav[1]}<ArrowRight strokeWidth={1.9} aria-hidden="true"/></a>
            </div>
          </div>;
        })}
      </div>
    </main>
    <footer className="nf-foot">
      <div className="shell nf-foot-inner">
        <span>© {new Date().getUTCFullYear()} Aureon</span>
        <span className="footer-credit" lang="it">Realizzato con <span aria-hidden="true">⚡️</span> da{' '}
          <a href="https://www.nivello.it" target="_blank" rel="noopener noreferrer">Nivello</a>
        </span>
      </div>
    </footer>
  </>;
}
