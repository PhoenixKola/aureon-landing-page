// Renders editorial close-ups of the hero gym for content sections into public/assets/scenes/.
// Requires a running dev or preview server (BASE_URL, default http://localhost:3000).
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const only=process.argv[2]?.split(',');
const shots=['plates','bench','trainer','entrance','ceiling'].filter(s=>!only||only.includes(s)).map(s=>[s,{width:800,height:1000}]);
mkdirSync('public/assets/scenes',{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of ['dark','light'])for(const [shot,viewport] of shots){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1.5,colorScheme:theme});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  await page.goto(`${base}/#hero-shot=${shot}`);
  await page.waitForFunction(()=>typeof window.__aureonHeroCapture==='function',null,{timeout:90000});
  await page.waitForTimeout(300);
  const url=await page.evaluate(()=>window.__aureonHeroCapture('image/webp',0.84));
  const buf=Buffer.from(url.split(',')[1],'base64');const file=`public/assets/scenes/${shot}-${theme}.webp`;
  writeFileSync(file,buf);console.log(file,Math.round(buf.length/1024)+' KB');
  await ctx.close();
}
await browser.close();
