// Converts every PNG under a directory to WebP (q 0.82) to keep evidence small: node scripts/evidence-webp.mjs <dir>
import {chromium} from '@playwright/test';
import {readdirSync,readFileSync,writeFileSync,unlinkSync,statSync} from 'node:fs';
import {join} from 'node:path';
const root=process.argv[2]||'evidence';
const files=[];(function w(d){for(const f of readdirSync(d)){const p=join(d,f);statSync(p).isDirectory()?w(p):p.endsWith('.png')&&files.push(p)}})(root);
const b=await chromium.launch();const page=await b.newPage();
for(const f of files){
  const data='data:image/png;base64,'+readFileSync(f).toString('base64');
  const url=await page.evaluate(async src=>{const i=new Image();i.src=src;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);return c.toDataURL('image/webp',0.82)},data);
  writeFileSync(f.replace(/\.png$/,'.webp'),Buffer.from(url.split(',')[1],'base64'));unlinkSync(f);
}
await b.close();console.log(`converted ${files.length}`);
