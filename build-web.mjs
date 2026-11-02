/* One source for web PWA, Android APK, App Hub module, OTA bundle. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const web=path.join(root,'web');
const songsSrc=path.join(root,'songs');
const songsDst=path.join(web,'songs');
fs.mkdirSync(songsDst,{recursive:true});
const allowed=/\.(mxl|musicxml|xml)$/i;
function discover(dir,sub=''){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    if(e.name.startsWith('.')||e.name.startsWith('_')) return [];
    const rel=path.posix.join(sub,e.name);
    if(e.isDirectory())return discover(path.join(dir,e.name),rel);
    return e.isFile()&&allowed.test(e.name)?[rel]:[];
  });
}
const files=discover(songsSrc).sort((a,b)=>a.localeCompare(b,'vi'));
const prev=fs.existsSync(path.join(songsDst,'index.json'))?JSON.parse(fs.readFileSync(path.join(songsDst,'index.json'))):{songs:[]};
const current=new Set(files);
for(const old of prev.songs||[]){
  const oldRel=old.path.replace(/^songs\//,'');
  if(!current.has(oldRel)&&fs.existsSync(path.join(songsDst,oldRel)))fs.rmSync(path.join(songsDst,oldRel));
}
for(const rel of files){
  fs.mkdirSync(path.dirname(path.join(songsDst,rel)),{recursive:true});
  fs.copyFileSync(path.join(songsSrc,rel),path.join(songsDst,rel));
}
const index={schema:1,songs:files.map(rel=>({path:'songs/'+rel,title:path.basename(rel,path.extname(rel)).replace(/-/g,' ')}))};
fs.writeFileSync(path.join(songsDst,'index.json'),JSON.stringify(index,null,2)+'\n');
// UTC build timestamp and GitHub commit to make updating deterministic and monotonic.
const epoch=Number(process.env.SOURCE_DATE_EPOCH||Math.floor(Date.now()/1000));
const commit=process.env.GITHUB_SHA||'local-dev';
const info={version:'1.0.'+epoch,createdEpoch:epoch,revision:commit};
fs.writeFileSync(path.join(web,'build-info.json'),JSON.stringify(info,null,2)+'\n');
let ownerRepo=process.env.GITHUB_REPOSITORY||'';
const baseUrl=ownerRepo.includes('/')?`https://${ownerRepo.split('/')[0]}.github.io/${ownerRepo.split('/')[1]}/`:'';
fs.writeFileSync(path.join(web,'ota-config.js'),`window.PIANO_OTA_BASE=${JSON.stringify(baseUrl)};\n`);
const publicFiles=[];
function walk(d,rel=''){
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const name=path.posix.join(rel,e.name),full=path.join(d,e.name);
    if(e.isDirectory()) {if(name!=='ota')walk(full,name);}
    else if(e.isFile()&&!name.startsWith('_')&&!name.endsWith('.map')) publicFiles.push(name);
  }
}
walk(web);
// Precache all songs: first offline start works with no network after installation.
const cacheFiles=publicFiles.filter(f=>f!=='sw.js').map(f=>'./'+f.split('/').map(encodeURIComponent).join('/'));
const cache='piano-v2-'+crypto.createHash('sha256').update(JSON.stringify(cacheFiles)+commit+epoch).digest('hex').slice(0,14);
const sw=`const CACHE=${JSON.stringify(cache)};\nconst ASSETS=${JSON.stringify(cacheFiles)};\n`+String.raw`
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(async cache=>{
    const failed=[];
    for(const url of ASSETS){try{await cache.add(url)}catch(e){failed.push(url);}}
    if(failed.length)console.warn('Cache thiếu tài nguyên:',failed);
    await self.skipWaiting();
  })
));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('piano-v2-')&&key!==CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin) return;
  const url=new URL(event.request.url);
  if(url.pathname.includes('/ota/'))return; // OTA metadata must not be stale
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{const res=await fetch(event.request);if(res.ok)await cache.put(event.request,res.clone());return res;}
    catch(e){return cached||Response.error();}
  })());
});
`;
fs.writeFileSync(path.join(web,'sw.js'),sw);
// OTA bundle is a web bundle for the native Capacitor updater; excludes /ota itself.
// Use system zip on CI runner (Ubuntu). With local zip also available, creates identical layout.
const otaDir=path.join(web,'ota');fs.mkdirSync(otaDir,{recursive:true});
const zipPath=path.join(otaDir,'bundle.zip');
if(fs.existsSync(zipPath))fs.rmSync(zipPath);
const zipFiles=publicFiles.filter(f=>f!=='sw.js'&&!f.startsWith('ota/'));
zipFiles.push('sw.js');
execFileSync('zip',['-q','-X',zipPath,...zipFiles],{cwd:web});
const hash=crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex');
const latest={...info,url:baseUrl?baseUrl+'ota/bundle.zip':'',sha256:hash};
fs.writeFileSync(path.join(otaDir,'latest.json'),JSON.stringify(latest,null,2)+'\n');
console.log(`Đã đóng gói ${files.length} bài; build ${info.version}; OTA ${Math.round(fs.statSync(zipPath).size/1024)} KB`);
if(!baseUrl)console.log('Gợi ý: GITHUB_REPOSITORY=owner/repo npm run build:web để tạo URL OTA.');
