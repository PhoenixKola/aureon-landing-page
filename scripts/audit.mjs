import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
let bad=0;
function walk(path){for(const item of readdirSync(path)){
 const f=join(path,item), st=statSync(f);if(st.isDirectory()){walk(f);continue}
 if(!/\.(tsx|ts|css)$/.test(f))continue;
 const text=readFileSync(f,'utf8');
 if(/radial-gradient|repeating-linear-gradient|NEXT_PUBLIC_.*SECRET/.test(text)){console.error('Forbidden styling or exposure: '+f);bad++}
 if(/transition:\s*all\b/.test(text)){console.error('Blanket "transition: all" in '+f);bad++}
}}
for(const path of ['src','app'])walk(path);
for(const f of ['src/components/hero/Hero.tsx','src/components/hero/HeroScene.tsx','src/components/hero/gym-scene.ts','src/components/SiteHeader.tsx','src/components/RevealOnScroll.tsx'])if(!existsSync(f)){console.error('Missing '+f);bad++}
const hero=readFileSync('src/components/hero/Hero.tsx','utf8');
if(/stage-poster|backgroundImage|gym-interior|gym-stage\.webp/.test(hero)){console.error('Hero contains forbidden composite background');bad++}
if(/replay/i.test(hero)){console.error('Replay control must not return');bad++}
if(bad)process.exit(1);
console.log('Source layout/style/security audit passed');
