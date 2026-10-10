// Usage: node scripts/shoot.mjs <outDir> [path] [waitMs...]
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const [out='evidence/shots',path='/',...waits]=process.argv.slice(2);
const times=waits.length?waits.map(Number):[5200];
const base=process.env.BASE_URL||'http://localhost:3000';
const sizes=[['desktop',1440,900],['laptop',1366,768],['phone',390,844],['narrow',320,667]];
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const onlyT=process.env.THEMES?.split(','),onlyS=process.env.SIZES?.split(',');
for(const theme of ['dark','light'])for(const [name,width,height] of sizes){
  if((onlyT&&!onlyT.includes(theme))||(onlyS&&!onlyS.includes(name)))continue;
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,deviceScaleFactor:1});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  page.on('pageerror',e=>console.error('pageerror',e.message));
  await page.goto(base+path,{waitUntil:'domcontentloaded'});
  let last=0;
  for(const t of times){await page.waitForTimeout(t-last);last=t;
    await page.screenshot({path:`${out}/${name}-${theme}-${t}ms.png`});}
  const m=await page.evaluate(()=>({hero:document.querySelector('.hero')?.getBoundingClientRect().height,cls:document.documentElement.className,sw:document.documentElement.scrollWidth,iw:innerWidth,next:document.querySelector('#platform')?.getBoundingClientRect().top,ih:innerHeight}));
  console.log(name,theme,JSON.stringify(m));
  await ctx.close();
}
await browser.close();
