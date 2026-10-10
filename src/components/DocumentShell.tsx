import type {ReactNode} from 'react';
import {SiteFooter} from '@/components/SiteFooter';
import {SiteHeader} from '@/components/SiteHeader';
import {RevealOnScroll} from '@/components/RevealOnScroll';
import {dictionaries, type Locale, type PolicySlug} from '@/content/dictionary';

export function DocumentShell({locale,slug,home=false,children}:{locale:Locale;slug?:PolicySlug;home?:boolean;children:ReactNode}) {
  return <><a className="skip" href="#main">{dictionaries[locale].skip}</a><SiteHeader locale={locale} slug={slug} home={home}/>{children}<RevealOnScroll/><SiteFooter locale={locale} slug={slug}/></>;
}

/*
 * Runs before first paint: applies the stored theme, else the OS preference (no flash), and chooses the hero mode.
 * hero-intro  → first visit with motion allowed: assembly plays, header arrives last.
 * hero-static → reduced motion or already played this session: completed scene, header immediate.
 * The 9 s timer guarantees the header can never stay hidden if the scene fails to load.
 */
export const PRE_PAINT = `(function(){var d=document.documentElement;d.classList.add('js');
var t=null;try{t=localStorage.getItem('aureon-theme')}catch(e){}
d.dataset.theme=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
var played=false;try{played=sessionStorage.getItem('aureon-hero-played')==='1'}catch(e){}
var still=location.hash==='#hero-still'||location.hash.indexOf('#hero-shot=')===0;
d.classList.add(still||played||matchMedia('(prefers-reduced-motion: reduce)').matches?'hero-static':'hero-intro');
setTimeout(function(){d.classList.add('hero-settled')},9000);
addEventListener('keydown',function(e){if(e.key==='Tab')d.classList.add('hero-settled')});})();`;

export function HtmlLayout({locale,children}:{locale:Locale;children:ReactNode}) {
  return <html lang={locale} data-theme="system" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{__html:PRE_PAINT}}/></head>
    <body>{children}</body>
  </html>;
}
