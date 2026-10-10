import {ArrowRight} from 'lucide-react';
import {BrandMark} from '@/components/icons';
import {HeaderScroll} from '@/components/HeaderScroll';
import {LanguageSwitch} from '@/components/LanguageSwitch';
import {MobileMenu} from '@/components/MobileMenu';
import {ThemeToggle} from '@/components/ThemeToggle';
import {dictionaries, type Locale, type PolicySlug} from '@/content/dictionary';
import {site} from '@/config/site';
import {homePath, pathFor} from '@/lib/routes';
import {sections} from '@/content/sections';

const ANCHORS = ['platform', 'connected', 'gyms'] as const;

export function SiteHeader({locale, slug, home = false}: {locale: Locale; slug?: PolicySlug; home?: boolean}) {
  const d = dictionaries[locale];
  const homeUrl = homePath(locale);
  const menuLinks: [string, string][] = [...ANCHORS.map((a, i) => [a, d.nav[i]] as [string, string]), ['details', sections[locale].s06.revisitLinks[3][1]]];
  const links = d.nav.map((label, i) => <a key={ANCHORS[i]} href={`${homeUrl}#${ANCHORS[i]}`}><span>{label}</span></a>);
  const entry = site.appEntryUrl ? <a className="header-cta" href={site.appEntryUrl}>{d.entry}<ArrowRight className="cta-arrow" strokeWidth={1.8} aria-hidden="true"/></a> : null;
  return <header className={`site-header${home ? ' home-header' : ''}`}>
    <div className="header-inner shell">
      <a className="wordmark" href={homeUrl} aria-label={`Aureon · ${d.home}`}>
        <span className="mark-box"><BrandMark/></span>
        <span className="wordmark-text">AUREON<small>GYM PLATFORM</small></span>
      </a>
      <nav className="desktop-nav" aria-label="Primary">{links}</nav>
      <div className="header-actions">
        <LanguageSwitch locale={locale} slug={slug} label={d.language}/>
        <ThemeToggle label={d.theme} modes={d.themeModes}/>
        {entry}
        <MobileMenu label={d.menu} closeLabel={d.close} homeHref={homeUrl} homeLabel={`Aureon · ${d.home}`}>
          <nav className="menu-links" aria-label={d.menu}>
            {menuLinks.map(([id, label], i) => <a key={id} href={`${homeUrl}#${id}`} style={{['--i' as string]: i}}><b>0{i + 2}</b><span>{label}</span><ArrowRight strokeWidth={1.6} aria-hidden="true"/></a>)}
          </nav>
          {entry}
          <div className="menu-controls">
            <div className="menu-lang"><span className="menu-label">{d.language}</span><LanguageSwitch locale={locale} slug={slug} label={d.language} variant="full"/></div>
            <div className="menu-theme"><span className="menu-label">{d.theme}</span><ThemeToggle label={d.theme} modes={d.themeModes} showLabel/></div>
          </div>
          <p className="menu-legal"><a href={pathFor(locale, 'privacy')}>{d.legalTitles.privacy}</a><a href={pathFor(locale, 'imprint')}>{d.legalTitles.imprint}</a></p>
        </MobileMenu>
      </div>
    </div>
    <HeaderScroll/>
  </header>;
}
