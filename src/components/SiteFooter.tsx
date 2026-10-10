import {ArrowUpRight, Mail} from 'lucide-react';
import {BrandMark} from '@/components/icons';
import {site} from '@/config/site';
import {dictionaries, locales, policySlugs, type Locale, type PolicySlug} from '@/content/dictionary';
import {sections} from '@/content/sections';
import {homePath, pathFor} from '@/lib/routes';
import {releaseReadyByConfig} from '@/lib/readiness';

export function SiteFooter({locale, slug}: {locale: Locale; slug?: PolicySlug}) {
  const d = dictionaries[locale];
  const x = sections[locale];
  const home = homePath(locale);
  const platformLinks: [string, string][] = [['platform', d.nav[0]], ['connected', d.nav[1]], ['gyms', d.nav[2]], ['details', x.s06.revisitLinks[3][1]]];
  return <footer className="footer">
    <div className="shell">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="footer-wordmark" href={home} aria-label={`Aureon · ${d.home}`}><span className="footer-mark"><BrandMark/></span><span>AUREON<small>GYM PLATFORM</small></span></a>
          <p className="footer-tagline">{x.footer.tagline}</p>
          <p className="footer-note">{d.footerNote}</p>
        </div>
        <nav className="footer-col" id="footer-nav" aria-label={x.footer.platform}>
          <p className="footer-label">{x.footer.platform}</p>
          {platformLinks.map(([id, label]) => <a key={id} href={`${home}#${id}`}>{label}</a>)}
          {site.contactEmail && <a href={`mailto:${site.contactEmail}`}><Mail strokeWidth={1.7} aria-hidden="true"/>{d.contact}</a>}
          {site.businessUrl && <a href={site.businessUrl} target="_blank" rel="noopener noreferrer">Website<ArrowUpRight strokeWidth={1.7} aria-hidden="true"/></a>}
        </nav>
        <nav className="footer-col" aria-label={d.legal}>
          <p className="footer-label">{d.legal}</p>
          {policySlugs.map(s => <a key={s} href={pathFor(locale, s)} aria-current={s === slug ? 'page' : undefined}>{d.legalTitles[s]}</a>)}
        </nav>
        <nav className="footer-col" aria-label={x.footer.language}>
          <p className="footer-label">{x.footer.language}</p>
          {locales.map(l => <a key={l} href={pathFor(l, slug)} hrefLang={l} lang={l} aria-current={l === locale ? 'page' : undefined}><b>{l.toUpperCase()}</b>{dictionaries[l].lang}</a>)}
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {new Date().getUTCFullYear()} Aureon</span>
        <span className="footer-status"><i aria-hidden="true"/>{releaseReadyByConfig ? 'AUREON · GYM PLATFORM' : d.preview}</span>
        <span className="footer-credit" lang="it">Realizzato con <span aria-hidden="true">⚡️</span> da{' '}
          <a href="https://www.nivello.it" target="_blank" rel="noopener noreferrer">Nivello</a>
        </span>
      </div>
    </div>
  </footer>;
}
