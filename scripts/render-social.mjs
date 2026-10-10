// Composes public/assets/social-preview.webp (1200×630) from the hero's final frame + the Aureon wordmark.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const still='data:image/webp;base64,'+readFileSync('public/assets/hero/gym-desktop-dark.webp').toString('base64');
const html=`<style>body{margin:0;width:1200px;height:630px;font-family:"Segoe UI",Inter,system-ui,sans-serif;background:#0b100e;color:#f7f3ea;position:relative;overflow:hidden}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:68% 50%}
.s{position:absolute;inset:0;background:linear-gradient(90deg,#0b100e 0,#0b100ef0 30%,#0b100e8c 55%,transparent 78%)}
.c{position:absolute;left:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:26px}
.w{display:flex;align-items:center;gap:16px;font-weight:850;letter-spacing:.17em;font-size:30px}.w svg{width:40px;height:38px;color:#e6b96f}
.w small{display:block;font-size:10px;letter-spacing:.3em;color:#b9c3b7;margin-top:8px}
h1{margin:0;font-size:68px;font-weight:740;letter-spacing:-.065em;line-height:1.02}h1 span{color:#e6b96f;display:block}
p{margin:0;font-size:20px;color:#d5d2c5;max-width:30ch;line-height:1.5}</style>
<img src="${still}"><div class="s"></div><div class="c"><div class="w"><svg viewBox="0 0 24 22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 20.2 12 1.8l9.5 18.4"/></svg><div>AUREON<small>GYM PLATFORM</small></div></div>
<h1>Every side of your gym.<span>In sync.</span></h1><p>Members, front desk and management, connected.</p></div>`;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});
await p.setContent(html);await p.waitForTimeout(300);
const png=await p.screenshot();
const url=await p.evaluate(async src=>{const i=new Image();i.src=src;await i.decode();const c=document.createElement('canvas');c.width=1200;c.height=630;c.getContext('2d').drawImage(i,0,0);return c.toDataURL('image/webp',0.86)},'data:image/png;base64,'+png.toString('base64'));
writeFileSync('public/assets/social-preview.webp',Buffer.from(url.split(',')[1],'base64'));await b.close();console.log('social-preview.webp written');
