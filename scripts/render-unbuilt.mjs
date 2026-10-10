// Renders the 404 backdrop: the hero gym frozen mid-assembly (#hero-t=1250) into public/assets/scenes/unbuilt-*.webp.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width:1920,height:1080},colorScheme:theme});
  const page=await ctx.newPage();
  await page.goto(`${base}/#hero-t=1250`);
  await page.waitForFunction(()=>typeof window.__aureonHeroCapture==='function',null,{timeout:90000});
  await page.waitForTimeout(300);
  const url=await page.evaluate(()=>window.__aureonHeroCapture('image/webp',0.84));
  const buf=Buffer.from(url.split(',')[1],'base64');writeFileSync(`public/assets/scenes/unbuilt-${theme}.webp`,buf);
  console.log(theme,Math.round(buf.length/1024)+' KB');await ctx.close();
}
await browser.close();
