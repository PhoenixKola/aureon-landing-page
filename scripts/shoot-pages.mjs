// Full-page / viewport screenshots of arbitrary routes: node scripts/shoot-pages.mjs <outDir> <paths,comma> [sizes] [themes] [full=1]
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const [out='evidence/pages',pathsArg='/',sizeArg='desktop,phone,narrow',themeArg='dark,light',full='1']=process.argv.slice(2);
const all={wide:[1920,1080],desktop:[1440,900],laptop:[1024,768],tablet:[768,1024],phone:[390,844],narrow:[320,667]};
const base=process.env.BASE_URL||'http://localhost:3000';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of themeArg.split(','))for(const size of sizeArg.split(',')){
  const [width,height]=all[size];
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});
  const page=await ctx.newPage();
  for(const p of pathsArg.split(',')){
    const res=await page.goto(base+p);await page.waitForTimeout(1500);
    if(full==='1')await page.addStyleTag({content:'.site-header{position:absolute!important}nextjs-portal{display:none!important}'});
    const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
    const name=(p.replace(/\//g,'_').replace(/^_|_$/g,'')||'home').replace(/[#?=]/g,'-');
    console.log(size,theme,p,'status',res?.status(),m.sw>m.iw?'OVERFLOW '+m.sw:'ok');
    await page.screenshot({path:`${out}/${name}-${size}-${theme}.png`,fullPage:full==='1'});
  }
  await ctx.close();
}
await browser.close();
