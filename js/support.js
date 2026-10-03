import { APP_CONFIG } from './config.js';
import { recordActivity } from './analytics.js';
import { openModal, closeModal } from './ui.js';

const faqs = [
 ['How does unlock work?','Complete each configured step, pass the final CAPTCHA, then continue to the product page.'],
 ['Where is my progress saved?','Progress is stored locally on this device using IndexedDB with localStorage fallback.'],
 ['Can I reopen the product later?','Yes. Once unlocked, open the access page again on the same device.'],
 ['How do I confirm a purchase?','Create an order from Purchase Center and use the configured admin contact to confirm payment.'],
 ['What if an image does not load?','Check your connection, then refresh. Product previews use lazy loading to keep the page responsive.']
];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initSupport(root){
 if(!root)return;
 root.innerHTML=`<div class="support-head"><div><span class="eyebrow">SUPPORT CENTER</span><h2>Need a hand?</h2><p>Quick answers and a direct support path.</p></div><span class="support-icon"><i data-lucide="headset"></i></span></div><div class="support-decoration-banners" aria-label="Contact and important notices">
  <div class="support-decoration-banner is-contact">
    <img src="assets/decor/mail_contact.png" alt="" loading="lazy" decoding="async">
    <div class="support-decoration-banner-copy">
      <span><i data-lucide="mail"></i> Contact</span>
      <strong>Need direct assistance?</strong>
      <p>Use the contact options below to reach the admin.</p>
    </div>
  </div>
  <div class="support-decoration-banner is-notice">
    <img src="assets/decor/important_notice_1.png" alt="" loading="lazy" decoding="async">
    <div class="support-decoration-banner-copy">
      <span><i data-lucide="megaphone"></i> Important Notice</span>
      <strong>Please read before continuing</strong>
      <p>Keep your order and access details private and follow the configured flow.</p>
    </div>
  </div>
  <div class="support-decoration-banner is-notice">
    <img src="assets/decor/important_notice_2.png" alt="" loading="lazy" decoding="async">
    <div class="support-decoration-banner-copy">
      <span><i data-lucide="bell"></i> Notice</span>
      <strong>Stay informed</strong>
      <p>Check the latest guidance before contacting the admin.</p>
    </div>
  </div>
</div><div class="support-faq-stage"><div class="support-faq-decoration" aria-hidden="true"><span class="support-faq-decoration-glow"></span><img src="assets/decor/faq.png" alt="" loading="lazy" decoding="async"></div><div class="support-faq-content"><label class="support-search"><i data-lucide="search"></i><input type="search" placeholder="Search help topics..." data-support-search></label><div class="support-faq" data-support-faq>${faqs.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${esc(q)}<i data-lucide="chevron-down"></i></summary><p>${esc(a)}</p></details>`).join('')}</div><div class="support-actions"><div class="button-group"><button class="btn btn-primary" type="button" data-support-whatsapp><i data-lucide="message-circle"></i><span>Contact</span></button><button class="btn btn-soft" type="button" data-support-report><i data-lucide="flag"></i><span>Report</span></button></div></div></div></div>`;
 const list=root.querySelector('[data-support-faq]'); const search=root.querySelector('[data-support-search]');
 search?.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();list.querySelectorAll('details').forEach(d=>d.hidden=q && !d.textContent.toLowerCase().includes(q));});
 root.querySelector('[data-support-whatsapp]')?.addEventListener('click',()=>{recordActivity('support','Support contact opened','WhatsApp admin handoff');window.open(`https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent('Hello Admin CBVD Lock, I need help with my CBVD Lock order/access.')}`,'_blank','noopener,noreferrer');});
 root.querySelector('[data-support-report]')?.addEventListener('click', () => {
  recordActivity('support', 'Issue report started', 'Issue report modal opened');
  openModal({
    kicker: 'SUPPORT • ISSUE REPORT',
    title: 'Report an Issue',
    body: 'Something not working as expected? We can help. Describe the problem clearly so the admin can check it efficiently.',
    icon: 'flag',
    details: 'Please include what happened, which page or feature you were using, the steps that caused the issue, and your order reference if available. Never share passwords, verification codes, or other sensitive information.',
    actionLabel: 'Contact Admin',
    onAction: () => {
      recordActivity('support', 'Issue report contact opened', 'WhatsApp admin handoff');
      const message = 'Hello Admin CBVD Lock, I would like to report an issue.\n\nIssue: ';
      const waUrl = `https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    }
  });
 });
 window.lucide?.createIcons?.();
}
