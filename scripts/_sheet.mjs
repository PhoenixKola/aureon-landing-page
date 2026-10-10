import {chromium} from '@playwright/test';import {readFileSync} from 'node:fs';
const files=process.argv.slice(3);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:500}});
await p.setContent(`<body style="margin:0;display:flex;gap:6px;background:#111">${files.map(f=>`<img style="width:${100/files.length}%" src="data:image/webp;base64,${readFileSync(f).toString('base64')}">`).join('')}</body>`);
await p.screenshot({path:process.argv[2],fullPage:true});await b.close();
