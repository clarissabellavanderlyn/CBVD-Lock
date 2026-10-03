import { APP_CONFIG } from "./config.js";
import { state } from "./state.js";

const DB_NAME = "cbvd-lock-db";
const STORE = "app-state";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function snapshot() {
  return {
    requirements: { ...state.requirements },
    openedSteps: { ...state.openedSteps },
    openedAt: { ...state.openedAt },
    unlocked: state.unlocked,
    purchaseStatus: state.purchaseStatus,
    orderReference: state.orderReference,
    orderCreatedAt: state.orderCreatedAt,
    installDismissed: state.installDismissed,
    captchaVerified: state.captchaVerified,
    accessOpenedAt: state.accessOpenedAt,
    activity: Array.isArray(state.activity) ? state.activity.slice(0, 40) : [],
    verificationAttempts: state.verificationAttempts,
    lastVerificationAt: state.lastVerificationAt,
    performance: state.performance
  };
}

export async function loadState() {
  try {
    const db = await openDB();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(APP_CONFIG.storageKey);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return value || null;
  } catch {
    try {
      return JSON.parse(localStorage.getItem(APP_CONFIG.storageKey) || "null");
    } catch {
      return null;
    }
  }
}

export async function saveState() {
  const data = snapshot();
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(data, APP_CONFIG.storageKey);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    try { localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(data)); } catch {}
  }
}
