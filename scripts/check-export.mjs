import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve('out');
const routes=['','privacy','terms','imprint','disclaimer','cookies'];
const langs=['','sq/','it/'];
let count=0;
for(const lang of langs){for(const route of routes){
 const path=resolve(root,lang,route,'index.html');
 if(!existsSync(path))throw Error(`Static route missing: ${lang}${route}/`);
 const html=readFileSync(path,'utf8');
 if(!html.includes('<main')||!html.includes('AUREON'))throw Error(`Static route incomplete: ${lang}${route}/`);
 const code=lang==='sq/'?'sq':lang==='it/'?'it':'en';
 if(!html.includes(`lang="${code}"`))throw Error(`Incorrect lang tag: ${lang}${route}/`);
 count++;
}}
if(!existsSync(resolve(root,'404.html')))throw Error('404.html missing');
if(!existsSync(resolve(root,'robots.txt')))throw Error('robots.txt missing');
console.log(`Verified ${count} static localized pages, 404, robots.txt`);
// Designed static 404: all three languages, noindex, no client runtime, build-only helper route not exported.
const nf=readFileSync(resolve(root,'404.html'),'utf8');
for(const l of ['en','sq','it'])if(!nf.includes(`data-nf-locale="${l}"`))throw Error(`404.html missing ${l} variant`);
if(!/<meta name="robots" content="noindex/.test(nf))throw Error('404.html must be noindex');
if(/_next\/static\/chunks\/[^"]+\.js/.test(nf))throw Error('404.html must not load the Next.js runtime');
if(existsSync(resolve(root,'404-document')))throw Error('build-only 404-document route leaked into the export');
// Internal links: every root-relative href in every exported page must resolve to an exported file.
import {readdirSync,statSync} from 'node:fs';
const pages=[];(function walk(d){for(const f of readdirSync(d)){const p=resolve(d,f);if(statSync(p).isDirectory()){if(f!=='_next')walk(p)}else if(f.endsWith('.html'))pages.push(p)}})(root);
let links=0;
for(const p of pages){const html=readFileSync(p,'utf8');
 for(const [,href] of html.matchAll(/href="(\/[^"#?]*)(?:#[^"]*)?"/g)){
  if(href.startsWith('/_next/'))continue;links++;
  const target=resolve(root,'.'+href,href.endsWith('/')?'index.html':'');
  if(!existsSync(target))throw Error(`Broken internal link ${href} in ${p.slice(root.length)}`);
 }}
console.log(`Verified designed 404.html and ${links} internal links across ${pages.length} pages`);
