/**
 * CBVD Lock verification is intentionally realtime and click-driven.
 * A requirement is completed immediately when its configured Open button
 * successfully opens the destination. No secondary "Verify" button is used.
 */
export async function verifyRequirement(requirement) {
  return {
    ok: Boolean(requirement?.url && requirement.url !== "#"),
    reason: "open_action_verification",
    message: "Step completion is handled by the Open action."
  };
}
