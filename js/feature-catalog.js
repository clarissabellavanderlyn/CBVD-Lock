import { FEATURE_CATEGORIES } from "./config.js";

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const SEARCH_ALIASES = {
  acc: ["account"],
  acct: ["account"],
  bonus: ["reward", "premium"],
  coin: ["coins", "currency"],
  currency: ["currencies", "gold", "gems", "tickets"],
  curency: ["currency", "currencies"],
  delivery: ["handover", "digital delivery"],
  gem: ["gems"],
  gems: ["gem"],
  gold: ["golds"],
  item: ["items", "content"],
  items: ["item", "content"],
  login: ["access", "account"],
  payment: ["purchase", "transaction"],
  progres: ["progress", "progression"],
  progress: ["progression", "gameplay"],
  purch: ["purchase"],
  receipt: ["purchase", "transaction"],
  security: ["safety", "assurance"],
  support: ["assistance", "help"],
  ticket: ["tickets"],
  unlock: ["unlocked", "unlocking", "content"],
  verified: ["verification", "assurance"]
};

const normalize = (value) => String(value)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const tokens = (value) => normalize(value).split(/\s+/).filter(Boolean);

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  if (Math.abs(a.length - b.length) > 3) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      curr[j + 1] = Math.min(
        curr[j] + 1,
        prev[j + 1] + 1,
        prev[j] + (a[i] === b[j] ? 0 : 1)
      );
    }
    prev.splice(0, prev.length, ...curr);
  }
  return prev[b.length];
}

function fuzzyTokenScore(queryToken, candidateTokens) {
  if (!queryToken) return 0;
  let best = 0;
  for (const candidate of candidateTokens) {
    if (candidate === queryToken) return 1;
    if (candidate.startsWith(queryToken) || queryToken.startsWith(candidate)) best = Math.max(best, .92);
    if (candidate.includes(queryToken) || queryToken.includes(candidate)) best = Math.max(best, .84);
    const distance = levenshtein(queryToken, candidate);
    const tolerance = queryToken.length <= 4 ? 1 : queryToken.length <= 7 ? 2 : 3;
    if (distance <= tolerance) best = Math.max(best, 1 - distance / Math.max(queryToken.length, candidate.length));
  }
  return best;
}

function expandedTokens(query) {
  const base = tokens(query);
  const extra = base.flatMap(token => SEARCH_ALIASES[token] || []);
  return [...new Set([...base, ...tokens(extra.join(" "))])];
}

function scoreFeature(query, feature, category) {
  const q = normalize(query);
  if (!q) return 1;
  const featureNorm = normalize(feature);
  const categoryNorm = normalize(category.title);
  if (featureNorm.includes(q)) return 1.15;
  if (categoryNorm.includes(q)) return .9;

  const queryTokens = expandedTokens(q);
  const featureTokens = tokens(`${feature} ${category.title} ${category.description}`);
  const scores = queryTokens.map(token => fuzzyTokenScore(token, featureTokens));
  const matched = scores.filter(score => score >= .55);
  if (!matched.length) return 0;
  const coverage = matched.length / queryTokens.length;
  const average = matched.reduce((sum, value) => sum + value, 0) / matched.length;
  return average * .82 + coverage * .42;
}

function renderSearchHint(root, query, count, total) {
  const hint = root.querySelector("[data-search-hint]");
  if (!hint) return;
  if (!query.trim()) {
    hint.textContent = "Search understands partial words, common typos, and related terms.";
    return;
  }
  hint.textContent = count
    ? `${count} matching feature${count === 1 ? "" : "s"} • typo-tolerant search enabled`
    : `No direct match • try a shorter keyword like account, gems, unlock, or support`;
}

export function initFeatureCatalog(root) {
  if (!root) return;
  const nav = root.querySelector("[data-feature-category-nav]");
  const list = root.querySelector("[data-features]");
  const search = root.querySelector("[data-feature-search]");
  const resultCount = root.querySelector("[data-feature-result-count]");
  const categoryCount = root.querySelector("[data-category-count]");
  const totalCount = root.querySelector("[data-total-feature-count]");
  let activeCategory = "all";
  let query = "";
  let sortMode = "relevance";

  const total = FEATURE_CATEGORIES.reduce((sum, category) => sum + category.features.length, 0);
  totalCount && (totalCount.textContent = total);
  categoryCount && (categoryCount.textContent = FEATURE_CATEGORIES.length);

  const renderNav = () => {
    nav.innerHTML = `
      <button class="feature-category-btn is-active" type="button" data-category="all" role="tab" aria-selected="true">
        <span class="feature-category-icon"><i data-lucide="layout-grid"></i></span>
        <span><strong>All Features</strong><small>${total} included</small></span>
      </button>
      ${FEATURE_CATEGORIES.map(category => `
        <button class="feature-category-btn" type="button" data-category="${escapeHTML(category.id)}" role="tab" aria-selected="false" title="${escapeHTML(category.title)}">
          <span class="feature-category-icon"><i data-lucide="${escapeHTML(category.icon)}"></i></span>
          <span><strong>${escapeHTML(category.title)}</strong><small>${category.features.length} included</small></span>
        </button>
      `).join("")}
    `;
  };

  const getVisible = () => {
    const categories = activeCategory === "all"
      ? FEATURE_CATEGORIES
      : FEATURE_CATEGORIES.filter(category => category.id === activeCategory);
    return categories.flatMap(category => category.features
      .map(feature => ({ feature, category, score: scoreFeature(query, feature, category) }))
      .filter(item => !query.trim() || item.score >= .48)
    ).sort((a, b) => sortMode === "az" ? a.feature.localeCompare(b.feature) : b.score - a.score || a.feature.localeCompare(b.feature));
  };

  const renderList = () => {
    const items = getVisible();
    resultCount && (resultCount.textContent = `${items.length} feature${items.length === 1 ? "" : "s"}`);
    renderSearchHint(root, query, items.length, total);
    if (!items.length) {
      list.innerHTML = `
        <div class="feature-empty">
          <span class="feature-empty-icon"><i data-lucide="search-x"></i></span>
          <strong>No matching features</strong>
          <p>Try a shorter keyword, another spelling, or switch to All Features.</p>
          <div class="feature-suggestions">
            <button type="button" data-suggestion="account">Account</button>
            <button type="button" data-suggestion="unlock">Unlock</button>
            <button type="button" data-suggestion="gems">Gems</button>
            <button type="button" data-suggestion="support">Support</button>
          </div>
        </div>
      `;
    } else {
      list.innerHTML = items.map(({ feature, category }) => `
        <div class="feature-item" data-feature-category="${escapeHTML(category.id)}">
          <span class="feature-check"><i data-lucide="check"></i></span>
          <span class="feature-item-copy"><strong>${escapeHTML(feature)}</strong>${query.trim() ? `<small>${escapeHTML(category.title)}</small>` : ""}</span>
        </div>
      `).join("");
    }
    window.lucide?.createIcons?.();
  };

  renderNav();
  renderList();

  nav.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    nav.querySelectorAll("[data-category]").forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    renderList();
  });

  const clear = root.querySelector("[data-feature-clear]");
  const sort = root.querySelector("[data-feature-sort]");
  search?.addEventListener("input", event => {
    query = event.target.value;
    if (clear) clear.hidden = !query;
    renderList();
  });
  clear?.addEventListener("click", () => { search.value = ""; query = ""; clear.hidden = true; search.focus(); renderList(); });
  sort?.addEventListener("change", event => { sortMode = event.target.value; renderList(); });

  list.addEventListener("click", event => {
    const suggestion = event.target.closest("[data-suggestion]");
    if (!suggestion || !search) return;
    search.value = suggestion.dataset.suggestion;
    query = search.value;
    search.focus();
    renderList();
  });

  window.lucide?.createIcons?.();
}
