import {test,expect,type Page} from '@playwright/test';

const ready=(page:Page)=>page.locator('.site-header[data-ready]').waitFor({state:'attached',timeout:30000});
const settled=(page:Page)=>page.waitForFunction(()=>document.documentElement.classList.contains('hero-settled'),null,{timeout:20000});

test('first visit: empty stage, assembly, header arrives last',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#hero-title')).toBeVisible();
 // Rule: until the assembly settles, the header is hidden (sampled through the opening; timing-independent).
 for(let i=0;i<6;i++){
  const st=await page.evaluate(()=>({settled:document.documentElement.classList.contains('hero-settled'),vis:getComputedStyle(document.querySelector('.home-header')!).visibility}));
  if(!st.settled)expect(st.vis).toBe('hidden');
  await page.waitForTimeout(400);
 }
 // No completed still is displayed on the motion path.
 for(const still of await page.locator('.hero-still').all())expect(await still.evaluate(e=>getComputedStyle(e).display)).toBe('none');
 await expect(page.locator('.hero-media')).toHaveClass(/is-live/,{timeout:20000});
 await settled(page);
 await expect(page.locator('.home-header')).toBeVisible();
 await expect(page.getByText(/replay/i)).toHaveCount(0);
});
test('hero fills the first viewport and nothing overflows horizontally',async({page})=>{
 for(const [width,height] of [[320,667],[390,844],[768,1024],[1366,768],[1440,900]]){
  await page.setViewportSize({width,height});await page.goto('/');
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,hero:document.querySelector('.hero')!.getBoundingClientRect().height,next:document.querySelector('#platform')!.getBoundingClientRect().top}));
  expect(m.sw).toBeLessThanOrEqual(m.iw);
  expect(Math.round(m.hero)).toBe(height);
  expect(m.next).toBeGreaterThanOrEqual(height-1);
 }
});
test('reduced motion: completed still and header immediately',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('html')).toHaveClass(/hero-static/);
 await expect(page.locator('.home-header')).toBeVisible();
 const shown=await page.locator('.hero-still').evaluateAll(els=>els.filter(e=>getComputedStyle(e).display!=='none').length);
 expect(shown).toBe(1);
});
test('locale switch preserves route, including legal pages',async({page})=>{
 await page.goto('/privacy/');await ready(page);
 const nav=page.locator('.header-actions > .lang-switch');
 await expect(nav.locator('a[aria-current="page"]')).toHaveText('EN');
 await expect(nav.locator('a[hreflang="sq"]')).toHaveAttribute('href','/sq/privacy/');
 await expect(nav.locator('a[hreflang="it"]')).toHaveAttribute('href','/it/privacy/');
 await nav.locator('a[hreflang="it"]').click();
 await expect(page).toHaveURL(/\/it\/privacy\/$/);
 await expect(page.locator('html')).toHaveAttribute('lang','it');
 for(const lang of ['','sq/','it/']){
  await page.goto('/'+lang+'privacy/');
  await expect(page.locator('h1')).toHaveCount(1);
 }
});
test('theme control: light/dark only, dark by default even on a light OS, persists the choice',async({page})=>{
 await page.emulateMedia({colorScheme:'light'});
 await page.goto('/privacy/');await ready(page);
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 const toggle=page.locator('.header-actions .theme-toggle');
 await expect(toggle).toHaveAttribute('aria-label',/Dark/);
 await toggle.click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(toggle).toHaveAttribute('aria-label',/Light/);
 await toggle.click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await toggle.click();
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.locator('.ti-system')).toHaveCount(0);
});
test('phone header shows only the logo and the menu; footer has no back-to-top',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await ready(page);
 await expect(page.locator('.header-actions > .lang-switch')).toBeHidden();
 await expect(page.locator('.header-actions > .theme-toggle')).toBeHidden();
 await expect(page.locator('.menu-button')).toBeVisible();
 await expect(page.locator('.footer-top-link')).toHaveCount(0);
});
test('hero primary button keeps readable contrast on hover in both themes',async({page})=>{
 for(const scheme of ['light','dark'] as const){
  await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});
  await page.goto('/');await page.evaluate(t=>localStorage.setItem('aureon-theme',t),scheme);await page.reload();await ready(page);
  const btn=page.locator('.hero .button-light');await btn.hover();await page.waitForTimeout(400);
  const [fg,bg]=await btn.evaluate(e=>{const c=getComputedStyle(e);return [c.color,c.backgroundColor]});
  const lum=(c:string)=>{const [r,g,b2]=c.match(/[\d.]+/g)!.slice(0,3).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b2};
  const [a2,b3]=[lum(fg),lum(bg)].sort((x,y)=>y-x);
  expect((a2+.05)/(b3+.05)).toBeGreaterThan(4.5);
 }
});
test('mobile menu: modal sheet, focus trap, scroll lock, Escape returns focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await ready(page);
 const button=page.locator('.menu-button');
 await button.click();
 const sheet=page.getByRole('dialog');
 await expect(sheet).toBeVisible();
 await expect(button).toHaveAttribute('aria-expanded','true');
 await expect(sheet).toHaveAttribute('aria-modal','true');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).toBe('hidden');
 expect(await page.locator('#main').evaluate(e=>e.closest('[inert]')!==null)).toBe(true);
 for(let i=0;i<14;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('[role=dialog]'))).toBe(true);}
 await page.keyboard.press('Escape');
 await expect(sheet).toHaveCount(0);
 await expect(button).toBeFocused();
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
 await button.click();
 await sheet.getByRole('link',{name:/How it connects/}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page).toHaveURL(/#connected$/);
});
test('without JavaScript the hero shows content and a completed still',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 await page.goto('/');
 await expect(page.locator('#hero-title')).toBeVisible();
 await expect(page.locator('.home-header')).toBeVisible();
 const shown=await page.locator('.hero-still').evaluateAll(els=>els.filter(e=>getComputedStyle(e).display!=='none').length);
 expect(shown).toBe(1);
 await ctx.close();
});

test('product theatre: three different scenes, keyboard tabs, anatomy focus',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await ready(page);
 const tabs=page.locator('.theatre [role="tab"]');
 await expect(tabs).toHaveCount(3);
 await expect(page.locator('.device')).toHaveClass(/device-phone/);
 await expect(page.locator('.ui-member')).toBeVisible();
 await tabs.nth(0).focus();await page.keyboard.press('ArrowDown');
 await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
 await expect(tabs.nth(1)).toBeFocused();
 await expect(page.locator('.device')).toHaveClass(/device-desktop/);
 await expect(page.locator('.ui-desk')).toBeVisible();
 await page.keyboard.press('End');
 await expect(page.locator('.ui-manager')).toBeVisible();
 await page.locator('.anatomy button').nth(1).click();
 await expect(page.locator('.device')).toHaveAttribute('data-focus','2');
 await expect(page.locator('#role-panel')).toHaveAttribute('aria-labelledby','role-tab-manager');
});
test('connected day: stepping moves the active moment',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await ready(page);
 const steps=page.locator('.day-step');
 await expect(steps).toHaveCount(5);
 await expect(steps.nth(0)).toHaveAttribute('aria-current','step');
 await page.getByRole('button',{name:'Next moment'}).click();
 await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
 await steps.nth(1).focus();await page.keyboard.press('End');
 await expect(steps.nth(4)).toHaveAttribute('aria-current','step');
 await expect(page.locator('.day-cell.on')).toHaveCount(3);
});
test('middle sections at 320px: no overflow, role controls reachable, cards visible',async({page})=>{
 await page.setViewportSize({width:320,height:667});await page.emulateMedia({reducedMotion:'reduce'});
 for(const path of ['/','/sq/','/it/']){
  await page.goto(path);await ready(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for(const tab of await page.locator('.theatre [role="tab"]').all()){
   const box=(await tab.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator('.day-matrix')).toBeHidden();
  await expect(page.locator('.day-card')).toHaveCount(5);
  await expect(page.locator('.day-card').nth(4)).toBeVisible();
 }
});
test('without JavaScript the middle sections are readable',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});const page=await ctx.newPage();
 await page.goto('/it/');
 for(const id of ['#platform','#connected','#gyms']){const op=await page.locator(id).evaluate(e=>getComputedStyle(e).opacity);expect(Number(op)).toBe(1);}
 await expect(page.locator('.s02-station')).toHaveCount(4);
 await expect(page.locator('.ui-member')).toBeVisible();
 await expect(page.locator('.day-cell').first()).toBeVisible();
 await ctx.close();
});

test('details accordion: one open item, visual follows, keyboard and rapid clicks stay consistent',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await ready(page);
 const buttons=page.locator('.acc-heading button');
 await expect(buttons).toHaveCount(4);
 await expect(buttons.nth(0)).toHaveAttribute('aria-expanded','true');
 await buttons.nth(2).click();
 await expect(buttons.nth(2)).toHaveAttribute('aria-expanded','true');
 await expect(buttons.nth(0)).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#acc-panel-desk')).toBeVisible();
 await expect(page.locator('.s05-shot').nth(2)).toHaveClass(/on/);
 await expect(page.locator('#acc-panel-member')).toHaveAttribute('inert','');
 await buttons.nth(3).focus();await page.keyboard.press('Enter');
 await expect(buttons.nth(3)).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Space');
 await expect(buttons.nth(3)).toHaveAttribute('aria-expanded','false');
 const y=await page.evaluate(()=>scrollY);
 for(let i=0;i<7;i++)await buttons.nth(1).click({delay:10});
 await expect(buttons.nth(1)).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('.acc-item.open')).toHaveCount(1);
 expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
});
test('closing section and footer: honest CTA, Nivello credit, no overflow',async({page})=>{
 for(const [path,width] of [['/',1440],['/it/',390],['/sq/',320]] as const){
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path);await ready(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await expect(page.locator('.s06-cta')).toHaveAttribute('href','#platform');
  await expect(page.locator('#entry a[href^="http"]')).toHaveCount(0);
  const credit=page.locator('.footer-credit');
  await expect(credit).toHaveText('Realizzato con ⚡️ da Nivello');
  await expect(credit.locator('[aria-hidden="true"]')).toHaveText('⚡️');
  const link=credit.getByRole('link',{name:'Nivello'});
  await expect(link).toHaveAttribute('href','https://www.nivello.it');
  await expect(link).toHaveAttribute('rel','noopener noreferrer');
  await expect(link).toHaveAttribute('target','_blank');
 }
});
test('footer language links preserve the legal route',async({page})=>{
 await page.goto('/sq/terms/');
 await expect(page.locator('.footer a[hreflang="it"]')).toHaveAttribute('href','/it/terms/');
 await expect(page.locator('.footer a[hreflang="sq"]')).toHaveAttribute('aria-current','page');
});
test('without JavaScript every capability panel is readable',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 await page.goto('/');
 for(const id of ['member','schedule','desk','radio'])await expect(page.locator(`#acc-panel-${id} p`)).toBeVisible();
 await ctx.close();
});

test('unknown URLs return a designed, localized 404',async({page})=>{
 for(const [path,lang,title] of [['/sa/','en','This part of the club'],['/not-a-real-page/','en','This part of the club'],['/sq/nope/','sq','Kjo pjesë e palestrës'],['/it/nope/','it','Questa parte del club']] as const){
  const res=await page.goto(path);
  expect(res?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang',lang);
  const h1=page.locator('h1:visible');
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText(title);
  const robots=await page.locator('meta[name="robots"]').evaluateAll(m=>m.map(x=>x.getAttribute('content')));
  expect(robots.length).toBeGreaterThan(0);for(const r of robots)expect(r).toMatch(/noindex/);
 }
 await page.goto('/sa/');
 await page.locator('.nf-copy:visible .nf-cta').click();
 await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
 await expect(page.locator('#hero-title')).toBeVisible();
 await page.goBack();
 await expect(page.locator('h1:visible')).toContainText('This part of the club');
});
test('legal TOC tracks the chapter in view (desktop)',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/it/privacy/#section-4');await ready(page);
 const active=page.locator('.toc-list a[aria-current="location"]');
 await expect(active).toHaveCount(1);
 await expect(active).toHaveAttribute('href','#section-4');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await expect(active).toHaveAttribute('href','#section-6');
 await page.evaluate(()=>scrollTo(0,0));
 await expect(active).toHaveAttribute('href','#section-1');
 await page.locator('.toc-list a[href="#section-3"]').click();
 await expect(active).toHaveAttribute('href','#section-3');
 expect(await page.evaluate(()=>getComputedStyle(document.querySelector('.legal-toc')!).position)).toBe('sticky');
});
test('legal chapter bar on phones jumps between chapters without overflow',async({page})=>{
 await page.setViewportSize({width:320,height:667});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/sq/cookies/');await ready(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 const bar=page.locator('.toc-mobile button');
 await expect(bar).toBeVisible();
 await bar.click();
 await expect(bar).toHaveAttribute('aria-expanded','true');
 await page.locator('.toc-mobile-list a[href="#section-3"]').click();
 await expect(bar).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.toc-mobile-current b')).toHaveText('03/04');
 const top=await page.locator('#section-3').evaluate(e=>e.getBoundingClientRect().top);
 expect(top).toBeGreaterThan(100);
});
test('without JavaScript: mobile menu falls back to footer navigation, legal TOC is a plain list',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await ctx.newPage();
 await page.goto('/');
 const fallback=page.locator('a.menu-fallback');
 await expect(fallback).toBeVisible();
 await expect(fallback).toHaveAttribute('href','#footer-nav');
 await expect(page.locator('#footer-nav a').first()).toBeAttached();
 await page.goto('/privacy/');
 await expect(page.locator('.toc-desktop .toc-list a')).toHaveCount(6);
 await expect(page.locator('.toc-desktop')).toBeVisible();
 await ctx.close();
});
test('hero media failure: blocked 3D chunk falls back to the completed still, header released',async({page})=>{
 await page.route(/gym-scene/,route=>route.abort());
 await page.route(/\/_next\/static\/chunks\/.*\.js$/,async route=>{
  const res=await route.fetch();const body=await res.text();
  if(body.includes('WebGLRenderer'))return route.abort();
  return route.fulfill({response:res,body});
 });
 await page.goto('/');
 await expect(page.locator('.hero-media')).toHaveClass(/is-fallback/,{timeout:20000});
 const shown=await page.locator('.hero-still').evaluateAll(els=>els.filter(e=>getComputedStyle(e).display!=='none').length);
 expect(shown).toBe(1);
 await expect(page.locator('.home-header')).toBeVisible();
 await expect(page.locator('#hero-title')).toBeVisible();
});
