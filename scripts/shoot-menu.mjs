// Mobile navigation sheet evidence: closed/open states.
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';const out=process.argv[2]||'evidence/batch-04/menu';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const theme of ['dark','light'])for(const [name,w,h] of [['phone',390,844],['narrow',320,667]])for(const p of ['/','/it/privacy/']){
  const ctx=await browser.newContext({viewport:{width:w,height:h},colorScheme:theme,reducedMotion:'reduce',hasTouch:true,isMobile:true});const page=await ctx.newPage();
  await page.goto(base+p);await page.waitForSelector('.site-header[data-ready]');await page.waitForTimeout(400);
  await page.locator('.menu-button').first().click();await page.waitForTimeout(500);
  const tag=p==='/'?'home':'it-privacy';
  await page.screenshot({path:`${out}/menu-${tag}-${name}-${theme}.png`});
  await ctx.close();
}
await browser.close();console.log('done');
