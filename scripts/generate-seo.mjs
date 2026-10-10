import {writeFileSync,existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const env={...process.env};
// `npm run build` starts this before Next.js loads .env.local.
if(existsSync('.env.local'))for(const line of readFileSync('.env.local','utf8').split(/\r?\n/)){
 const match=line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
 if(match && !env[match[1]])env[match[1]]=match[2].replace(/^['"]|['"]$/g,'');
}
const origin=(env.SITE_ORIGIN||'').trim().replace(/\/$/,'');
const safe=/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(origin) &&
 !/(?:^|\.)example\.|\.(test|invalid|local)$|localhost|127\.0\.0\.1/i.test(origin);
const keys=['APP_ENTRY_URL','OWNER_LEGAL_NAME','OWNER_LEGAL_ADDRESS','OWNER_JURISDICTION','PRIVACY_CONTACT_EMAIL','LEGAL_APPROVER','LEGAL_APPROVAL_DATE'];
const draft=readFileSync(resolve('src/content/dictionary.ts'),'utf8');
const containsPlaceholders=/\[(REGISTERED|OFFICIAL|RAGIONE|EMRI|VERIFIED|HOSTING|JURISDICTION|PRIVACY CONTACT|GESTORE|REGISTRO|KONTAKT|KOMPANI)/i.test(draft);
const approved=env.LEGAL_APPROVED==='true' && keys.every(k=>Boolean(env[k]?.trim())) && !containsPlaceholders;
const allowIndex=safe && approved;
const locales=['','sq/','it/'];
const legal=['privacy','terms','imprint','disclaimer','cookies'];
const routes=['',...legal].flatMap(s=>locales.map(l=>`/${l}${s?s+'/':''}`));
const publicDir=resolve('public');
writeFileSync(resolve(publicDir,'robots.txt'),`User-agent: *\n${allowIndex?'Allow: /':'Disallow: /'}\n${allowIndex?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
const content=allowIndex?`<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${routes.map(p=>{
 const last=p.split('/').filter(Boolean).at(-1);
 const slug=legal.includes(last)?last+'/':'';
 return `  <url><loc>${esc(origin+p)}</loc>${['en','sq','it'].map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${esc(origin+'/'+(l==='en'?'':l+'/')+slug)}"/>`).join('')}</url>`;
}).join('\n')}\n</urlset>\n`:'<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';
writeFileSync(resolve(publicDir,'sitemap.xml'),content);
console.log(`[seo] ${allowIndex?'approved-index mode':'private preview (disallow indexing)'}`);
