import type {Metadata} from 'next';
import {NF_LOCALE, NotFoundPage} from '@/components/NotFoundPage';

/*
 * Build-only (".build.tsx" is a page extension only during `next build`, see next.config.ts).
 * `output: 'export'` does not prerender global-not-found, so this renders the same 404 once;
 * scripts/finalize-404.mjs turns it into out/404.html and removes this route from the export.
 */
export const metadata: Metadata = {title: 'Page not found — Aureon', robots: {index: false, follow: false}};
export default function NotFoundDocument() {
  return <div className="nf-body-root"><script dangerouslySetInnerHTML={{__html: NF_LOCALE}}/><NotFoundPage/></div>;
}
