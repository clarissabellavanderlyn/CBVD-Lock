import { APP_CONFIG } from './config.js';
import { state, hydrateState } from './state.js';
import { loadState } from './storage.js';
import { cacheUI, renderStaticProduct, renderRequirements, renderProgress, renderProductState, renderUnlockMessage, renderCaptcha, closeModal } from './ui.js';
import { initUnlock } from './unlock.js';
import { initProduct } from './product.js';
import { initCaptcha } from './captcha.js';
import { initToast, showToast } from './toast.js';
import { renderDashboard } from './dashboard.js';
import { initTimeline } from './timeline.js';
import { initSupport } from './support.js';
import { initPWA } from './pwa.js';
import { initPerformance } from './performance.js';
import { recordActivity } from './analytics.js';
import { buildDecorations } from './decorations.js';
import { renderFreeAccount, initFreeAccount } from './free-account.js';

async function boot() {
  buildDecorations();
  cacheUI(); initToast();
  const saved = await loadState(); hydrateState(saved);
  if (state.unlocked) { window.location.replace('access.html'); return; }
  renderStaticProduct();
  const unlockHandlers = initUnlock(); renderRequirements(unlockHandlers); renderProgress(); renderProductState(); renderUnlockMessage(); initCaptcha(); renderCaptcha();
  document.querySelector('[data-year]')?.replaceChildren(document.createTextNode(new Date().getFullYear()));
  document.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));
  document.querySelector('[data-modal]')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  initProduct();
  const freeAccountRoot = document.querySelector('[data-free-account]');

  renderFreeAccount(freeAccountRoot);
  initFreeAccount(freeAccountRoot);

  renderDashboard(document.querySelector('[data-smart-dashboard]'));
  initTimeline(document.querySelector('[data-activity-timeline]'));
  initSupport(document.querySelector('[data-support-center]'));
  initPWA(); initPerformance();
  if (!state.activity?.length) recordActivity('system', 'CBVD Lock opened', 'Unlock journey initialized');
  requestAnimationFrame(() => window.lucide?.createIcons?.());
}
boot().catch((error) => { console.error('CBVD Lock boot error:', error); try { showToast('Something went wrong while loading CBVD Lock.', 'error'); } catch { } });
