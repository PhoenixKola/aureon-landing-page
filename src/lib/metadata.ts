import type { Metadata } from 'next';
import { dictionaries, type Locale, type PolicySlug } from '@/content/dictionary';
import { site } from '@/config/site';
import { alternatesFor, pathFor } from '@/lib/routes';
import { releaseReadyByConfig } from '@/lib/readiness';

export function metadataFor(locale: Locale, slug?: PolicySlug): Metadata {
  const dict = dictionaries[locale];
  const title = slug ? `${dict.legalTitles[slug]} — Aureon` : `Aureon — ${dict.heroEyebrow}`;
  const description = slug ? dict.legalLead[slug] : dict.heroBody;
  const canonical = site.origin ? site.origin + pathFor(locale, slug) : undefined;
  const languages = site.origin ? Object.fromEntries(Object.entries(alternatesFor(slug)).map(([key,path]) => [key,site.origin + path])) : undefined;
  return {
    title, description,
    robots: releaseReadyByConfig ? {index:true,follow:true} : {index:false,follow:false},
    alternates: site.origin ? {canonical, languages} : undefined,
    openGraph: { title, description, type:'website', locale:locale === 'sq'?'sq_AL':locale === 'it'?'it_IT':'en_US',
      url: canonical,
      images: site.origin ? [{url:site.origin + '/assets/social-preview.webp',width:1200,height:630,alt:'Aureon — connected gym platform'}] : undefined,
    },
    icons: {icon:'/favicon.svg'},
  };
}
