const CACHE = 'cbvd-lock-v3-0-7';
const APP_SHELL = [
 './','./index.html','./access.html','./css/main.css','./manifest.webmanifest',
 './js/app.js','./js/access.js','./js/config.js','./js/state.js','./js/storage.js','./js/unlock.js','./js/verification.js','./js/captcha.js','./js/purchase.js','./js/product.js','./js/ui.js','./js/animations.js','./js/feature-catalog.js','./js/toast.js','./js/utils.js','./js/dashboard.js','./js/timeline.js','./js/support.js','./js/pwa.js','./js/performance.js','./js/analytics.js',
 './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/images/logo.jpeg','./assets/images/og-image.svg'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(url.origin!==self.location.origin){if(req.destination!=='image')return;}
 e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>cached||caches.match('./index.html'))));
});
