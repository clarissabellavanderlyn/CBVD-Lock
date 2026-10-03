import { state } from './state.js';
import { PRODUCT, FEATURE_CATEGORIES } from './config.js';

const money = () => `${PRODUCT.price.toFixed(2)} ${PRODUCT.currency}`;
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderDashboard(root) {
  if (!root) return;
  const completed = Object.values(state.requirements).filter(Boolean).length;
  const total = Object.keys(state.requirements).length;
  const status = state.purchaseStatus === 'not_purchased' ? 'Not purchased' : state.purchaseStatus.replace('_',' ');
  root.innerHTML = `
    <div class="dashboard-head"><div><span class="eyebrow">SMART DASHBOARD</span><h2>Everything at a glance.</h2><p>Your unlock, verification and purchase state are summarized here.</p></div><span class="dashboard-live"><i data-lucide="activity"></i> Live state</span></div>
    <div class="dashboard-grid">
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i data-lucide="lock-keyhole-open"></i></span><div><small>Unlock</small><strong>${state.unlocked ? 'Unlocked' : `${completed}/${total}`}</strong><span>${state.unlocked ? 'Product access granted' : `${Math.round(state.progress)}% complete`}</span></div></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i data-lucide="shield-check"></i></span><div><small>Verification</small><strong>${state.captchaVerified ? 'Verified' : 'Pending'}</strong><span>${state.captchaVerified ? 'Final verification passed' : 'Complete required steps first'}</span></div></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i data-lucide="shopping-bag"></i></span><div><small>Purchase</small><strong>${esc(status)}</strong><span>${state.orderReference ? esc(state.orderReference) : money()}</span></div></article>
      <article class="dashboard-stat"><span class="dashboard-stat-icon"><i data-lucide="layers-3"></i></span><div><small>Product</small><strong>${PRODUCT.features.length} features</strong><span>${FEATURE_CATEGORIES.length} categories</span></div></article>
    </div>`;
  window.lucide?.createIcons?.();
}
