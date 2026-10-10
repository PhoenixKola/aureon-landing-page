// Batch 02 interaction evidence: theatre roles + anatomy focus, connected-day steps, and a recorded walkthrough.
import {chromium} from '@playwright/test';
import {mkdirSync,renameSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const [out='evidence/batch-02/interactions',sizeArg='desktop,phone',themeArg='dark,light',lang='']=process.argv.slice(2);
const all={wide:[1920,1080],desktop:[1440,900],tablet:[768,1024],phone:[390,844],narrow:[320,667]};
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const hide='.site-header,.skip,nextjs-portal{visibility:hidden!important}';
for(const theme of themeArg.split(','))for(const size of sizeArg.split(',')){
  const [width,height]=all[size];
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},theme);
  const page=await ctx.newPage();
  await page.goto(`${base}/${lang}`);await page.waitForSelector('.site-header[data-ready]',{timeout:60000});
  await page.addStyleTag({content:hide});
  const tabs=page.locator('.theatre [role="tab"]');
  for(let i=0;i<3;i++){
    await tabs.nth(i).click();await page.waitForTimeout(250);
    if(i===1)await page.locator('.anatomy button').nth(0).click();
    await page.waitForTimeout(350);
    await page.locator('.theatre').screenshot({path:`${out}/theatre-${['member','desk','manager'][i]}-${size}-${theme}${lang?'-'+lang.replace('/',''):''}.png`});
  }
  if(width>=1181){
    for(const i of [2,3]){await page.locator('.day-step').nth(i).click();await page.waitForTimeout(600);
      await page.locator('.day-matrix').screenshot({path:`${out}/day-step${i+1}-${size}-${theme}${lang?'-'+lang.replace('/',''):''}.png`});}
  }
  await ctx.close();
}
await browser.close();console.log('done');
