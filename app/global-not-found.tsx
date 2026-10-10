import './globals.css';
import type {Metadata} from 'next';
import {PRE_PAINT} from '@/components/DocumentShell';
import {NF_LOCALE, NotFoundPage} from '@/components/NotFoundPage';

export const metadata: Metadata = {
  title: 'Page not found — Aureon',
  robots: {index: false, follow: false},
  icons: {icon: '/favicon.svg'},
};

/** Routing-level 404 for every unmatched URL (the app has one root layout per locale group). */
export default function GlobalNotFound() {
  return <html lang="en" data-theme="dark" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{__html: PRE_PAINT + NF_LOCALE}}/></head>
    <body className="nf-body-root"><NotFoundPage/></body>
  </html>;
}
