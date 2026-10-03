import { ASSETS, PRODUCT, unlockRequirements } from "./config.js";
import { initFeatureCatalog } from "./feature-catalog.js";
import { state } from "./state.js";
import { dismissToast } from "./toast.js";

const refs = {};
let iconRetryTimer = null;
let iconRetryCount = 0;
let modalActionHandler = null;

function refreshIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
    if (iconRetryTimer) clearTimeout(iconRetryTimer);
    iconRetryTimer = null;
    iconRetryCount = 0;
    return;
  }
  // Lucide is loaded from a CDN. On slower mobile connections the module can
  // execute first, so retry briefly instead of leaving dynamic icons blank.
  if (iconRetryCount >= 20 || iconRetryTimer) return;
  iconRetryCount += 1;
  iconRetryTimer = window.setTimeout(() => {
    iconRetryTimer = null;
    refreshIcons();
  }, 250);
}

window.addEventListener("load", refreshIcons, { once: true });

function bindProductLogo() {
  const logo = document.querySelector("[data-product-logo]");
  if (!logo) return;
  logo.addEventListener("error", () => {
    logo.classList.add("is-missing");
    logo.removeAttribute("src");
    logo.alt = "Pocket Champs product logo unavailable";
  }, { once: true });
}

export function cacheUI() {
  bindProductLogo();
  refs.requirements = document.querySelector("[data-requirements]");
  refs.template = document.querySelector("#requirement-template");
  refs.progressFill = document.querySelector("[data-progress-fill]");
  refs.progressCount = document.querySelector("[data-progress-count]");
  refs.progressTotal = document.querySelector("[data-progress-total]");
  refs.progressPercent = document.querySelector("[data-progress-percent]");
  refs.progressState = document.querySelector("[data-progress-state]");
  refs.progressCopy = document.querySelector("[data-progress-copy]");
  refs.statusLabel = document.querySelector("[data-status-label]");
  refs.productCard = document.querySelector("[data-product-card]");
  refs.lockedOverlay = document.querySelector("[data-locked-overlay]");
  refs.productLogo = document.querySelector("[data-product-logo]");
  refs.productTitle = document.querySelector("[data-product-title]");
  refs.productDescription = document.querySelector("[data-product-description]");
  refs.productPrice = document.querySelector("[data-product-price]");
  refs.priceBlock = document.querySelector("[data-price-block]");
  refs.features = document.querySelector("[data-features]");
  refs.featureCount = document.querySelector("[data-feature-count]");
  refs.previewRail = document.querySelector("[data-preview-rail]");
  refs.buyButton = document.querySelector("[data-buy-button]");
  refs.checkoutNote = document.querySelector("[data-checkout-note]");
  refs.productSection = document.querySelector("[data-product-section]");
  refs.messageTitle = document.querySelector("[data-message-title]");
  refs.messageBody = document.querySelector("[data-message-body]");
  refs.unlockMessage = document.querySelector("[data-unlock-message]");
  refs.captchaPanel = document.querySelector("[data-captcha]");
  refs.captchaCode = document.querySelector("[data-captcha-code]");
  refs.captchaRefresh = document.querySelector("[data-captcha-refresh]");
  refs.captchaInput = document.querySelector("[data-captcha-input]");
  refs.captchaConfirm = document.querySelector("[data-captcha-confirm]");
  refs.captchaError = document.querySelector("[data-captcha-error]");
  refs.captchaSuccess = document.querySelector("[data-captcha-success]");
  refs.captchaContinue = document.querySelector("[data-captcha-continue]");
}

export function renderStaticProduct() {
  refs.productLogo.src = ASSETS.productLogo;
  refs.productTitle.textContent = PRODUCT.title;
  refs.productDescription.textContent = PRODUCT.description;
  refs.productPrice.innerHTML = `$${PRODUCT.price.toFixed(2)} <small>${PRODUCT.currency}</small>`;
  refs.featureCount.textContent = `${PRODUCT.features.length} features`;
  const panel = refs.features?.closest(".feature-panel");
  if (panel) {
    panel.innerHTML = `
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
    refs.features = panel.querySelector("[data-features]");
    initFeatureCatalog(panel.querySelector("[data-feature-catalog]"));
  }

  refs.previewRail.innerHTML = ASSETS.productPreviews.map((src, index) => `
    <figure class="preview-item">
      <img src="${src}" alt="Pocket Champs product preview ${index + 1}" loading="lazy">
    </figure>
  `).join("");
}

function requirementCount() {
  return unlockRequirements.filter(item => item.required).length;
}

function completedCount() {
  return unlockRequirements.filter(item => item.required && state.requirements[item.id]).length;
}

export function renderRequirements(handlers) {
  refs.requirements.innerHTML = "";
  unlockRequirements.forEach((requirement, index) => {
    if (!requirement.required) return;
    const fragment = refs.template.content.cloneNode(true);
    const card = fragment.querySelector("[data-requirement-card]");
    const icon = fragment.querySelector("[data-requirement-icon]");
    const status = fragment.querySelector("[data-requirement-status]");
    const step = fragment.querySelector("[data-requirement-step]");
    const title = fragment.querySelector("[data-requirement-title]");
    const description = fragment.querySelector("[data-requirement-description]");
    const action = fragment.querySelector("[data-requirement-action]");
    const actionLabel = fragment.querySelector("[data-requirement-action-label]");

    icon.setAttribute("data-lucide", requirement.icon);
    step.textContent = `Step ${String(index + 1).padStart(2, "0")}`;
    title.textContent = requirement.title;
    description.textContent = requirement.description;
    actionLabel.textContent = requirement.actionLabel;
    action.dataset.requirementId = requirement.id;

    action.addEventListener("click", () => handlers.action(requirement));

    card.dataset.requirementId = requirement.id;
    refs.requirements.appendChild(fragment);
    updateRequirementCard(card, requirement);
  });
  refreshIcons();
}

export function updateRequirementCard(card, requirement) {
  const completed = Boolean(state.requirements[requirement.id]);
  const status = card.querySelector("[data-requirement-status]");
  const action = card.querySelector("[data-requirement-action]");
  const mark = card.querySelector(".completion-mark");

  card.classList.toggle("is-complete", completed);
  card.classList.remove("is-ready");

  if (completed) {
    status.className = "requirement-status status-complete";
    status.innerHTML = '<i data-lucide="check-circle-2"></i><span>Verified</span>';
    action.disabled = true;
    action.classList.add("is-complete-action", "is-verified-action");
    action.innerHTML = '<span data-requirement-action-label>Verified</span><i data-lucide="check-circle-2"></i>';
    mark.hidden = false;
  } else {
    status.className = "requirement-status status-pending";
    status.innerHTML = '<i data-lucide="clock-3"></i><span>Pending</span>';
    action.disabled = false;
    action.classList.remove("is-complete-action", "is-verified-action");
    action.innerHTML = `<span data-requirement-action-label>${requirement.actionLabel}</span><i data-lucide="arrow-up-right"></i>`;
    mark.hidden = true;
  }

  refreshIcons();
}

export function refreshRequirementCards() {
  unlockRequirements.forEach(requirement => {
    const card = refs.requirements.querySelector(`[data-requirement-id="${requirement.id}"]`);
    if (card) updateRequirementCard(card, requirement);
  });
}

export function renderProgress() {
  const total = requirementCount();
  const completed = completedCount();
  refs.progressCount.textContent = completed;
  refs.progressTotal.textContent = total;
  refs.progressPercent.textContent = `${state.progress}%`;
  refs.progressFill.style.width = `${state.progress}%`;
  refs.progressState.textContent = state.unlocked ? "All steps completed" : `${total - completed} step${total - completed === 1 ? "" : "s"} remaining`;
  refs.progressCopy.textContent = state.unlocked ? "Unlocked" : state.progress === 0 ? "Start here" : state.progress >= 66 ? "Almost there" : "Keep going";
  refs.statusLabel.textContent = state.unlocked ? "Unlocked" : "Locked";
  document.querySelector("[data-unlock-status]")?.classList.toggle("is-unlocked", state.unlocked);
}

export function renderProductState() {
  const visible = Boolean(state.unlocked);
  refs.productSection.hidden = !visible;
  refs.productCard.classList.toggle("is-locked", !visible);
  refs.productCard.classList.toggle("is-revealed", visible);
  refs.lockedOverlay.hidden = visible;
  refs.buyButton.disabled = !visible;
  refs.priceBlock.hidden = !visible;
  refs.buyButton.innerHTML = visible
    ? '<i data-lucide="shopping-bag"></i><span>Buy Now</span>'
    : '<i data-lucide="lock-keyhole"></i><span>Locked</span>';
  refs.checkoutNote.textContent = visible ? "Continue through the configured checkout link." : "";
  window.lucide?.createIcons?.();
}

export function renderUnlockMessage() {
  if (state.unlocked) {
    refs.unlockMessage.classList.add("is-success");
    refs.messageTitle.textContent = "You’re in!";
    refs.messageBody.textContent = "Your exclusive product is now available.";
    refs.unlockMessage.querySelector(".message-icon").innerHTML = '<i data-lucide="unlock-keyhole"></i>';
  } else {
    refs.unlockMessage.classList.remove("is-success");
    refs.messageTitle.textContent = state.progress > 0 ? "Almost there!" : "Your reward is waiting...";
    refs.messageBody.textContent = state.progress === 100
      ? "All three steps are verified. Complete the CAPTCHA below to continue."
      : state.progress > 0
        ? "Complete the remaining steps to reveal your exclusive product."
        : "Complete all required steps to reveal the product.";
    refs.unlockMessage.querySelector(".message-icon").innerHTML = '<i data-lucide="lock-keyhole"></i>';
  }
  window.lucide?.createIcons?.();
}

export function renderCaptcha() {
  if (!refs.captchaPanel) return;
  const stepsComplete = state.progress === 100;
  refs.captchaPanel.hidden = !stepsComplete;
  refs.captchaPanel.classList.toggle("is-complete", Boolean(state.captchaVerified));
  if (!stepsComplete) return;

  if (state.captchaVerified) {
    refs.captchaError.hidden = true;
    refs.captchaSuccess.hidden = false;
    refs.captchaConfirm.disabled = true;
    refs.captchaInput.disabled = true;
    refs.captchaContinue.hidden = false;
  } else {
    refs.captchaSuccess.hidden = true;
    refs.captchaContinue.hidden = true;
    refs.captchaConfirm.disabled = false;
    refs.captchaInput.disabled = false;
  }
}

export function openModal({
  title,
  body,
  icon = "info",
  details = "",
  kicker = "INFORMATION",
  actionLabel = "",
  onAction = null
}) {
  dismissToast();

  const modal = document.querySelector("[data-modal]");
  if (!modal) return;

  const kickerEl = modal.querySelector("[data-modal-kicker]");
  const titleEl = modal.querySelector("[data-modal-title]");
  const bodyEl = modal.querySelector("[data-modal-body]");
  const detailsEl = modal.querySelector("[data-modal-details]");
  const iconEl = modal.querySelector("[data-modal-icon]");
  const action = modal.querySelector("[data-modal-action]");

  if (kickerEl) {
    kickerEl.textContent = kicker;
  }

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (bodyEl) {
    bodyEl.textContent = body;
  }

  if (detailsEl) {
    detailsEl.hidden = !details;
    detailsEl.textContent = details;
  }

  if (iconEl) {
    const safeIcon =
      String(icon).replace(/[^a-z0-9-]/gi, "") || "info";

    iconEl.innerHTML = `
      <i data-lucide="${safeIcon}"></i>
    `;
  }

  /*
   * Primary modal action
   *
   * The action is completely hidden when no actionLabel
   * and no onAction handler are provided.
   */
  if (action) {
  const hasAction =
    Boolean(String(actionLabel || "").trim()) &&
    typeof onAction === "function";

  /*
   * Keep both the native hidden state and an explicit
   * CSS state so the primary action can never remain
   * visible when the modal has no action.
   */
  action.hidden = !hasAction;
  action.setAttribute("aria-hidden", String(!hasAction));
  action.classList.toggle("is-hidden", !hasAction);

  const label = action.querySelector("span");

  if (label) {
    label.textContent = hasAction
      ? actionLabel
      : "";
  }

  if (modalActionHandler) {
    action.removeEventListener(
      "click",
      modalActionHandler
    );
  }

  modalActionHandler = null;

  if (hasAction) {
    modalActionHandler = onAction;

    action.addEventListener(
      "click",
      modalActionHandler
    );
  }
}

  refreshIcons();

  window.dispatchEvent(
    new CustomEvent("cbvd:modal-opened")
  );

  try {
    if (typeof modal.showModal === "function") {
      if (!modal.open) {
        modal.showModal();
      }
    } else {
      modal.setAttribute("open", "");
    }
  } catch {
    modal.setAttribute("open", "");
  }
}

export function closeModal() {
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;
  try {
    if (typeof modal.close === "function" && modal.open) modal.close();
    else modal.removeAttribute("open");
  } catch {
    modal.removeAttribute("open");
  }
  window.dispatchEvent(new CustomEvent("cbvd:modal-closed"));
}


export function getUIRefs() {
  return refs;
}
