import {existsSync,readFileSync} from 'node:fs';
const env=Object.assign({},process.env);
if(existsSync('.env.local'))for(const line of readFileSync('.env.local','utf8').split(/\r?\n/)){
 const m=line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);if(m&&!env[m[1]])env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');
}
const required=['SITE_ORIGIN','APP_ENTRY_URL','OWNER_LEGAL_NAME','OWNER_LEGAL_ADDRESS','OWNER_JURISDICTION','PRIVACY_CONTACT_EMAIL','LEGAL_APPROVER','LEGAL_APPROVAL_DATE'];
const missing=required.filter(x=>!env[x]);
for(const key of ['SITE_ORIGIN','APP_ENTRY_URL'])if(env[key]&&!/^https:\/\/(?!localhost|127\.)(?!.*\.(test|invalid|local))(?!example\.)[^/]+/i.test(env[key]))missing.push(`${key} (must be verified HTTPS)`);
if(env.LEGAL_APPROVED!=='true')missing.push('LEGAL_APPROVED=true (real legal approval required)');
// Draft legal text has open legal placeholders by design. No one-line config can approve it.
const draft=readFileSync('src/content/dictionary.ts','utf8');
if(/\[(REGISTERED|OFFICIAL|RAGIONE|EMRI|VERIFIED|HOSTING|JURISDICTION|PRIVACY CONTACT|GESTORE|REGISTRO|KONTAKT|KOMPANI)/i.test(draft))missing.push('all localized draft legal placeholder text must be replaced and counsel-approved');
if(missing.length){console.error('NOT APPROVED FOR PUBLIC LAUNCH:\n'+[...new Set(missing)].map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('Configuration check passed. Independently confirm destination HTTP, legal approval, browser/hosting before publication.');
