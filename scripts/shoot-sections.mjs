// Full-section screenshots: node scripts/shoot-sections.mjs <outDir> [selectors] [sizes] [themes] [path]
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const [out='evidence/sections',selArg='#platform,#connected,#gyms',sizeArg='desktop,tablet,phone,narrow',themeArg='dark,light',path='/']=process.argv.slice(2);
const all={wide:[1920,1080],desktop:[1440,900],tablet:[768,1024],phone:[390,844],narrow:[320,667]};
const base=process.env.BASE_URL||'http://localhost:3000';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of themeArg.split(','))for(const size of sizeArg.split(',')){
  const [width,height]=all[size];
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  await page.goto(base+path);await page.waitForSelector('.site-header[data-ready]',{timeout:60000});
  await page.addStyleTag({content:'.site-header,.skip,nextjs-portal{visibility:hidden!important}'});
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
  if(m.sw>m.iw)console.log('OVERFLOW',size,theme,m);
  for(const sel of selArg.split(',')){
    const el=page.locator(sel);await el.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
    await el.screenshot({path:`${out}/${sel.replace(/[#.]/g,'')}-${size}-${theme}${path.length>1?'-'+path.replace(/\//g,''):''}.png`});
  }
  await ctx.close();
}
await browser.close();console.log('done');
