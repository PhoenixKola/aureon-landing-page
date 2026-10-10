// node scripts/contact-sheet.mjs <framesDir> <out.png> <prefix> [cols]
import {chromium} from '@playwright/test';
import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const [dir,out,prefix,cols='4']=process.argv.slice(2);
const files=readdirSync(dir).filter(f=>f.startsWith(prefix)&&f.endsWith('.png')).sort();
const cells=files.map(f=>`<figure><img src="data:image/png;base64,${readFileSync(resolve(dir,f)).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('');
const html=`<style>body{margin:0;background:#111;color:#ddd;font:12px system-ui;display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;padding:10px}figure{margin:0}img{width:100%;display:block}figcaption{padding:4px 0}</style>${cells}`;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:Number(cols)*(prefix.startsWith('desktop')?480:240),height:600}});
await p.setContent(html);await p.screenshot({path:out,fullPage:true});await b.close();console.log(out,files.length);
