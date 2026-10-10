import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');

test('true React and Next.js TypeScript source is present',()=>{
 const p=JSON.parse(read('package.json'));assert.ok(p.dependencies.react);assert.ok(p.dependencies.next);assert.ok(p.devDependencies.typescript);
 assert.ok(existsSync('src/components/HomePage.tsx'));assert.ok(existsSync('src/components/hero/Hero.tsx'));assert.ok(existsSync('app/(en)/page.tsx'));
});
test('dependencies are pinned to exact versions',()=>{
 const p=JSON.parse(read('package.json'));
 for(const [name,v] of Object.entries({...p.dependencies,...p.devDependencies}))assert.match(v,/^\d+\.\d+\.\d+$/,name);
 assert.ok(existsSync('package-lock.json'));
});
test('hero assembles a real-time scene and never ships a composite gym photo underneath',()=>{
 const hero=read('src/components/hero/Hero.tsx');const scene=read('src/components/hero/gym-scene.ts');const css=read('app/globals.css');
 assert.ok(hero.includes('<HeroScene/>'));
 assert.ok(!/gym-interior|gym-stage|backgroundImage/.test(hero),'no photo behind the hero');
 // The completed still is fallback-only: hidden by default, shown for no-JS / static mode / WebGL failure.
 assert.match(css,/\.hero-still\{display:none\}/);
 assert.match(css,/html:not\(\.js\) \.hero-still-dark,\.hero-static \.hero-still-dark,\.hero-media\.is-fallback \.hero-still-dark/);
 for(const t of ['dark','light'])for(const s of ['desktop','mobile'])assert.ok(existsSync(`public/assets/hero/gym-${s}-${t}.webp`),`${s}-${t} still`);
 // Pieces arrive in order: floor → rack → bar → plates → bench → dumbbells → trainer → lights → brand.
 const at=label=>{const i=scene.indexOf(label);assert.ok(i>0,label);return i};
 ['1. Foundation','3. Power rack','4. Loaded barbell','5. Flat bench','6. Two-tier','7. Dual-stack','9. Linear pendant','10. Aureon chevron'].reduce((prev,label)=>{const i=at(label);assert.ok(i>prev,label);return i},0);
});
test('replay control is removed everywhere',()=>{
 for(const f of ['src/components/hero/Hero.tsx','src/content/dictionary.ts','app/globals.css','src/components/icons.tsx'])assert.ok(!/replay/i.test(read(f)),f);
});
test('header arrives last and can never stay hidden',()=>{
 const css=read('app/globals.css');const shell=read('src/components/DocumentShell.tsx');
 assert.match(css,/\.hero-intro:not\(\.hero-settled\) \.home-header\{[^}]*visibility:hidden/);
 assert.match(shell,/setTimeout\(function\(\)\{d\.classList\.add\('hero-settled'\)\},9000\)/);
 assert.match(shell,/prefers-reduced-motion: reduce/);
 assert.match(read('src/components/hero/HeroScene.tsx'),/hero-settled/);
});
test('hero is sized to the first viewport, scrollbar track transparent',()=>{
 const css=read('app/globals.css');
 assert.match(css,/\.hero\{[^}]*height:100svh/);
 assert.match(css,/scrollbar-color:var\(--thumb\) transparent/);
 assert.match(css,/::-webkit-scrollbar-track,::-webkit-scrollbar-corner\{background:transparent\}/);
});
test('languages, controls and legal templates are present',()=>{
 const dict=read('src/content/dictionary.ts');
 for(const lang of ["en:{","sq:{","it:{"])assert.ok(dict.includes(lang),lang);
 assert.equal((dict.match(/themeModes:\{/g)||[]).length,3);
 for(const route of ['privacy','terms','imprint','disclaimer','cookies'])assert.ok(dict.includes(route+'Sections'),route);
 assert.match(read('src/components/LanguageSwitch.tsx'),/aria-current/);
 assert.match(read('src/components/ThemeToggle.tsx'),/lucide-react/);
});
test('no unsafe generic app destination',()=>{
 const conf=read('src/config/site.ts');assert.ok(conf.includes('verifiedHttpsUrl'));
 assert.ok(!conf.includes("'https://app.aureon.com'"));
});
test('scroll reveal progressive enhancement and reduced motion',()=>{
 const reveal=read('src/components/RevealOnScroll.tsx');assert.ok(reveal.includes('IntersectionObserver'));assert.ok(reveal.includes('prefers-reduced-motion'));
 const css=read('app/globals.css');assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));assert.ok(css.includes('@media(prefers-reduced-motion:no-preference)'));
});
test('hero fallback stills stay lightweight',()=>{
 for(const t of ['dark','light'])for(const s of ['desktop','mobile'])assert.ok(statSync(`public/assets/hero/gym-${s}-${t}.webp`).size<260_000);
});

test('sections 02–04 copy is complete and parallel in EN/SQ/IT',async()=>{
 const {sections}=await import('../src/content/sections.ts');
 const shape=v=>Array.isArray(v)?v.map(shape):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,shape(v[k])])):v===null?null:typeof v;
 assert.deepEqual(shape(sections.sq),shape(sections.en));
 assert.deepEqual(shape(sections.it),shape(sections.en));
 const strings=(v,acc=[])=>{if(typeof v==='string')acc.push(v);else if(v&&typeof v==='object')Object.values(v).forEach(x=>strings(x,acc));return acc};
 for(const l of ['en','sq','it'])for(const s of strings(sections[l]))assert.ok(s.trim().length>0,`${l} empty string`);
 // Albanian/Italian must not fall back to English sentences (short product nouns like CRM/Dashboard/Staff are shared).
 const en=new Set(strings(sections.en).filter(s=>(s.match(/\p{L}{3,}/gu)||[]).length>=3));
 for(const l of ['sq','it'])for(const s of strings(sections[l]))assert.ok(!en.has(s),`${l} untranslated: ${s}`);
 assert.equal(sections.en.s03.roles.length,3);assert.equal(sections.en.s04.moments.length,5);
});
test('middle sections are rebuilt, not the old placeholder layouts',()=>{
 const home=read('src/components/HomePage.tsx');const css=read('app/globals.css');
 for(const c of ['SystemPath','ProductTheatre','ConnectedDay'])assert.ok(home.includes(c),c);
 assert.ok(!existsSync('src/components/ProductExperience.tsx'));
 assert.ok(!/roles-background-word|statement-mark|product-selector/.test(css+home));
 const theatre=read('src/components/sections/ProductTheatre.tsx');
 for(const k of ['role="tablist"','role="tab"','role="tabpanel"','ArrowDown','Home','End'])assert.ok(theatre.includes(k),k);
 assert.ok(existsSync('public/assets/scenes/plates-dark.webp')&&existsSync('public/assets/scenes/plates-light.webp'));
});

test('footer carries the exact Nivello credit, safely linked',()=>{
 const f=read('src/components/SiteFooter.tsx');
 assert.match(f,/Realizzato con <span aria-hidden="true">⚡️<\/span> da\{' '\}/);
 assert.match(f,/<a href="https:\/\/www\.nivello\.it" target="_blank" rel="noopener noreferrer">Nivello<\/a>/);
 assert.ok(!/className="[^"]*(text-sm|text-paper|font-extrabold|hover:text-amber)/.test(f),'no dead Tailwind classes');
});
test('closing CTA never fakes an app link',()=>{
 const cta=read('src/components/sections/FinalCta.tsx');const home=read('src/components/HomePage.tsx');
 assert.match(home,/<FinalCta c=\{x\.s06\} appEntryUrl=\{site\.appEntryUrl\}\/>/);
 assert.match(cta,/appEntryUrl\s*\n?\s*\?/);
 assert.ok(cta.includes('href="#platform"'));
 assert.ok(!/https?:\/\//.test(cta),'no hard-coded destinations');
});
test('section 05 accordion is an accessible button disclosure, not native details',()=>{
 const a=read('src/components/sections/DetailsExplorer.tsx');
 for(const k of ['aria-expanded','aria-controls','role="region"','aria-labelledby','inert'])assert.ok(a.includes(k),k);
 assert.ok(!a.includes('<details'));
 for(const s of ['bench','trainer','entrance','ceiling'])for(const t of ['dark','light'])assert.ok(existsSync(`public/assets/scenes/${s}-${t}.webp`),`${s}-${t}`);
 assert.match(read('app/globals.css'),/html:not\(\.js\) \.acc-panel,\.acc-item\.open \.acc-panel\{grid-template-rows:1fr\}/);
});

test('unmatched URLs use a routing-level 404, legal routes are static',()=>{
 assert.match(read('next.config.ts'),/globalNotFound: true/);
 assert.ok(existsSync('app/global-not-found.tsx'));
 for(const dir of ['app/(en)/[slug]','app/(sq)/sq/[slug]','app/(it)/it/[slug]'])assert.ok(!existsSync(dir),dir);
 for(const base of ['app/(en)','app/(sq)/sq','app/(it)/it'])for(const s of ['privacy','terms','imprint','disclaimer','cookies'])assert.ok(existsSync(`${base}/${s}/page.tsx`),`${base}/${s}`);
 const nf=read('src/components/NotFoundPage.tsx');assert.ok(nf.includes('NF_LOCALE'));
 assert.match(read('app/global-not-found.tsx'),/robots: \{index: false/);
});
test('hosting configs keep a real 404 and a CSP the export can run under',()=>{
 const ht=read('infra/apache/.htaccess');const ng=read('infra/nginx/aureon-site.conf.example');
 assert.match(ht,/ErrorDocument 404 \/404\.html/);assert.match(ng,/error_page 404 \/404\.html/);
 for(const c of [ht,ng])assert.match(c,/script-src 'self' 'unsafe-inline'/);
});
test('mobile navigation is an accessible modal sheet; legal TOC is a scroll-spy',()=>{
 const m=read('src/components/MobileMenu.tsx');
 for(const k of ['role="dialog"','aria-modal="true"','inert','Escape','createPortal','#footer-nav'])assert.ok(m.includes(k),k);
 const t=read('src/components/LegalToc.tsx');assert.ok(t.includes("'location'"));assert.ok(t.includes('href={`#section-'));
});
