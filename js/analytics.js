import { state } from './state.js';
import { saveState } from './storage.js';

export function recordActivity(type, title, detail = '') {
  const item = { id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, type, title, detail, at: Date.now() };
  state.activity = Array.isArray(state.activity) ? state.activity : [];
  state.activity.unshift(item);
  state.activity = state.activity.slice(0, 200);
  void saveState();
  window.dispatchEvent(new CustomEvent('cbvd:activity', { detail: item }));
  return item;
}

export function getActivities() { return Array.isArray(state.activity) ? state.activity : []; }
