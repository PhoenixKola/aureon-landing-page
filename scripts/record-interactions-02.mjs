// Real-time recording: scroll into sections 02–04, switch theatre roles, step the connected day.
import {chromium} from '@playwright/test';
import {mkdirSync,renameSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const out='evidence/batch-02/video';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:'dark',recordVideo:{dir:out,size:{width,height}}});await ctx.addInitScript(t=>{try{localStorage.setItem('aureon-theme',t)}catch{}},'dark');
  const page=await ctx.newPage();
  await page.addInitScript(()=>{try{sessionStorage.setItem('aureon-hero-played','1')}catch{}});
  await page.goto(base+'/');await page.waitForSelector('.site-header[data-ready]');await page.waitForTimeout(800);
  for(const id of ['#platform','#connected']){await page.locator(id).scrollIntoViewIfNeeded();await page.evaluate(i=>document.querySelector(i).scrollIntoView({behavior:'smooth',block:'start'}),id);await page.waitForTimeout(2600);}
  const tabs=page.locator('.theatre [role="tab"]');
  await page.locator('.theatre').scrollIntoViewIfNeeded();
  for(const i of [1,2,0]){await tabs.nth(i).click();await page.waitForTimeout(1300);await page.locator('.anatomy button').nth(i).click();await page.waitForTimeout(900);}
  await page.evaluate(()=>document.querySelector('#gyms').scrollIntoView({behavior:'smooth',block:'start'}));await page.waitForTimeout(2200);
  if(width>1180){for(let i=0;i<4;i++){await page.getByRole('button',{name:'Next moment'}).click();await page.waitForTimeout(1100);}}
  else{await page.mouse.wheel(0,1800);await page.waitForTimeout(2000);}
  const v=page.video();await ctx.close();renameSync(await v.path(),`${out}/sections-${name}-dark.webm`);
}
await browser.close();console.log('recorded');
