import { showToast } from './toast.js';
let deferredPrompt=null;
export function initPWA(){
 if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').then(reg=>{reg.update().catch(()=>{});reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showToast('A new CBVD Lock version is ready. Refresh to update.','info',5000);});});}).catch(()=>{});}
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const banner=document.querySelector('[data-pwa-banner]');if(banner)banner.hidden=false;});
 document.querySelector('[data-pwa-install]')?.addEventListener('click',async()=>{if(!deferredPrompt){showToast('Install is not available in this browser right now.','info');return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.querySelector('[data-pwa-banner]')?.setAttribute('hidden','');});
 document.querySelector('[data-pwa-dismiss]')?.addEventListener('click',()=>document.querySelector('[data-pwa-banner]')?.setAttribute('hidden',''));
 window.addEventListener('online',()=>showToast('You are back online.','success',1800));
 window.addEventListener('offline',()=>showToast('Offline mode active. Local progress remains available.','info',2800));
}
