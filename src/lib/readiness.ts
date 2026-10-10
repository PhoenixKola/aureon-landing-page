import { dictionaries, locales, policySlugs } from '@/content/dictionary';
import { site } from '@/config/site';
export const legalDraftContainsPlaceholders = locales.some(locale => policySlugs.some(slug =>
  dictionaries[locale][`${slug}Sections`].some(([, paragraph]) => /\[[^\]]+\]/.test(paragraph))
));
export const releaseReadyByConfig = Boolean(
  site.origin && site.appEntryUrl && site.operator.name && site.operator.address &&
  site.operator.jurisdiction && site.operator.privacyEmail &&
  site.legal.approved && site.legal.approver && site.legal.approvedAt &&
  !legalDraftContainsPlaceholders
);
