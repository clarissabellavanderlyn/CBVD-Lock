import { state } from "./state.js";
import { saveState } from "./storage.js";
import { recordActivity } from "./analytics.js";

export const PURCHASE_STATUSES = ["not_purchased", "pending", "processing", "completed", "failed", "cancelled"];
export async function setPurchaseStatus(status, reference = null) {
  if (!PURCHASE_STATUSES.includes(status)) return false;
  state.purchaseStatus = status;
  if (reference) state.orderReference = reference;
  recordActivity("purchase", `Purchase status: ${status.replace("_", " ")}`, reference ? `Order ${reference}` : "");
  await saveState();
  window.dispatchEvent(new CustomEvent("cbvd:purchase", { detail: { status, reference } }));
  return true;
}
