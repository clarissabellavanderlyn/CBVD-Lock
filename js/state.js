import { unlockRequirements } from "./config.js";

export const state = {
  unlocked: false,
  requirements: Object.fromEntries(unlockRequirements.map(item => [item.id, false])),
  openedSteps: Object.fromEntries(unlockRequirements.map(item => [item.id, false])),
  openedAt: Object.fromEntries(unlockRequirements.map(item => [item.id, null])),
  progress: 0,
  purchaseStatus: "not_purchased",
  orderReference: null,
  orderCreatedAt: null,
  installDismissed: false,
  captchaVerified: false,
  accessOpenedAt: null,
  activity: [],
  verificationAttempts: 0,
  lastVerificationAt: null,
  performance: { reducedMotion: false }
};

export function hydrateState(saved) {
  if (!saved || typeof saved !== "object") return;
  state.requirements = {
    ...state.requirements,
    ...(saved.requirements || {})
  };
  state.openedSteps = {
    ...state.openedSteps,
    ...(saved.openedSteps || {})
  };
  state.openedAt = {
    ...state.openedAt,
    ...(saved.openedAt || {})
  };
  state.unlocked = Boolean(saved.unlocked);
  state.purchaseStatus = saved.purchaseStatus || "not_purchased";
  state.orderReference = saved.orderReference || null;
  state.orderCreatedAt = saved.orderCreatedAt ? Number(saved.orderCreatedAt) : null;
  state.installDismissed = Boolean(saved.installDismissed);
  state.captchaVerified = Boolean(saved.captchaVerified);
  state.accessOpenedAt = saved.accessOpenedAt ? Number(saved.accessOpenedAt) : null;
  state.activity = Array.isArray(saved.activity) ? saved.activity.slice(0, 40) : [];
  state.verificationAttempts = Number(saved.verificationAttempts || 0);
  state.lastVerificationAt = saved.lastVerificationAt ? Number(saved.lastVerificationAt) : null;
  state.performance = { ...state.performance, ...(saved.performance || {}) };
  recalculateProgress();
}

export function markRequirementOpened(id, opened = true) {
  if (!(id in state.openedSteps)) return;
  state.openedSteps[id] = Boolean(opened);
  state.openedAt[id] = opened ? Date.now() : null;
}

export function setRequirement(id, completed) {
  if (!(id in state.requirements)) return;
  state.requirements[id] = Boolean(completed);
  recalculateProgress();
}

export function recalculateProgress() {
  const total = unlockRequirements.filter(item => item.required).length;
  const completed = unlockRequirements.filter(item => item.required && state.requirements[item.id]).length;
  state.progress = total ? Math.round((completed / total) * 100) : 0;
  state.unlocked = total > 0 && completed === total && state.captchaVerified;
  return state.progress;
}
