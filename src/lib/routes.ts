import { locales, policySlugs, type Locale, type PolicySlug } from '@/content/dictionary';
export function homePath(locale: Locale): string { return locale === 'en' ? '/' : `/${locale}/`; }
export function pathFor(locale: Locale, slug?: PolicySlug): string { return homePath(locale) + (slug ? `${slug}/` : ''); }
export function isPolicySlug(value: string): value is PolicySlug {
  return (policySlugs as readonly string[]).includes(value);
}
export function alternatesFor(slug?: PolicySlug): Record<Locale | 'x-default', string> {
  return { en:pathFor('en', slug), sq:pathFor('sq', slug), it:pathFor('it', slug), 'x-default':pathFor('en', slug) };
}
export { locales, policySlugs };
