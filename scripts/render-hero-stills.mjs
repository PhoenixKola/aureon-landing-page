// Renders the completed WebGL scene to the fallback stills in public/assets/hero/.
// Requires a running dev or preview server (BASE_URL, default http://localhost:3000).
import {chromium} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const targets=[['desktop',{width:1920,height:1080},1],['mobile',{width:430,height:932},2]];
mkdirSync('public/assets/hero',{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of ['dark','light'])for(const [name,viewport,deviceScaleFactor] of targets){
  const ctx=await browser.newContext({viewport,deviceScaleFactor,colorScheme:theme});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  await page.goto(`${base}/#hero-still`);
  await page.waitForSelector('.hero-media.is-live',{timeout:90000});
  await page.waitForFunction(()=>typeof window.__aureonHeroCapture==='function');
  const url=await page.evaluate(()=>window.__aureonHeroCapture('image/webp',0.84));
  const buf=Buffer.from(url.split(',')[1],'base64');
  const file=`public/assets/hero/gym-${name}-${theme}.webp`;
  writeFileSync(file,buf);
  console.log(file,Math.round(buf.length/1024)+' KB');
  await ctx.close();
}
await browser.close();
