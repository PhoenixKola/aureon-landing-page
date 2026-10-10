import {dictionaries, locales, type Locale, type PolicySlug} from '@/content/dictionary';
import {pathFor} from '@/lib/routes';

/** Segmented locale control. The indicator previews the hovered option and rests on the current one (pure CSS). */
export function LanguageSwitch({locale, slug, label, variant = 'compact'}: {locale: Locale; slug?: PolicySlug; label: string; variant?: 'compact' | 'full'}) {
  const active = locales.indexOf(locale);
  return <nav className={`lang-switch lang-${variant}`} aria-label={label} style={{['--active' as string]: active}}>
    <span className="lang-indicator" aria-hidden="true"/>
    {locales.map(l => <a key={l} href={pathFor(l, slug)} hrefLang={l} lang={l} aria-current={l === locale ? 'page' : undefined} title={dictionaries[l].lang}>
      {variant === 'full' ? <><b>{l.toUpperCase()}</b><span>{dictionaries[l].lang}</span></> : l.toUpperCase()}
    </a>)}
  </nav>;
}
