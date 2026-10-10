// Turns the build-only /404-document/ page into out/404.html (and out/404/index.html):
// a self-contained static document with the site CSS and the pre-paint theme/locale scripts, without the
// Next.js runtime (it is served at arbitrary unknown URLs, where client routing must not take over).
import {existsSync,readFileSync,writeFileSync,rmSync,readdirSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const out=resolve('out');
const src=resolve(out,'404-document','index.html');
if(!existsSync(src))throw Error('out/404-document/index.html missing: build-only page not rendered');
let html=readFileSync(src,'utf8');
html=html.replace(/<script\b[^>]*\bsrc=[^>]*><\/script>/g,'');
html=html.replace(/<link\b[^>]*rel="(?:modulepreload|preload)"[^>]*as="script"[^>]*\/?>/g,'');
html=html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g,(m,body)=>body.trim().startsWith('(function(){')&&!body.includes('__next')?m:'');
if(/_next\/static\/chunks\/[^"]+\.js/.test(html))throw Error('runtime script reference left in 404.html');
writeFileSync(resolve(out,'404.html'),html);
mkdirSync(resolve(out,'404'),{recursive:true});writeFileSync(resolve(out,'404','index.html'),html);
rmSync(resolve(out,'404-document'),{recursive:true,force:true});
for(const f of readdirSync(out))if(f.startsWith('__next.')&&f.includes('404-document'))rmSync(resolve(out,f),{force:true});
console.log('[404] designed static 404.html written');
