import { unlockRequirements } from "./config.js";
import { state, setRequirement, markRequirementOpened } from "./state.js";
import { saveState } from "./storage.js";
import { celebrate, pulseElement } from "./animations.js";
import { renderProgress, renderUnlockMessage, refreshRequirementCards, renderCaptcha, getUIRefs } from "./ui.js";
import { recordActivity } from "./analytics.js";

function openExternal(url) {
  try {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
      try { popup.opener = null; } catch {}
    }
  } catch {}
}

export function initUnlock() {
  const refs = getUIRefs();

  const action = async (requirement) => {
    if (state.requirements[requirement.id]) return;

    // The user's tap is the completion event. Mark the step immediately,
    // before navigation, so the UI reacts in the same event loop.
    markRequirementOpened(requirement.id, true);
    recordActivity("step", `${requirement.title} opened`, "Requirement marked complete from the configured action.");
    setRequirement(requirement.id, true);
    refreshRequirementCards();
    renderProgress();
    renderUnlockMessage();
    renderCaptcha();
    pulseElement(refs.progressFill?.parentElement);
    void saveState();

    // Open the configured destination after state is committed. No warning
    // toast is shown if a browser blocks the new tab: the tap still counts.
    if (requirement.url && requirement.url !== "#") openExternal(requirement.url);

    if (state.progress === 100) {
      celebrate(refs.unlockMessage);
    }
  };

  const refreshOnReturn = () => {
    refreshRequirementCards();
    renderProgress();
    renderUnlockMessage();
    renderCaptcha();
  };
  window.addEventListener("focus", refreshOnReturn);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshOnReturn();
  });

  return { action };
}
