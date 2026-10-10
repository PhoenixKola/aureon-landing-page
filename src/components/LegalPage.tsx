import {ArrowRight, FileWarning} from 'lucide-react';
import {BrandMark} from '@/components/icons';
import {DocumentShell} from '@/components/DocumentShell';
import {LegalToc} from '@/components/LegalToc';
import {dictionaries, policySlugs, type Locale, type PolicySlug} from '@/content/dictionary';
import {pathFor} from '@/lib/routes';
import {releaseReadyByConfig} from '@/lib/readiness';

const num = (i: number) => String(i + 1).padStart(2, '0');

export function LegalPage({locale, slug}: {locale: Locale; slug: PolicySlug}) {
  const d = dictionaries[locale];
  const chapters = d[`${slug}Sections`];
  const status = releaseReadyByConfig ? d.approvedLabel : d.legalStatus;
  return <DocumentShell locale={locale} slug={slug}><main id="main" className="legal">
    <section className="legal-hero">
      <div className="shell legal-hero-grid">
        <div className="legal-hero-copy">
          <p className="eyebrow s-kicker"><span className="s-num">AUREON</span><span className="s-rule"/>{d.legal}</p>
          <h1>{d.legalTitles[slug]}</h1>
          <p className="legal-lead">{d.legalLead[slug]}</p>
        </div>
        <aside className="legal-id" aria-label={d.docLabel}>
          <p className="legal-id-head"><span className="legal-id-mark"><BrandMark/></span>{d.docLabel}</p>
          <dl>
            <div><dt>{d.docLabel}</dt><dd>{d.legalTitles[slug]}</dd></div>
            <div><dt>{d.language}</dt><dd>{d.lang}</dd></div>
            <div><dt>{d.chaptersLabel}</dt><dd>{num(chapters.length - 1)}</dd></div>
            <div><dt>{d.statusLabel}</dt><dd className={releaseReadyByConfig ? undefined : 'legal-id-draft'}>{status}</dd></div>
          </dl>
          <ol className="legal-index">
            {policySlugs.map((s, i) => <li key={s}><a href={pathFor(locale, s)} aria-current={s === slug ? 'page' : undefined}><span>{num(i)}</span>{d.legalTitles[s]}</a></li>)}
          </ol>
        </aside>
      </div>
    </section>
    <div className="shell legal-body">
      <LegalToc chapters={chapters.map(([h]) => h)} label={d.toc} statusLabel={d.statusLabel} status={status}/>
      <article className="legal-article">
        {!releaseReadyByConfig && <div className="draft-notice" role="note">
          <FileWarning strokeWidth={1.7} aria-hidden="true"/>
          <div><strong>{d.draft}</strong><p>{d.draftBody}</p></div>
        </div>}
        {chapters.map(([heading, paragraph], i) => <section className="legal-chapter" id={`section-${i + 1}`} key={heading} aria-labelledby={`section-${i + 1}-title`}>
          <span className="legal-chapter-num" aria-hidden="true">{num(i)}</span>
          <div className="legal-chapter-body"><h2 id={`section-${i + 1}-title`}>{heading}</h2><p>{paragraph}</p></div>
        </section>)}
        <div className="legal-related">
          <h3>{d.related}</h3>
          <div>{policySlugs.filter(o => o !== slug).map(o => <a key={o} href={pathFor(locale, o)}><span>{d.legalTitles[o]}</span><ArrowRight strokeWidth={1.8} aria-hidden="true"/></a>)}</div>
        </div>
      </article>
    </div>
  </main></DocumentShell>;
}
