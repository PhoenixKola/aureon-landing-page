// Records the true first-load opening + reduced-motion fallback against BASE_URL.
import {chromium} from '@playwright/test';
import {mkdirSync,renameSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:4310';
const out='evidence/batch-01/video';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,width,height] of [['desktop',1280,800],['phone',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:'dark',recordVideo:{dir:out,size:{width,height}}});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},'dark');
  const page=await ctx.newPage();
  await page.goto(base+'/');await page.waitForTimeout(8000);
  const v=page.video();await ctx.close();renameSync(await v.path(),`${out}/opening-${name}-dark.webm`);
}
for(const theme of ['dark','light'])for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();await page.goto(base+'/');await page.waitForTimeout(300);
  await page.screenshot({path:`evidence/batch-01/reduced-motion-${name}-${theme}-300ms.png`});
  await ctx.close();
}
await browser.close();
