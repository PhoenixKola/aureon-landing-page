// Batch 03 evidence: accordion states per item (desktop), and recorded accordion/keyboard/CTA interactions.
import {chromium} from '@playwright/test';
import {mkdirSync,renameSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:3000';
const out='evidence/batch-03';mkdirSync(`${out}/video`,{recursive:true});mkdirSync(`${out}/interactions`,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const hide='.site-header,.skip,nextjs-portal{visibility:hidden!important}';
for(const theme of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width:1440,height:900},colorScheme:theme,reducedMotion:'reduce'});const page=await ctx.newPage();
  await page.goto(base+'/');await page.waitForSelector('.site-header[data-ready]');await page.addStyleTag({content:hide});
  for(let i=0;i<4;i++){await page.locator('.acc-heading button').nth(i).click();await page.waitForTimeout(500);
    await page.locator('.s05-grid').screenshot({path:`${out}/interactions/accordion-item${i+1}-desktop-${theme}.png`});}
  await page.locator('.s06-cta').hover();await page.waitForTimeout(700);
  await page.locator('.s06-panel').screenshot({path:`${out}/interactions/cta-hover-desktop-${theme}.png`});
  await ctx.close();
}
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},colorScheme:'dark',recordVideo:{dir:`${out}/video`,size:{width,height}}});
  const page=await ctx.newPage();
  await page.addInitScript(()=>{try{sessionStorage.setItem('aureon-hero-played','1')}catch{}});
  await page.goto(base+'/#details');await page.waitForSelector('.site-header[data-ready]');await page.waitForTimeout(1500);
  const b=page.locator('.acc-heading button');
  for(const i of [1,2,3,0]){await b.nth(i).scrollIntoViewIfNeeded();await b.nth(i).click();await page.waitForTimeout(1200);}
  await b.nth(1).focus();await page.keyboard.press('Enter');await page.waitForTimeout(1000);await page.keyboard.press('Tab');await page.waitForTimeout(500);await page.keyboard.press('Space');await page.waitForTimeout(1100);
  for(let k=0;k<6;k++){await b.nth(3).click();await page.waitForTimeout(90);}await page.waitForTimeout(1000);
  await page.goBack().catch(()=>{});await page.goForward().catch(()=>{});await page.waitForTimeout(800);
  await page.locator('#entry').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);
  if(width>800){const box=await page.locator('.s06-cta').boundingBox();await page.mouse.move(box.x+20,box.y+20,{steps:8});await page.mouse.move(box.x+box.width-10,box.y+box.height-10,{steps:20});await page.waitForTimeout(900);await page.mouse.move(10,10,{steps:10});}
  await page.locator('.footer').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);
  await page.locator('.footer-credit a').hover();await page.waitForTimeout(800);
  const v=page.video();await ctx.close();renameSync(await v.path(),`${out}/video/details-cta-footer-${name}-dark.webm`);
}
await browser.close();console.log('done');
