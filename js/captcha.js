import { state, recalculateProgress } from "./state.js";
import { saveState } from "./storage.js";
import { renderCaptcha, renderProgress, renderUnlockMessage, getUIRefs } from "./ui.js";
import { recordActivity } from "./analytics.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
let challenge = "";

function generateChallenge(length = 12) {
  const values = new Uint32Array(length);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
    return Array.from(values, value => ALPHABET[value % ALPHABET.length]).join("");
  }
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
}

function setError(message = "") {
  const refs = getUIRefs();
  refs.captchaError.hidden = !message;
  refs.captchaError.textContent = message;
}

export function initCaptcha() {
  const refs = getUIRefs();
  const refreshChallenge = () => {
    challenge = generateChallenge();
    refs.captchaCode.textContent = challenge;
    refs.captchaInput.value = "";
    setError("");
  };
  refreshChallenge();
  refs.captchaInput?.setAttribute("aria-describedby", "captcha-error");
  refs.captchaError?.setAttribute("id", "captcha-error");
  refs.captchaInput.value = "";
  renderCaptcha();

  refs.captchaRefresh?.addEventListener("click", refreshChallenge);
  refs.captchaConfirm?.addEventListener("click", async () => {
    if (state.captchaVerified || state.progress !== 100) return;
    const value = refs.captchaInput.value;

    if (value !== challenge) {
      state.verificationAttempts += 1;
      state.lastVerificationAt = Date.now();
      void saveState();
      recordActivity("verification", "CAPTCHA attempt failed", `Attempt ${state.verificationAttempts}`);
      setError(`CAPTCHA does not match. Check the code and try again. Attempt ${state.verificationAttempts}.`);
      refs.captchaInput.focus();
      return;
    }

    setError("");
    state.captchaVerified = true;
    state.lastVerificationAt = Date.now();
    recalculateProgress();
    recordActivity("verification", "Final verification passed", "CAPTCHA verified successfully");
    await saveState();
    renderCaptcha();
    renderProgress();
    renderUnlockMessage();
    refs.captchaSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  refs.captchaInput?.addEventListener("input", () => {
    refs.captchaInput.value = refs.captchaInput.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
    if (refs.captchaError) refs.captchaError.hidden = true;
  });

  refs.captchaContinue?.addEventListener("click", () => {
    if (state.captchaVerified) window.location.href = "access.html";
  });
}
