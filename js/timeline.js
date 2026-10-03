import { getActivities } from "./analytics.js";

/* ==========================================================================
   TIMELINE CONFIGURATION
   ========================================================================== */

const ITEMS_PER_PAGE = 10;

let currentPage = 1;


/* ==========================================================================
   TIMELINE HELPERS
   ========================================================================== */

/**
 * Returns the appropriate Lucide icon for an activity type.
 *
 * @param {string} type
 * @returns {string}
 */
const icon = (type) => ({
  unlock: "unlock-keyhole",
  step: "check-circle-2",
  verification: "shield-check",
  purchase: "shopping-bag",
  support: "headset",
  system: "sparkles"
}[type] || "circle");


/**
 * Formats a timestamp using the browser's locale.
 *
 * @param {number|string} timestamp
 * @returns {string}
 */
const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(new Date(timestamp));
};


/**
 * Escapes dynamic text before inserting it into HTML.
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
 * Calculates the total number of pages.
 *
 * @param {number} totalItems
 * @returns {number}
 */
const getTotalPages = (totalItems) => {
  return Math.max(
    1,
    Math.ceil(totalItems / ITEMS_PER_PAGE)
  );
};


/**
 * Returns only the activities belonging to the current page.
 *
 * @param {Array} items
 * @param {number} page
 * @returns {Array}
 */
const getPageItems = (items, page) => {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  return items.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
};


/* ==========================================================================
   PAGINATION
   ========================================================================== */

/**
 * Generates a compact pagination range.
 *
 * Example:
 * 1 2 3 ... 10
 *
 * @param {number} current
 * @param {number} total
 * @returns {Array<number|string>}
 */
const getPaginationRange = (current, total) => {
  /*
   * If the total page count is small, show every page.
   */
  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, index) => index + 1
    );
  }

  const pages = new Set([
    1,
    total,
    current,
    current - 1,
    current + 1,
    current - 2,
    current + 2
  ]);

  const validPages = [...pages]
    .filter(
      (page) =>
        page >= 1 &&
        page <= total
    )
    .sort((a, b) => a - b);

  const result = [];

  validPages.forEach((page, index) => {
    const previousPage = validPages[index - 1];

    if (
      previousPage &&
      page - previousPage > 1
    ) {
      result.push("...");
    }

    result.push(page);
  });

  return result;
};


/**
 * Renders pagination controls.
 *
 * @param {HTMLElement} root
 * @param {number} totalItems
 */
const renderPagination = (root, totalItems) => {
  const totalPages = getTotalPages(totalItems);

  /*
   * No pagination is necessary when there is only one page.
   */
  if (totalPages <= 1) {
    return "";
  }

  const range = getPaginationRange(
    currentPage,
    totalPages
  );

  return `
    <nav
      class="timeline-pagination"
      aria-label="Activity timeline pagination"
    >

      <button
        class="timeline-page-btn timeline-page-arrow"
        type="button"
        data-timeline-page="${currentPage - 1}"
        ${currentPage === 1 ? "disabled" : ""}
        aria-label="Previous page"
      >
        <i data-lucide="chevron-left"></i>
      </button>

      <div class="timeline-page-numbers">
        ${range.map((page) => {
    if (page === "...") {
      return `
              <span
                class="timeline-page-ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            `;
    }

    return `
            <button
              class="timeline-page-btn ${page === currentPage ? "is-active" : ""}"
              type="button"
              data-timeline-page="${page}"
              aria-label="Go to page ${page}"
              ${page === currentPage ? 'aria-current="page"' : ""}
            >
              ${page}
            </button>
          `;
  }).join("")}
      </div>

      <button
        class="timeline-page-btn timeline-page-arrow"
        type="button"
        data-timeline-page="${currentPage + 1}"
        ${currentPage === totalPages ? "disabled" : ""}
        aria-label="Next page"
      >
        <i data-lucide="chevron-right"></i>
      </button>

    </nav>
  `;
};


/* ==========================================================================
   TIMELINE RENDERING
   ========================================================================== */

/**
 * Renders the Activity Timeline.
 *
 * @param {HTMLElement} root
 */
export function renderTimeline(root) {
  if (!root) return;

  const items = getActivities();

  const totalPages = getTotalPages(
    items.length
  );

  /*
   * Prevent the current page from becoming invalid
   * after activity data changes.
   */
  currentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const visibleItems = getPageItems(
    items,
    currentPage
  );

  root.innerHTML = `
    <div class="timeline-head">

      <div>
        <span class="eyebrow">
          ACTIVITY TIMELINE
        </span>

        <h2 id="activity-title">
          Recent activity
        </h2>

        <p>
          A local history of important actions on this device.
        </p>
      </div>

      <span class="timeline-count">
        ${items.length}
      </span>

    </div>

    <div class="timeline-list">

      ${visibleItems.length

      ? visibleItems.map((item) => `
              <article class="timeline-item">

                <span class="timeline-icon">
                  <i data-lucide="${icon(item.type)}"></i>
                </span>

                <div>
                  <strong>
                    ${escapeHTML(item.title)}
                  </strong>

                  ${item.detail
          ? `<p>${escapeHTML(item.detail)}</p>`
          : ""
        }

                  <time
                    datetime="${new Date(item.at).toISOString()}"
                  >
                    ${formatDate(item.at)}
                  </time>
                </div>

              </article>
            `).join("")

      : `
            <div class="timeline-empty">

              <i data-lucide="clock-3"></i>

              <strong>
                No activity yet
              </strong>

              <p>
                Your important actions will appear here automatically.
              </p>

            </div>
          `
    }

    </div>

    ${items.length
      ? renderPagination(root, items.length)
      : ""
    }
  `;

  /*
   * Activate Lucide icons after HTML rendering.
   */
  window.lucide?.createIcons?.();

  /*
   * Attach pagination handlers.
   */
  root
    .querySelectorAll("[data-timeline-page]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const targetPage = Number(
          button.dataset.timelinePage
        );

        if (!Number.isFinite(targetPage)) {
          return;
        }

        if (
          targetPage < 1 ||
          targetPage > totalPages ||
          targetPage === currentPage
        ) {
          return;
        }

        currentPage = targetPage;

        renderTimeline(root);

        /*
         * Keep the timeline visible after changing page.
         */
        root.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

    });
}


/* ==========================================================================
   TIMELINE INITIALIZATION
   ========================================================================== */

/**
 * Initializes the Activity Timeline.
 *
 * @param {HTMLElement} root
 */
export function initTimeline(root) {
  if (!root) return;

  renderTimeline(root);

  /*
   * Re-render whenever a new activity is recorded.
   *
   * New activity is inserted at the beginning of the list,
   * so the user automatically sees the latest entries.
   */
  window.addEventListener(
    "cbvd:activity",
    () => {
      currentPage = 1;
      renderTimeline(root);
    }
  );
}