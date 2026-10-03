import { ASSETS, PRODUCT, APP_CONFIG } from "./config.js";
import { initFeatureCatalog } from "./feature-catalog.js";
import { state, hydrateState } from "./state.js";
import { loadState } from "./storage.js";
import { initToast, showToast } from "./toast.js";
import { openModal, closeModal } from "./ui.js";
import { setPurchaseStatus } from "./purchase.js";
import { renderDashboard } from './dashboard.js';
import { initTimeline } from './timeline.js';
import { initSupport } from './support.js';
import { initPWA } from './pwa.js';
import { initPerformance } from './performance.js';
import { recordActivity } from './analytics.js';
import { buildDecorations } from './decorations.js';
import {
  renderFreeAccount,
  initFreeAccount
} from "./free-account.js";

async function boot() {
  buildDecorations();
  initToast();
  const saved = await loadState();
  hydrateState(saved);

  if (!state.unlocked) {
    window.location.replace("index.html#unlock");
    return;
  }

  document.querySelector("[data-year]")?.replaceChildren(document.createTextNode(new Date().getFullYear()));
  state.accessOpenedAt = state.accessOpenedAt || Date.now();
  recordActivity('unlock','Unlocked product page opened',PRODUCT.title);
  const productLogo = document.querySelector("[data-product-logo]");
  productLogo.src = ASSETS.productLogo;
  productLogo.addEventListener("error", () => {
    productLogo.classList.add("is-missing");
    productLogo.removeAttribute("src");
    productLogo.alt = "Pocket Champs product logo unavailable";
  }, { once: true });
  document.querySelector("[data-product-description]").textContent = PRODUCT.description;
  document.querySelector("[data-product-price]").innerHTML = `$${PRODUCT.price.toFixed(2)} <small>${PRODUCT.currency}</small>`;
  document.querySelector("[data-feature-count]").textContent = `${PRODUCT.features.length} features`;
  const featurePanel = document.querySelector(".feature-panel");
  if (featurePanel) {
    featurePanel.innerHTML = `
      <div class="feature-panel-head">
        <span>What’s included</span>
        <span class="feature-count" data-feature-count>${PRODUCT.features.length} features</span>
      </div>
      <div class="feature-catalog" data-feature-catalog>
        <div class="feature-catalog-toolbar">
          <div class="feature-catalog-intro">
            <span class="feature-catalog-kicker">Organized for clarity</span>
            <strong><span data-total-feature-count>${PRODUCT.features.length}</span> features across <span data-category-count>9</span> categories</strong>
          </div>
          <label class="feature-search">
            <i data-lucide="search"></i>
            <input data-feature-search type="search" placeholder="Search features..." autocomplete="off">
          </label>
          <p class="feature-search-hint" data-search-hint>Search understands partial words, common typos, and related terms.</p>
        </div>
        <div class="feature-category-nav" data-feature-category-nav role="tablist" aria-label="Feature categories"></div>
        <div class="feature-results-meta"><span>Included features</span><strong data-feature-result-count>${PRODUCT.features.length} features</strong></div>
        <div class="features-list" data-features></div>
      </div>
    `;
    initFeatureCatalog(featurePanel.querySelector("[data-feature-catalog]"));
  }
  const previewRail = document.querySelector("[data-preview-rail]");
  const previewMarkup = (src, index, clone = false) => `<button class="preview-item${clone ? " preview-item-clone" : ""}" type="button" data-preview-index="${index}"${clone ? ' tabindex="-1" aria-hidden="true"' : ''} aria-label="Open product preview ${index + 1} in full screen"><img src="${src}" alt="Pocket Champs product preview ${index + 1}" loading="lazy" decoding="async"></button>`;
  const originalPreviewMarkup = ASSETS.productPreviews.map((src, index) => previewMarkup(src, index)).join("");
  const clonedPreviewMarkup = ASSETS.productPreviews.map((src, index) => previewMarkup(src, index, true)).join("");
  previewRail.innerHTML = originalPreviewMarkup + clonedPreviewMarkup;

  // Idle autoplay: previews move forward continuously and loop to the first
  // image without ever reversing direction. Any user interaction pauses it
  // briefly, then autoplay resumes after the rail becomes idle again.
  let previewAutoplayFrame = 0;
  let previewAutoplayActive = ASSETS.productPreviews.length > 1;
  let previewResumeTimer = null;
  let previewLastTime = 0;
  const previewLoopWidth = () => previewRail.scrollWidth / 2;
  const previewSpeed = 22; // px/second

  const stopPreviewAutoplay = () => {
    previewAutoplayActive = false;
    if (previewResumeTimer) window.clearTimeout(previewResumeTimer);
    previewResumeTimer = null;
  };

  const schedulePreviewAutoplay = () => {
    stopPreviewAutoplay();
    if (ASSETS.productPreviews.length < 2 || document.documentElement.classList.contains("reduced-motion")) return;
    previewResumeTimer = window.setTimeout(() => {
      previewAutoplayActive = true;
      previewLastTime = performance.now();
      previewAutoplayFrame = requestAnimationFrame(runPreviewAutoplay);
    }, 1800);
  };

  const runPreviewAutoplay = (now) => {
    if (!previewAutoplayActive) return;
    const delta = Math.min(64, now - previewLastTime);
    previewLastTime = now;
    const loopWidth = previewLoopWidth();
    if (loopWidth > 0) {
      previewRail.scrollLeft += (previewSpeed * delta) / 1000;
      if (previewRail.scrollLeft >= loopWidth) previewRail.scrollLeft -= loopWidth;
    }
    previewAutoplayFrame = requestAnimationFrame(runPreviewAutoplay);
  };

  const markPreviewInteraction = () => {
    stopPreviewAutoplay();
    schedulePreviewAutoplay();
  };

  ["pointerdown", "wheel", "touchstart", "focusin", "keydown"].forEach(type => {
    previewRail.addEventListener(type, markPreviewInteraction, { passive: type !== "keydown" });
  });
  previewRail.addEventListener("scroll", () => {
    if (!previewAutoplayActive) return;
    const loopWidth = previewLoopWidth();
    if (loopWidth > 0 && previewRail.scrollLeft >= loopWidth) previewRail.scrollLeft -= loopWidth;
  }, { passive: true });

  if (previewAutoplayActive) {
    previewLastTime = performance.now();
    previewAutoplayFrame = requestAnimationFrame(runPreviewAutoplay);
  }

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  let activePreviewIndex = 0;
  let zoomScale = 1;

  const renderLightbox = (index) => {
    if (!ASSETS.productPreviews.length) return;
    activePreviewIndex = (index + ASSETS.productPreviews.length) % ASSETS.productPreviews.length;
    const src = ASSETS.productPreviews[activePreviewIndex];
    lightboxImage.src = src;
    lightboxImage.alt = `Pocket Champs product preview ${activePreviewIndex + 1}`;
    zoomScale = 1;
    lightboxImage.style.transform = "scale(1)";
    const counter = document.querySelector("[data-lightbox-counter]");
    if (counter) counter.textContent = `Preview ${String(activePreviewIndex + 1).padStart(2,"0")} / ${ASSETS.productPreviews.length}`;
    const multiple = ASSETS.productPreviews.length > 1;
    document.querySelector("[data-lightbox-prev]").hidden = !multiple;
    document.querySelector("[data-lightbox-next]").hidden = !multiple;
  };

  const openLightbox = (index) => {
    renderLightbox(index);
    if (!lightbox.open) lightbox.showModal();
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (lightbox.open) lightbox.close();
    document.body.classList.remove("lightbox-open");
  };

  previewRail.addEventListener("click", event => {
    const trigger = event.target.closest("[data-preview-index]");
    if (!trigger || trigger.classList.contains("preview-item-clone")) return;
    openLightbox(Number(trigger.dataset.previewIndex));
  });

  const applyZoom = (delta) => { zoomScale = Math.min(3, Math.max(1, zoomScale + delta)); lightboxImage.style.transform = `scale(${zoomScale})`; };
  document.querySelector('[data-lightbox-zoom-in]')?.addEventListener('click',()=>applyZoom(.25));
  document.querySelector('[data-lightbox-zoom-out]')?.addEventListener('click',()=>applyZoom(-.25));
  document.querySelector('[data-lightbox-zoom-reset]')?.addEventListener('click',()=>{zoomScale=1;lightboxImage.style.transform='scale(1)';});
  lightboxImage.addEventListener('wheel',e=>{if(!lightbox.open)return;e.preventDefault();applyZoom(e.deltaY<0?.15:-.15);},{passive:false});

  document.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => openLightbox(activePreviewIndex - 1));
  document.querySelector("[data-lightbox-next]")?.addEventListener("click", () => openLightbox(activePreviewIndex + 1));
  document.querySelectorAll("[data-lightbox-close]").forEach(button => button.addEventListener("click", closeLightbox));
  lightboxImage.addEventListener("click", () => openLightbox(activePreviewIndex));
  lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  document.addEventListener("keydown", event => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") openLightbox(activePreviewIndex - 1);
    if (event.key === "ArrowRight") openLightbox(activePreviewIndex + 1);
    if (event.key === "Escape") closeLightbox();
  });

  document.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", closeModal));
  document.querySelector("[data-modal]")?.addEventListener("click", event => { if (event.target === event.currentTarget) closeModal(); });
  setupPurchaseFlow();
  /* ============================================================
   FREE ACCOUNT
   ============================================================ */

const freeAccountRoot = document.querySelector(
  "[data-free-account]"
);

if (freeAccountRoot) {
  renderFreeAccount(freeAccountRoot);
  initFreeAccount(freeAccountRoot);
}


/* ============================================================
   DASHBOARD
   ============================================================ */

renderDashboard(
  document.querySelector("[data-smart-dashboard]")
);


/* ============================================================
   TIMELINE
   ============================================================ */

initTimeline(
  document.querySelector("[data-activity-timeline]")
);


/* ============================================================
   SUPPORT
   ============================================================ */

initSupport(
  document.querySelector("[data-support-center]")
);


/* ============================================================
   PWA / PERFORMANCE
   ============================================================ */

initPWA();
initPerformance();


/* ============================================================
   ICONS
   ============================================================ */

window.lucide?.createIcons?.();


/* ============================================================
   SUCCESS TOAST
   ============================================================ */

showToast(
  "Product access unlocked.",
  "success",
  2200
);
  renderDashboard(document.querySelector('[data-smart-dashboard]'));
  initTimeline(document.querySelector('[data-activity-timeline]'));
  initSupport(document.querySelector('[data-support-center]'));
  initPWA();
  initPerformance();
  window.lucide?.createIcons?.();
  showToast("Product access unlocked.", "success", 2200);
}


function setupSmartPWA() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").then(reg => {
    reg.update().catch(() => {});
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          showToast("A new version of CBVD Lock is available. Refresh the page to update.", "info", 4500);
        }
      });
    });
  }).catch(() => {});

  const updateNetworkState = () => {
    if (!navigator.onLine) showToast("Offline mode is active. Access data remains saved on this device.", "info", 2600);
  };
  window.addEventListener("offline", updateNetworkState);
}

function createOrderReference() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CBVD-${stamp}-${random}`;
}

function setupPurchaseFlow() {
  const buyButton = document.querySelector("[data-buy-button]");
  const purchaseModal = document.querySelector("[data-purchase-modal]");
  if (!buyButton || !purchaseModal) return;

  const orderRefEl = purchaseModal.querySelector("[data-order-reference]");
  const productEl = purchaseModal.querySelector("[data-purchase-product]");
  const priceEl = purchaseModal.querySelector("[data-purchase-price]");
  const methodEl = purchaseModal.querySelector("[data-payment-method]");
  const adminEl = purchaseModal.querySelector("[data-payment-admin]");
  const noteEl = purchaseModal.querySelector("[data-payment-note]");
  const closeButtons = purchaseModal.querySelectorAll("[data-purchase-close]");
  const confirmButton = purchaseModal.querySelector("[data-payment-confirmation]");
  let currentOrder = null;

  const close = () => {
    if (purchaseModal.open) purchaseModal.close();
    document.body.classList.remove("purchase-modal-open");
  };

  const open = async () => {
    if (!state.unlocked) return;
    currentOrder = {
      reference: state.orderReference || createOrderReference(),
      createdAt: state.orderCreatedAt ? new Date(state.orderCreatedAt) : new Date(),
      product: PRODUCT.title,
      price: PRODUCT.price,
      currency: PRODUCT.currency
    };
    state.orderReference = currentOrder.reference;
    state.orderCreatedAt = currentOrder.createdAt.getTime();
    orderRefEl.textContent = currentOrder.reference;
    productEl.textContent = currentOrder.product;
    priceEl.textContent = `$${currentOrder.price.toFixed(2)} ${currentOrder.currency}`;
    methodEl.textContent = PRODUCT.payment.method;
    adminEl.textContent = `${PRODUCT.payment.adminLabel} • ${PRODUCT.payment.adminWhatsAppDisplay}`;
    noteEl.textContent = PRODUCT.payment.note;
    confirmButton.disabled = false;
    confirmButton.innerHTML = '<i data-lucide="message-circle"></i><span>Payment Confirmation</span>';
    window.lucide?.createIcons?.();
    if (!purchaseModal.open) purchaseModal.showModal();
    document.body.classList.add("purchase-modal-open");
    await setPurchaseStatus("pending", currentOrder.reference);
  };

  buyButton.addEventListener("click", open);
  closeButtons.forEach(button => button.addEventListener("click", close));
  purchaseModal.addEventListener("click", event => {
    if (event.target === purchaseModal) close();
  });

  confirmButton.addEventListener("click", async () => {
    if (!currentOrder) return;
    const created = currentOrder.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const message = [
      "*CBVD LOCK — PAYMENT CONFIRMATION*",
      "━━━━━━━━━━━━━━━━━━━━",
      "*ORDER DETAILS*",
      `• *Order Reference:* ${currentOrder.reference}`,
      `• *Product:* ${currentOrder.product}`,
      `• *Amount:* $${currentOrder.price.toFixed(2)} ${currentOrder.currency}`,
      `• *Status:* ${PRODUCT.payment.status}`,
      `• *Created:* ${created}`,
      "━━━━━━━━━━━━━━━━━━━━",
      "*PAYMENT REQUEST*",
      "Hello Admin CBVD Lock,",
      "I would like to confirm my payment for the order above.",
      "Please verify the order and provide the current payment destination and the next steps for completing the transaction.",
      "",
      "Thank you for your assistance.",
      "",
      "*CBVD Lock Customer*"
    ].join("\n");
    await setPurchaseStatus("processing", currentOrder.reference);
    const waUrl = `https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent(message)}`;
    confirmButton.disabled = true;
    confirmButton.innerHTML = '<i data-lucide="external-link"></i><span>Opening WhatsApp…</span>';
    window.lucide?.createIcons?.();
    window.location.href = waUrl;
  });
}

boot().catch((error) => { console.error("CBVD Lock access boot error:", error); try { showToast("Unable to load the unlocked product page.", "error"); } catch {} });
