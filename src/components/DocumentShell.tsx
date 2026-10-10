import type {ReactNode} from 'react';
import {SiteFooter} from '@/components/SiteFooter';
import {SiteHeader} from '@/components/SiteHeader';
import {RevealOnScroll} from '@/components/RevealOnScroll';
import {ScrollThumb} from '@/components/ScrollThumb';
import {dictionaries, type Locale, type PolicySlug} from '@/content/dictionary';

export function DocumentShell({locale,slug,home=false,children}:{locale:Locale;slug?:PolicySlug;home?:boolean;children:ReactNode}) {
  return <><a className="skip" href="#main">{dictionaries[locale].skip}</a><SiteHeader locale={locale} slug={slug} home={home}/>{children}<RevealOnScroll/><SiteFooter locale={locale} slug={slug}/><ScrollThumb/></>;
}

/*
 * Runs before first paint: applies the stored theme, else dark (the default; no flash), and chooses the hero mode.
 * hero-intro  → first visit with motion allowed: assembly plays, header arrives last.
 * hero-static → reduced motion, Save-Data or already played this session: completed still, no WebGL, header immediate.
 * The 9 s timer guarantees the header can never stay hidden if the scene fails to load.
 */
export const PRE_PAINT = `(function(){var d=document.documentElement;d.classList.add('js');
var t=null;try{t=localStorage.getItem('aureon-theme')}catch(e){}
d.dataset.theme=t==='light'?'light':'dark';
var played=false;try{played=sessionStorage.getItem('aureon-hero-played')==='1'}catch(e){}
var still=location.hash==='#hero-still'||location.hash.indexOf('#hero-shot=')===0;
var c=navigator.connection,saveData=!!(c&&c.saveData);
d.classList.add(still||played||saveData||matchMedia('(prefers-reduced-motion: reduce)').matches?'hero-static':'hero-intro');
setTimeout(function(){d.classList.add('hero-settled')},9000);
addEventListener('keydown',function(e){if(e.key==='Tab')d.classList.add('hero-settled')});})();`;

export function HtmlLayout({locale,children}:{locale:Locale;children:ReactNode}) {
  return <html lang={locale} data-theme="dark" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{__html:PRE_PAINT}}/></head>
    <body>{children}</body>
  </html>;
}
