let region;
let activeToast = null;
let closeTimer = null;
let mutedByModal = false;

export function initToast() {
  region = document.querySelector("[data-toast-region]");
  window.addEventListener("cbvd:modal-opened", () => {
    mutedByModal = true;
    dismissToast();
  });
  window.addEventListener("cbvd:modal-closed", () => {
    mutedByModal = false;
  });
}

export function dismissToast() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (!activeToast) return;
  activeToast.remove();
  activeToast = null;
}

export function showToast(message, type = "info", duration = 3400) {
  if (!region || mutedByModal) return;

  // Replace, never stack: this prevents two notifications from animating
  // over each other on small screens.
  dismissToast();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "check-circle-2"
    : type === "error" ? "circle-alert"
    : type === "warning" ? "triangle-alert" : "info";
  toast.innerHTML = `
    <span class="toast-icon"><i data-lucide="${icon}"></i></span>
    <span class="toast-message"></span>
    <button type="button" class="toast-close" aria-label="Dismiss notification"><i data-lucide="x"></i></button>
  `;
  toast.querySelector(".toast-message").textContent = message;
  region.replaceChildren(toast);
  activeToast = toast;
  window.lucide?.createIcons?.();

  const close = () => {
    if (activeToast !== toast) return;
    dismissToast();
  };
  toast.querySelector(".toast-close").addEventListener("click", close);
  closeTimer = window.setTimeout(close, Math.max(1200, duration));
}
