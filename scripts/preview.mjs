import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
const port=Number(process.env.PORT||3000);
// PREVIEW_CSP=1 applies the same Content-Security-Policy as infra/nginx and infra/apache, to prove the export runs under it.
const csp=process.env.PREVIEW_CSP?{'Content-Security-Policy':"default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}:{};
http.createServer(async(req,res)=>{
 try{
  const uri=decodeURIComponent(new URL(req.url||'/',`http://localhost:${port}`).pathname);
  if(uri.includes('\0')||uri.split('/').includes('..')){res.writeHead(400).end('Bad request');return}
  const path=resolve(root,'.'+uri,(uri.endsWith('/')?'index.html':''));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end('Forbidden');return}
  const info=await stat(path);
  if(!info.isFile())throw Error('Not a file');
  const bytes=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',...csp}).end(bytes);
 }catch{
  const bytes=await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('404'));
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8',...csp}).end(bytes);
 }
}).listen(port,()=>console.log(`Aureon export: http://localhost:${port}`));
