// Batch 04 evidence video: mobile navigation sheet, legal scroll-spy (desktop + phone), and the localized 404.
import {chromium} from '@playwright/test';
import {mkdirSync,renameSync} from 'node:fs';
const base=process.env.BASE_URL||'http://localhost:4310';const out='evidence/batch-04/video';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function rec(name,viewport,fn){const ctx=await browser.newContext({viewport,colorScheme:'dark',recordVideo:{dir:out,size:viewport}});const page=await ctx.newPage();
 await page.addInitScript(()=>{try{sessionStorage.setItem('aureon-hero-played','1')}catch{}});await fn(page);const v=page.video();await ctx.close();renameSync(await v.path(),`${out}/${name}.webm`);}
await rec('mobile-menu-phone',{width:390,height:844},async p=>{await p.goto(base+'/');await p.waitForSelector('.site-header[data-ready]');await p.waitForTimeout(800);
 await p.locator('.menu-button').click();await p.waitForTimeout(1200);for(let i=0;i<5;i++){await p.keyboard.press('Tab');await p.waitForTimeout(250);}
 await p.locator('.menu-sheet .theme-toggle').click();await p.waitForTimeout(900);await p.keyboard.press('Escape');await p.waitForTimeout(900);
 await p.locator('.menu-button').click();await p.waitForTimeout(900);await p.locator('.menu-links a').nth(1).click();await p.waitForTimeout(1800);});
await rec('legal-scrollspy-desktop',{width:1440,height:900},async p=>{await p.goto(base+'/it/privacy/');await p.waitForSelector('.site-header[data-ready]');await p.waitForTimeout(800);
 for(let i=0;i<10;i++){await p.mouse.wheel(0,260);await p.waitForTimeout(350);}await p.locator('.toc-list a[href="#section-2"]').click();await p.waitForTimeout(1200);});
await rec('legal-chapters-phone',{width:390,height:844},async p=>{await p.goto(base+'/sq/cookies/');await p.waitForSelector('.site-header[data-ready]');await p.waitForTimeout(800);
 await p.mouse.wheel(0,700);await p.waitForTimeout(800);await p.locator('.toc-mobile button').click();await p.waitForTimeout(900);await p.locator('.toc-mobile-list a').nth(3).click();await p.waitForTimeout(1500);});
await rec('not-found-404',{width:1440,height:900},async p=>{await p.goto(base+'/sq/nope/');await p.waitForTimeout(2200);await p.locator('.nf-copy:visible .nf-cta').hover();await p.waitForTimeout(700);
 await p.locator('.nf-copy:visible .nf-cta').click();await p.waitForTimeout(1500);await p.goBack();await p.waitForTimeout(1500);});
await browser.close();console.log('recorded');
