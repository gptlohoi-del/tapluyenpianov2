const CACHE="piano-v2-c0e58db905c7be";
const ASSETS=["./build-info.json","./icons/icon-192.png","./icons/icon-256-original.png","./icons/icon-512.png","./index.html","./manifest.json","./native-ota.bundle.js","./ota-config.js","./patterns.json","./phrase-engine.js","./songs/Mariage%20d'Amour%20easy.mxl","./songs/canon-in-d-johann-pachelbel.mxl","./songs/fur-elise-easy-ver.mxl","./songs/fur-elise-inter.mxl","./songs/fur-elise-inter2.mxl","./songs/index.json","./songs/piano-sonata-no-11-k-331-3rd-movement-rondo-alla-turca.mxl","./songs/tien-quan-ca-quoc-ca.mxl","./songs/turkish-march-easy.mxl","./songs/viet-tiep-cau-chuyen-hoa-binh.mxl","./vendor/JSZIP_LICENSE.md","./vendor/jszip.min.js"];

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
