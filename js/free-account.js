import {
  FREE_ACCOUNT,
  FEATURE_CATEGORIES,
  PRODUCT
} from "./config.js";

import { openModal } from "./ui.js";


/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Escape dynamic values before inserting them into HTML.
 *
 * @param {*} value
 * @returns {string}
 */
const escapeHTML = (value) => {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
};


/**
 * Check whether a feature is available in Free Access.
 *
 * @param {string} feature
 * @returns {boolean}
 */
const isFreeFeature = (feature) => {
  return FREE_ACCOUNT.freeFeatureOverrides.includes(feature);
};


/* ==========================================================================
   FREE FEATURE LIST
   ========================================================================== */

/**
 * Render the capabilities available to the Free Account.
 *
 * @param {HTMLElement} root
 */
function renderFreeFeatures(root) {

  const list = root.querySelector(
    "[data-free-feature-list]"
  );

  if (!list) return;

  const features = FREE_ACCOUNT.includedFeatures || [];

  list.innerHTML = features
    .map(
      (feature) => `
        <li>
          <span class="free-access-check">
            <i data-lucide="check"></i>
          </span>

          <span>
            ${escapeHTML(feature)}
          </span>
        </li>
      `
    )
    .join("");
}


/* ==========================================================================
   PREMIUM SUMMARY
   ========================================================================== */

/**
 * Render a compact summary of the paid Sultan Account.
 *
 * @param {HTMLElement} root
 */
function renderPremiumSummary(root) {

  const container = root.querySelector(
    "[data-premium-summary]"
  );

  if (!container) return;

  const categories = FEATURE_CATEGORIES || [];

  container.innerHTML = categories
    .map(
      (category) => `
        <div class="premium-summary-item">

          <span class="premium-summary-icon">
            <i data-lucide="${escapeHTML(category.icon)}"></i>
          </span>

          <div class="premium-summary-copy">

            <strong>
              ${escapeHTML(category.title)}
            </strong>

            <span>
              ${category.features.length} features
            </span>

          </div>

          <i
            class="premium-summary-lock"
            data-lucide="lock-keyhole"
          ></i>

        </div>
      `
    )
    .join("");
}


/* ==========================================================================
   FEATURE CATEGORY MATRIX
   ========================================================================== */

/**
 * Render every Sultan Account category.
 *
 * Free features receive a check state.
 * Premium-only features receive a locked state.
 *
 * @param {HTMLElement} root
 */
function renderFeatureCategories(root) {

  const container = root.querySelector(
    "[data-free-feature-categories]"
  );

  if (!container) return;

  const categories = FEATURE_CATEGORIES || [];

  container.innerHTML = categories
    .map((category) => {

      const total = category.features.length;

      const freeCount = category.features.filter(
        isFreeFeature
      ).length;

      const premiumCount = total - freeCount;

      return `
        <article
          class="free-feature-category"
          data-category="${escapeHTML(category.id)}"
        >

          <div class="free-feature-category-head">

            <div class="free-feature-category-title">

              <span class="free-feature-category-icon">
                <i data-lucide="${escapeHTML(category.icon)}"></i>
              </span>

              <div>
                <span class="free-feature-category-kicker">
                  CATEGORY
                </span>

                <h4>
                  ${escapeHTML(category.title)}
                </h4>
              </div>

            </div>

            <span class="free-feature-category-count">
              ${total}
            </span>

          </div>


          <p class="free-feature-category-description">
            ${escapeHTML(category.description)}
          </p>


          <div class="free-feature-category-stats">

            <span class="is-free">
              <i data-lucide="check"></i>
              ${freeCount} Free
            </span>

            <span class="is-premium">
              <i data-lucide="lock"></i>
              ${premiumCount} Premium
            </span>

          </div>


          <div class="free-feature-items">

            ${category.features
              .map((feature) => {

                const free = isFreeFeature(feature);

                return `
                  <div
                    class="free-feature-item ${free ? "is-free" : "is-premium"}"
                  >

                    <span class="free-feature-item-icon">
                      <i data-lucide="${free ? "check" : "lock"}"></i>
                    </span>

                    <span class="free-feature-item-name">
                      ${escapeHTML(feature)}
                    </span>

                    <span class="free-feature-item-status">
                      ${free ? "Included" : "Premium"}
                    </span>

                  </div>
                `;

              })
              .join("")}

          </div>

        </article>
      `;
    })
    .join("");
}


/* ==========================================================================
   STATISTICS
   ========================================================================== */

/**
 * Render Free Account statistics.
 *
 * @param {HTMLElement} root
 */
function renderStatistics(root) {

  const categories = FEATURE_CATEGORIES || [];

  const totalPremiumFeatures = categories.reduce(
    (total, category) =>
      total + category.features.length,
    0
  );

  const totalFreeFeatures =
    FREE_ACCOUNT.includedFeatures?.length || 0;

  const categoryCount = categories.length;


  root.querySelector(
    "[data-free-category-count]"
  )?.replaceChildren(
    document.createTextNode(String(categoryCount))
  );


  root.querySelector(
    "[data-free-feature-count]"
  )?.replaceChildren(
    document.createTextNode(String(totalFreeFeatures))
  );


  root.querySelector(
    "[data-premium-feature-count]"
  )?.replaceChildren(
    document.createTextNode(
      String(totalPremiumFeatures)
    )
  );


  root.querySelector(
    "[data-total-sultan-features]"
  )?.replaceChildren(
    document.createTextNode(
      String(totalPremiumFeatures)
    )
  );
}


/* ==========================================================================
   DOWNLOAD FLOW
   ========================================================================== */

/**
 * Confirm download before starting.
 */
function confirmDownload() {
  const downloadUrl = String(
    FREE_ACCOUNT.downloadUrl || ""
  ).trim();

  // Download package does not exist yet.
  // Show informational fallback only.
  if (!downloadUrl) {
    openComingSoon();
    return;
  }

  // Download package is available.
  // Show confirmation with the primary action.
  openModal({
    kicker: "FREE ACCOUNT",
    title: "Download your Free Account?",
    body:
      "You are about to download the Free Account package. Please confirm that you want to continue.",
    icon: "download",
    actionLabel: "Download",
    onAction: () => {
      startDownload(downloadUrl);
    }
  });
}


/**
 * Show Coming Soon state.
 */
function openComingSoon() {
  openModal({
    kicker: "COMING SOON",
    title: "Download is not available yet.",
    body:
      "The Free Account package is currently being prepared and will be available here soon.",
    icon: "clock-3"
  });
}


/**
 * Start actual download.
 *
 * @param {string} url
 */
function startDownload(url) {

  const link =
    document.createElement("a");

  link.href = url;
  link.download = "";
  link.rel = "noopener";

  document.body.appendChild(link);

  link.click();

  link.remove();
}


/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

/**
 * Render all Free Account UI.
 *
 * @param {HTMLElement} root
 */
export function renderFreeAccount(root) {

  if (!root) return;

  renderFreeFeatures(root);

  renderPremiumSummary(root);

  renderFeatureCategories(root);

  renderStatistics(root);

  window.lucide?.createIcons?.();
}


/**
 * Initialize Free Account interactions.
 *
 * @param {HTMLElement} root
 */
export function initFreeAccount(root) {

  if (!root) return;


  /* ------------------------------------------------------------------------
     Premium button
     ------------------------------------------------------------------------ */

  const upgradeButton =
    root.querySelector(
      "[data-free-account-upgrade]"
    );


  upgradeButton?.addEventListener(
    "click",
    () => {

      const target =
        document.querySelector(
          FREE_ACCOUNT.premiumTarget ||
          "#product"
        );


      if (!target) {

        openModal({

          kicker:
            "SULTAN ACCOUNT",

          title:
            "Premium information is unavailable.",

          body:
            "The Sultan Account section could not be found on this page.",

          icon:
            "crown"

        });

        return;
      }


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  );


  /* ------------------------------------------------------------------------
     Download button
     ------------------------------------------------------------------------ */

  const downloadButton =
    root.querySelector(
      "[data-free-account-download]"
    );


  downloadButton?.addEventListener(
    "click",
    confirmDownload
  );


  window.lucide?.createIcons?.();
}