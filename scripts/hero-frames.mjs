// Deterministic hero frames: node scripts/hero-frames.mjs <outDir> <ms,ms,...> [sizes] [themes]
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const [out='evidence/frames',times='0,600,1200,2400,4800',sizesArg='desktop,phone',themesArg='dark,light']=process.argv.slice(2);
const all={desktop:[1440,900],laptop:[1366,768],tablet:[768,1024],phone:[390,844],narrow:[320,667]};
const base=process.env.BASE_URL||'http://localhost:3000';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of themesArg.split(','))for(const size of sizesArg.split(',')){
  const [width,height]=all[size];
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  for(const t of times.split(',')){
    await page.goto(`${base}/#hero-t=${t}`);await page.reload();
    await page.waitForSelector('.hero-media.is-live',{timeout:60000});
    await page.evaluate(t=>{if(t>=4700)document.documentElement.classList.add('hero-settled');else document.documentElement.classList.remove('hero-settled');document.querySelectorAll('[data-hero-beat]').forEach(e=>{e.style.animation='none';const beat=Number(e.getAttribute('data-hero-beat'));e.style.opacity=t>=[0,3000,3110,3198,3286,3440,3572,3770][beat]+400?'1':'0'})},Number(t));
    await page.waitForTimeout(400);
    await page.screenshot({path:`${out}/${size}-${theme}-t${String(t).padStart(4,'0')}.png`});
  }
  await ctx.close();
}
await browser.close();
